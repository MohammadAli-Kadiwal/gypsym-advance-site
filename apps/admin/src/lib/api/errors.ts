import type { ApiErrorDetail } from './types';

/**
 * Standard Frontend Application Error Class
 * Normalized from backend HTTP responses or transport failures.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[] | Record<string, any>;
  public readonly requestId?: string;
  public readonly isValidationError: boolean;
  public readonly isNetworkError: boolean;
  public readonly isTimeout: boolean;
  public readonly retryAfter?: number;

  constructor({
    message,
    status = 500,
    code = 'UNKNOWN_ERROR',
    details,
    requestId,
    isNetworkError = false,
    isTimeout = false,
    retryAfter,
  }: {
    message: string;
    status?: number;
    code?: string;
    details?: ApiErrorDetail[] | Record<string, any>;
    requestId?: string;
    isNetworkError?: boolean;
    isTimeout?: boolean;
    retryAfter?: number;
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.isValidationError = status === 400 || status === 422;
    this.isNetworkError = isNetworkError;
    this.isTimeout = isTimeout;
    this.retryAfter = retryAfter;

    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Sanitizes technical database jargon, Prisma errors, PostgreSQL column identifiers,
 * SQL keywords, and stack traces before presenting to the user.
 */
export function normalizeErrorMessage(err: unknown, fallbackMessage: string = 'An unexpected error occurred.'): string {
  if (!err) return fallbackMessage;

  if (err instanceof ApiError) {
    return err.message;
  }

  const anyErr = err as any;

  // Extract nested server message if provided by Axios response or custom error wrapper
  const candidate =
    anyErr?.response?.data?.message ||
    anyErr?.response?.data?.error?.message ||
    anyErr?.response?.data?.error ||
    anyErr?.details ||
    (err instanceof Error ? err.message : typeof err === 'string' ? err : null);

  let raw = '';
  if (Array.isArray(candidate)) {
    raw = candidate.filter(Boolean).join('. ');
  } else if (typeof candidate === 'string') {
    raw = candidate.trim();
  }

  if (raw) {
    // Check if technical leak
    const containsTechnicalJargon =
      raw.includes('PrismaClient') ||
      raw.includes('prisma.') ||
      raw.includes('PostgresError') ||
      raw.includes('syntax error at or near') ||
      raw.includes('foreign key constraint') ||
      raw.includes('relation "') ||
      raw.includes('column "');

    if (containsTechnicalJargon) {
      return 'The operation could not be completed due to a database constraint. Please check your inputs.';
    }

    if (raw.includes('Failed to fetch') || raw.includes('NetworkError') || raw.includes('ECONNREFUSED')) {
      return 'Unable to connect to the backend server. Please verify your network connection.';
    }

    return raw;
  }

  return fallbackMessage;
}
