import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Headers,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, LoginDto } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] as string;

    const result = await this.authService.login(dto, { ipAddress, userAgent });
    const sessionDays = result.sessionExpiryDays || 7;
    const maxAgeMs = sessionDays * 24 * 60 * 60 * 1000;

    // Set secure auth cookie for same-domain or localhost Next.js app
    res.cookie('gypsym_admin_token', result.token, {
      httpOnly: false, // allow reading by client middleware / fetch
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeMs,
    });

    return {
      success: true,
      ...result,
    };
  }

  @Get('security-settings')
  @UseGuards(AuthGuard)
  async getSecuritySettings() {
    return this.authService.getSecurityConfig();
  }

  @Put('security-settings')
  @UseGuards(AuthGuard)
  async updateSecuritySettings(@Body() body: any) {
    return this.authService.updateSecurityConfig(body);
  }

  @Get('blocked-ips')
  @UseGuards(AuthGuard)
  async getBlockedIps() {
    return this.authService.getBlockedIps();
  }

  @Post('unblock-ip')
  @UseGuards(AuthGuard)
  async unblockIp(@Body('ip') ip: string) {
    const success = this.authService.unblockIp(ip);
    return { success, message: `IP ${ip} unblocked successfully.` };
  }

  @Get('me')
  async getMe(@Headers('authorization') authHeader?: string, @Req() req?: Request) {
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req?.cookies?.gypsym_admin_token) {
      token = req.cookies.gypsym_admin_token;
    }

    if (!token) {
      throw new UnauthorizedException('Authentication token is required.');
    }

    const user = await this.authService.validateSession(token);
    return {
      success: true,
      data: user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Headers('authorization') authHeader?: string,
    @Req() req?: Request,
    @Res({ passthrough: true }) res?: Response
  ) {
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req?.cookies?.gypsym_admin_token) {
      token = req.cookies.gypsym_admin_token;
    }

    await this.authService.logout(token);

    // Clear cookie
    res?.clearCookie('gypsym_admin_token', { path: '/' });

    return {
      success: true,
      message: 'Logged out successfully.',
    };
  }
}
