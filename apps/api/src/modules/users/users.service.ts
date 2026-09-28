import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RoleType } from '@gypsym/database';
import * as crypto from 'crypto';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: RoleType;
  isActive?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: RoleType;
  isActive?: boolean;
  password?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        sessions: {
          where: { isRevoked: false, expiresAt: { gt: new Date() } },
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
          },
        },
      },
    });

    return users.map((u) => {
      const primaryRole = u.userRoles[0]?.role.key || 'CONTENT_EDITOR';
      return {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        name: `${u.firstName} ${u.lastName}`.trim(),
        role: primaryRole,
        roles: u.userRoles.map((ur) => ur.role.key),
        isActive: u.isActive,
        isTwoFactorEnabled: u.isTwoFactorEnabled,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        activeSessionsCount: u.sessions.length,
      };
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      role: user.userRoles[0]?.role.key || 'CONTENT_EDITOR',
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  async createUser(dto: CreateUserDto) {
    const email = dto.email?.trim().toLowerCase();
    if (!email) {
      throw new BadRequestException('Email is required.');
    }
    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long.');
    }

    const existing = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null },
    });

    if (existing) {
      throw new BadRequestException(`A user with email ${email} already exists.`);
    }

    // Find role
    const roleRecord = await this.prisma.role.findUnique({
      where: { key: dto.role || RoleType.CONTENT_EDITOR },
    });

    if (!roleRecord) {
      throw new BadRequestException(`Role ${dto.role} does not exist.`);
    }

    const passwordHash = this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: dto.firstName || '',
        lastName: dto.lastName || '',
        isActive: dto.isActive ?? true,
        userRoles: {
          create: {
            roleId: roleRecord.id,
          },
        },
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    this.logger.log(`Created new user: ${email} (${user.id}) with role ${roleRecord.key}`);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      role: roleRecord.key,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    currentUser: { id: string; role: string }
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    const isSuperAdmin = currentUser.role === RoleType.SUPER_ADMIN;
    const isSelf = currentUser.id === id;

    // Check permissions: Only Super Admin or the user themselves can edit
    if (!isSuperAdmin && !isSelf) {
      throw new ForbiddenException('You do not have permission to modify this user account.');
    }

    // Role change permissions: Only Super Admin can change roles
    if (dto.role && !isSuperAdmin) {
      throw new ForbiddenException('Only Super Admins can modify user roles.');
    }

    const updateData: any = {};
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.isActive !== undefined && isSuperAdmin) {
      // Prevent deactivating self if super admin
      if (isSelf && dto.isActive === false) {
        throw new BadRequestException('You cannot deactivate your own Super Admin account.');
      }
      updateData.isActive = dto.isActive;
    }

    let passwordChanged = false;
    // Password change logic:
    // Only Super Admin or self can change password
    if (dto.password && dto.password.trim().length > 0) {
      if (!isSuperAdmin && !isSelf) {
        throw new ForbiddenException('Only Super Admins or the user can change passwords.');
      }
      if (dto.password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long.');
      }
      updateData.passwordHash = this.hashPassword(dto.password);
      passwordChanged = true;
    }

    // Execute user update
    await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Update role if changed
    if (dto.role && isSuperAdmin) {
      const newRole = await this.prisma.role.findUnique({
        where: { key: dto.role },
      });
      if (newRole) {
        await this.prisma.userRole.deleteMany({
          where: { userId: id },
        });
        await this.prisma.userRole.create({
          data: {
            userId: id,
            roleId: newRole.id,
          },
        });
      }
    }

    // AUTO-LOGOUT / SESSION REVOCATION:
    // When password is changed by Super Admin or user, revoke all active sessions in the database
    if (passwordChanged) {
      const revoked = await this.prisma.session.updateMany({
        where: { userId: id, isRevoked: false },
        data: { isRevoked: true },
      });
      this.logger.warn(
        `Password updated for user ${user.email} (${id}). Revoked ${revoked.count} active sessions immediately.`
      );
    }

    const updatedUser = await this.getUserById(id);

    return {
      ...updatedUser,
      passwordChanged,
      isSelf,
    };
  }

  async deleteUser(id: string, currentUser: { id: string; role: string }) {
    if (currentUser.role !== RoleType.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admins can delete users.');
    }

    if (currentUser.id === id) {
      throw new BadRequestException('You cannot delete your own Super Admin account.');
    }

    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // Revoke sessions
    await this.prisma.session.updateMany({
      where: { userId: id, isRevoked: false },
      data: { isRevoked: true },
    });

    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return { success: true, message: `User ${user.email} has been deactivated and deleted.` };
  }
}
