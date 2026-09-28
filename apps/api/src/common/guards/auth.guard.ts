import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    let token = '';

    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if ((request as any).cookies?.gypsym_admin_token) {
      token = (request as any).cookies.gypsym_admin_token;
    }

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing. Please log in.');
    }

    try {
      const user = await this.authService.validateSession(token);
      (request as any).user = user;
      return true;
    } catch (err: any) {
      throw new UnauthorizedException(err.message || 'Invalid or expired session. Please log in again.');
    }
  }
}
