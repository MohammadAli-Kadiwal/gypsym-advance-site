import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse, ValidationErrorDetail } from '@gypsym/shared-types';
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from '../middleware/correlation-id.middleware';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request.headers[CORRELATION_ID_HEADER] as string) || 'N/A';
    const requestId = (request.headers[REQUEST_ID_HEADER] as string) || 'N/A';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal server error occurred';
    let details: ValidationErrorDetail[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        errorCode = exception.name.replace('Exception', '').toUpperCase();
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj['message'] as string) || exception.message;
        errorCode = (resObj['error'] as string) || exception.name.replace('Exception', '').toUpperCase();

        if (Array.isArray(resObj['message'])) {
          details = resObj['message'].map((item: unknown) => {
            if (typeof item === 'string') {
              return { issue: item };
            }
            return item as ValidationErrorDetail;
          });
          message = 'Validation failed';
          errorCode = 'VALIDATION_ERROR';
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `[${correlationId}] Unhandled exception: ${exception.message}`,
        exception.stack,
      );
      message = process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
    }

    const payload: ApiErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
      requestId,
      correlationId,
    };

    response.status(status).json(payload);
  }
}
