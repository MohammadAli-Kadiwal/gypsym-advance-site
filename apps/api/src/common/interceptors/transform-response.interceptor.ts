import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiSuccessResponse } from '@gypsym/shared-types';
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from '../middleware/correlation-id.middleware';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    const req = context.switchToHttp().getRequest<Request>();
    const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) || '';
    const requestId = (req.headers[REQUEST_ID_HEADER] as string) || '';

    return next.handle().pipe(
      map((data) => {
        // If the controller already returned a structure with data & meta
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
            timestamp: new Date().toISOString(),
            requestId,
            correlationId,
          };
        }

        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          requestId,
          correlationId,
        };
      }),
    );
  }
}
