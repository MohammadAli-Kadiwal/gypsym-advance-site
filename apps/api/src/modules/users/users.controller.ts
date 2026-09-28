import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@gypsym/database';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.SYSTEM_ADMIN)
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.SYSTEM_ADMIN)
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  async createUser(@Body() dto: CreateUserDto, @Req() req: any) {
    return this.usersService.createUser(dto, req.user);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: any
  ) {
    const currentUser = req.user;
    return this.usersService.updateUser(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles(RoleType.SUPER_ADMIN)
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    const currentUser = req.user;
    return this.usersService.deleteUser(id, currentUser);
  }
}
