import { Injectable, Logger, UnauthorizedException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    role: string;
    permissions: string[];
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory rate limiting and brute force tracking: key -> { count, lockedUntil }
  private readonly failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}


  private getJwtSecret(): string {
    return (
      this.configService.get<string>('auth.jwtAccessSecret') ||
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET ||
      'gypsym_jwt_default_enterprise_cluster_secret_fallback_key_2026'
    );
  }

  /**
   * Sign HS256 JWT Token using Node.js crypto.
   */
  private signJwt(payload: any): string {
    const secret = this.getJwtSecret();
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  /**
   * Verify and decode HS256 JWT Token.
   */
  private verifyJwt<T = any>(token: string): T | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const headerB64 = parts[0]!;
      const bodyB64 = parts[1]!;
      const signature = parts[2]!;
      const secret = this.getJwtSecret();
      const expectedSig = crypto.createHmac('sha256', secret).update(`${headerB64}.${bodyB64}`).digest('base64url');
      if (signature !== expectedSig) return null;

      const payload = JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf8'));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return null; // expired
      }
      return payload as T;
    } catch {
      return null;
    }
  }

  /**
   * Secure password verification using scrypt.
   */
  private verifyPassword(password: string, hash: string): boolean {
    if (!password || !hash) return false;
    const parts = hash.split(':');
    if (parts.length === 3 && parts[0] === 'scrypt') {
      const salt = parts[1]!;
      const keyHex = parts[2]!;
      try {
        const derivedKey = crypto.scryptSync(password, salt, 64);
        return crypto.timingSafeEqual(Buffer.from(keyHex, 'hex'), derivedKey);
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Fetch dynamic security and brute-force protection configuration from database
   */
  async getSecurityConfig(): Promise<{
    maxFailedAttempts: number;
    lockoutDurationMinutes: number;
    sessionExpiryDays: number;
    ipBlockEnabled: boolean;
  }> {
    try {
      const setting = await this.prisma.siteSetting.findUnique({
        where: { key: 'security:auth_protection' },
      });
      const val = setting?.value as any;
      return {
        maxFailedAttempts: Math.max(1, Number(val?.maxFailedAttempts) || 5),
        lockoutDurationMinutes: Math.max(1, Number(val?.lockoutDurationMinutes) || 15),
        sessionExpiryDays: Math.max(1, Number(val?.sessionExpiryDays) || 7),
        ipBlockEnabled: val?.ipBlockEnabled !== false,
      };
    } catch {
      return {
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 15,
        sessionExpiryDays: 7,
        ipBlockEnabled: true,
      };
    }
  }

  /**
   * Save dynamic security and brute-force protection configuration to database
   */
  async updateSecurityConfig(data: any) {
    const config = {
      maxFailedAttempts: Math.max(1, Number(data.maxFailedAttempts) || 5),
      lockoutDurationMinutes: Math.max(1, Number(data.lockoutDurationMinutes) || 15),
      sessionExpiryDays: Math.max(1, Number(data.sessionExpiryDays) || 7),
      ipBlockEnabled: data.ipBlockEnabled !== false,
    };

    const existing = await this.prisma.siteSetting.findUnique({
      where: { key: 'security:auth_protection' },
    });

    if (existing) {
      await this.prisma.siteSetting.update({
        where: { key: 'security:auth_protection' },
        data: { value: config, category: 'security', isPublic: false },
      });
    } else {
      await this.prisma.siteSetting.create({
        data: {
          key: 'security:auth_protection',
          category: 'security',
          value: config,
          isPublic: false,
        },
      });
    }

    this.logger.log(`Security configuration updated: maxAttempts=${config.maxFailedAttempts}, lockoutMinutes=${config.lockoutDurationMinutes}, sessionDays=${config.sessionExpiryDays}`);
    return config;
  }

  /**
   * Retrieve list of currently locked out IP addresses
   */
  getBlockedIps(): Array<{ ip: string; failedCount: number; lockedUntil: string; remainingMinutes: number }> {
    const now = Date.now();
    const result: Array<{ ip: string; failedCount: number; lockedUntil: string; remainingMinutes: number }> = [];

    for (const [key, record] of this.failedAttempts.entries()) {
      if (key.startsWith('ip_') && record.lockedUntil > now) {
        const ip = key.replace('ip_', '');
        const remainingMinutes = Math.ceil((record.lockedUntil - now) / (60 * 1000));
        result.push({
          ip,
          failedCount: record.count,
          lockedUntil: new Date(record.lockedUntil).toISOString(),
          remainingMinutes,
        });
      }
    }
    return result;
  }

  /**
   * Administrator action to unblock a specific IP address
   */
  unblockIp(ip: string): boolean {
    const cleanIp = (ip ? ip.split(',')[0] || 'unknown_ip' : 'unknown_ip').trim();
    const key = `ip_${cleanIp}`;
    const deleted = this.failedAttempts.delete(key);
    this.logger.log(`[Security Action] Administrator unblocked IP address: ${cleanIp}`);
    return deleted;
  }

  private recordFailedAttempt(ip: string, maxAttempts: number, lockoutMinutes: number) {
    const now = Date.now();
    const cleanIp = (ip ? ip.split(',')[0] || 'unknown_ip' : 'unknown_ip').trim();
    const key = `ip_${cleanIp}`;

    const record = this.failedAttempts.get(key) || { count: 0, lockedUntil: 0 };
    record.count += 1;
    if (record.count >= maxAttempts) {
      record.lockedUntil = now + lockoutMinutes * 60 * 1000;
      this.logger.warn(`[Security Alert] IP ${cleanIp} exceeded ${maxAttempts} failed login attempts. Blocked for ${lockoutMinutes} minutes.`);
    }
    this.failedAttempts.set(key, record);
    return record.count;
  }

  /**
   * Authenticate user with Email & Password, creates a Session record, and returns signed JWT.
   */
  async login(
    dto: LoginDto,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthResponse & { sessionExpiryDays: number }> {
    const email = (dto.email || '').trim().toLowerCase();
    const password = dto.password || '';
    const rawIp = meta?.ipAddress || 'unknown_ip';
    const clientIp = (rawIp.split(',')[0] || 'unknown_ip').trim();
    const ipKey = `ip_${clientIp}`;

    const security = await this.getSecurityConfig();

    // 1. Check IP brute-force lockout
    if (security.ipBlockEnabled) {
      const ipRecord = this.failedAttempts.get(ipKey);
      if (ipRecord && ipRecord.lockedUntil > Date.now()) {
        const remainingMinutes = Math.ceil((ipRecord.lockedUntil - Date.now()) / (60 * 1000));
        throw new HttpException(
          `Security Alert: Your IP address (${clientIp}) has been temporarily blocked due to ${security.maxFailedAttempts} consecutive failed password attempts. Access is locked for ${remainingMinutes} more minute(s). Please try again later or contact your administrator.`,
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
    }

    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        deletedAt: null,
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      const currentFailures = this.recordFailedAttempt(clientIp, security.maxFailedAttempts, security.lockoutDurationMinutes);
      const remaining = Math.max(0, security.maxFailedAttempts - currentFailures);
      this.logger.warn(`Failed login attempt: User not found for email ${email} from IP ${clientIp} (${currentFailures}/${security.maxFailedAttempts})`);
      throw new UnauthorizedException(
        remaining > 0
          ? `Invalid email or password. You have ${remaining} attempt(s) remaining before your IP is blocked.`
          : `Invalid email or password. Your IP has been temporarily blocked for ${security.lockoutDurationMinutes} minutes.`
      );
    }

    if (!user.isActive) {
      this.logger.warn(`Failed login attempt: Inactive account for email ${email} from IP ${clientIp}`);
      throw new UnauthorizedException('Account has been deactivated. Please contact support.');
    }

    const isPasswordValid = this.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      const currentFailures = this.recordFailedAttempt(clientIp, security.maxFailedAttempts, security.lockoutDurationMinutes);
      const remaining = Math.max(0, security.maxFailedAttempts - currentFailures);
      this.logger.warn(`Failed login attempt: Incorrect password for email ${email} from IP ${clientIp} (${currentFailures}/${security.maxFailedAttempts})`);
      throw new UnauthorizedException(
        remaining > 0
          ? `Invalid email or password. You have ${remaining} attempt(s) remaining before your IP is blocked.`
          : `Invalid email or password. Your IP has been temporarily blocked for ${security.lockoutDurationMinutes} minutes.`
      );
    }

    // Success: clear failed attempts for this IP address
    this.failedAttempts.delete(ipKey);

    // Determine configured session expiry from security settings (default 7 days)
    const sessionDays = security.sessionExpiryDays || 7;
    const expiryMs = sessionDays * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expiryMs);

    const jti = crypto.randomUUID();
    const familyId = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(`${jti}-${user.id}-${Date.now()}`).digest('hex');

    // Persist session in PostgreSQL database
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        jti,
        familyId,
        tokenHash,
        ipAddress: meta?.ipAddress || null,
        userAgent: meta?.userAgent || null,
        expiresAt,
        isRevoked: false,
      },
    });

    // Update lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const primaryRole = user.userRoles[0]?.role.key || 'SUPER_ADMIN';
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.key)
        )
      )
    );

    // If SUPER_ADMIN, ensure wildcard '*' permission
    if (primaryRole === 'SUPER_ADMIN' && !permissions.includes('*')) {
      permissions.unshift('*');
    }

    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: primaryRole,
      sessionId: session.id,
      jti,
      exp: Math.floor(expiresAt.getTime() / 1000),
      iat: Math.floor(Date.now() / 1000),
    };

    const token = this.signJwt(jwtPayload);

    this.logger.log(`User ${user.email} authenticated successfully. Session expires at ${expiresAt.toISOString()}`);

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim() || 'Admin',
        role: primaryRole,
        permissions,
      },
      sessionExpiryDays: sessionDays,
    };
  }

  /**
   * Validate session token from Bearer header or cookie.
   */
  async validateSession(token: string): Promise<AuthResponse['user']> {
    if (!token) {
      throw new UnauthorizedException('Authentication token is missing.');
    }

    const payload = this.verifyJwt<{
      sub: string;
      email: string;
      role: string;
      sessionId: string;
      jti: string;
      exp: number;
    }>(token);

    if (!payload || !payload.sub || !payload.sessionId) {
      throw new UnauthorizedException('Authentication token is invalid or expired.');
    }

    // Check session in database
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.isRevoked || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Session has expired or was revoked. Please log in again.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('User account is invalid or suspended.');
    }

    const primaryRole = user.userRoles[0]?.role.key || 'SUPER_ADMIN';
    const permissions = Array.from(
      new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.key)
        )
      )
    );

    if (primaryRole === 'SUPER_ADMIN' && !permissions.includes('*')) {
      permissions.unshift('*');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim() || 'Admin',
      role: primaryRole,
      permissions,
    };
  }

  /**
   * Terminate active session in database.
   */
  async logout(token: string): Promise<{ success: boolean; message: string }> {
    if (!token) return { success: true, message: 'Logged out successfully.' };

    const payload = this.verifyJwt<{ sessionId: string }>(token);
    if (payload?.sessionId) {
      await this.prisma.session
        .update({
          where: { id: payload.sessionId },
          data: { isRevoked: true },
        })
        .catch(() => null);
    }

    return { success: true, message: 'Logged out successfully.' };
  }
}
