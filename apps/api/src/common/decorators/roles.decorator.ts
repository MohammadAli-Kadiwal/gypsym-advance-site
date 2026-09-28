import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@gypsym/database';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (RoleType | string)[]) => SetMetadata(ROLES_KEY, roles);
