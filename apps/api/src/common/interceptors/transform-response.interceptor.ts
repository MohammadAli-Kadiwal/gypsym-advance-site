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

function serializeBigInts(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') {
    const num = Number(value);
    return Number.isSafeInteger(num) ? num : value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(serializeBigInts);
  }
  if (typeof value === 'object' && !(value instanceof Date)) {
    const res: any = {};
    for (const key of Object.keys(value)) {
      res[key] = serializeBigInts(value[key]);
    }
    return res;
  }
  return value;
}

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
        const sanitized = serializeBigInts(data);

        // If the controller already returned a structure with data & meta
        if (sanitized && typeof sanitized === 'object' && 'data' in sanitized && 'meta' in sanitized) {
          return {
            success: true,
            data: sanitized.data,
            meta: sanitized.meta,
            timestamp: new Date().toISOString(),
            requestId,
            correlationId,
          };
        }

        return {
          success: true,
          data: sanitized,
          timestamp: new Date().toISOString(),
          requestId,
          correlationId,
        };
      }),
    );
  }
}
