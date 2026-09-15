import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface RecaptchaSettingsPayload {
  enabled: boolean;
  siteKey: string;
  secretKey: string;
  minScore: number;
}

export interface PublicRecaptchaConfig {
  enabled: boolean;
  siteKey: string;
}

export interface AdminRecaptchaConfig {
  enabled: boolean;
  siteKey: string;
  hasSecretKey: boolean;
  maskedSecretKey: string;
  minScore: number;
  isConfigured: boolean;
}

export interface UpdateRecaptchaDto {
  enabled?: boolean;
  siteKey?: string;
  secretKey?: string;
  minScore?: number;
}

export interface RecaptchaVerificationResult {
  success: boolean;
  score: number;
  action?: string;
  hostname?: string;
  errorCodes?: string[];
}

@Injectable()
export class RecaptchaService {
  private readonly logger = new Logger(RecaptchaService.name);
  private readonly SETTING_KEY = 'recaptcha_settings';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to mask a sensitive secret key.
   */
  private maskKey(key: string): string {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
  }

  /**
   * Retrieves raw resolved configuration from database or env fallbacks.
   */
  async getRawConfig(): Promise<RecaptchaSettingsPayload> {
    const row = await this.prisma.siteSetting
      .findUnique({ where: { key: this.SETTING_KEY } })
      .catch(() => null);

    const val = (row?.value as Record<string, any>) || {};

    const enabled = typeof val.enabled === 'boolean' ? val.enabled : false;
    const siteKey = String(val.siteKey || process.env.RECAPTCHA_SITE_KEY || '').trim();
    const secretKey = String(val.secretKey || process.env.RECAPTCHA_SECRET_KEY || '').trim();
    const minScore =
      typeof val.minScore === 'number' && !isNaN(val.minScore) ? Math.max(0, Math.min(1, val.minScore)) : 0.5;

    return {
      enabled,
      siteKey,
      secretKey,
      minScore,
    };
  }

  /**
   * Public config exposed to frontend web applications.
   * Never leaks secret key or internal configuration details.
   */
  async getPublicConfig(): Promise<PublicRecaptchaConfig> {
    const config = await this.getRawConfig();
    const isReady = config.enabled && Boolean(config.siteKey);

    return {
      enabled: isReady,
      siteKey: isReady ? config.siteKey : '',
    };
  }

  /**
   * Admin-facing configuration with masked secret key.
   */
  async getAdminConfig(): Promise<AdminRecaptchaConfig> {
    const config = await this.getRawConfig();

    return {
      enabled: config.enabled,
      siteKey: config.siteKey,
      hasSecretKey: Boolean(config.secretKey),
      maskedSecretKey: this.maskKey(config.secretKey),
      minScore: config.minScore,
      isConfigured: Boolean(config.siteKey && config.secretKey),
    };
  }

  /**
   * Save or update reCAPTCHA v3 configuration in database.
   */
  async saveConfig(dto: UpdateRecaptchaDto, actorId?: string): Promise<AdminRecaptchaConfig> {
    const existing = await this.getRawConfig();

    let secretKey = existing.secretKey;
    if (dto.secretKey && dto.secretKey.trim() && !dto.secretKey.includes('••')) {
      secretKey = dto.secretKey.trim();
    }

    const payload: RecaptchaSettingsPayload = {
      enabled: typeof dto.enabled === 'boolean' ? dto.enabled : existing.enabled,
      siteKey: typeof dto.siteKey === 'string' ? dto.siteKey.trim() : existing.siteKey,
      secretKey,
      minScore:
        typeof dto.minScore === 'number' && !isNaN(dto.minScore)
          ? Math.max(0, Math.min(1, dto.minScore))
          : existing.minScore,
    };

    await this.prisma.siteSetting.upsert({
      where: { key: this.SETTING_KEY },
      create: {
        key: this.SETTING_KEY,
        category: 'security',
        value: payload as any,
        isPublic: false,
        ...(actorId ? { updatedBy: actorId } : {}),
      },
      update: {
        value: payload as any,
        ...(actorId ? { updatedBy: actorId } : {}),
      },
    });

    this.logger.log(`reCAPTCHA settings updated by ${actorId || 'system'}. Enabled: ${payload.enabled}`);
    return this.getAdminConfig();
  }

  /**
   * Verifies a Google reCAPTCHA v3 token.
   * If reCAPTCHA is not enabled or not fully configured, passes gracefully.
   */
  async verifyToken(token?: string | null, clientIp?: string): Promise<RecaptchaVerificationResult> {
    const config = await this.getRawConfig();

    // If reCAPTCHA is disabled or keys are missing, gracefully allow submission
    if (!config.enabled || !config.secretKey) {
      return {
        success: true,
        score: 1.0,
      };
    }

    if (!token || typeof token !== 'string' || !token.trim()) {
      this.logger.warn(`reCAPTCHA verification failed: missing token from IP ${clientIp || 'unknown'}`);
      return {
        success: false,
        score: 0.0,
        errorCodes: ['missing-input-response'],
      };
    }

    try {
      const params = new URLSearchParams();
      params.append('secret', config.secretKey);
      params.append('response', token.trim());
      if (clientIp && clientIp !== 'unknown') {
        params.append('remoteip', clientIp);
      }

      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        this.logger.error(`Google reCAPTCHA verification endpoint returned status ${response.status}`);
        return {
          success: false,
          score: 0.0,
          errorCodes: [`http-status-${response.status}`],
        };
      }

      const data = (await response.json()) as {
        success: boolean;
        score?: number;
        action?: string;
        challenge_ts?: string;
        hostname?: string;
        'error-codes'?: string[];
      };

      const score = typeof data.score === 'number' ? data.score : data.success ? 1.0 : 0.0;
      const passesThreshold = data.success && score >= config.minScore;

      if (!passesThreshold) {
        this.logger.warn(
          `reCAPTCHA verification failed: success=${data.success}, score=${score}, threshold=${config.minScore}, action=${data.action}, errors=${JSON.stringify(data['error-codes'])}`
        );
      } else {
        this.logger.log(`reCAPTCHA verified successfully: score=${score}, action=${data.action}`);
      }

      return {
        success: passesThreshold,
        score,
        action: data.action,
        hostname: data.hostname,
        errorCodes: data['error-codes'],
      };
    } catch (err: any) {
      this.logger.error(`reCAPTCHA verification request error: ${err.message}`, err.stack);
      // Fail closed if explicitly enabled
      return {
        success: false,
        score: 0.0,
        errorCodes: ['network-error'],
      };
    }
  }

  /**
   * Guard method to check submission in controllers/services. Throws BadRequestException if bot.
   */
  async validateSubmissionOrThrow(token?: string | null, clientIp?: string): Promise<number> {
    const result = await this.verifyToken(token, clientIp);
    if (!result.success) {
      throw new BadRequestException(
        'Security verification failed: submission flagged by bot protection. Please reload and try again.'
      );
    }
    return result.score;
  }
}
