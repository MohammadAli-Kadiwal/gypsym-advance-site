const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  public status: number;
  public details?: any;
  public isValidationError: boolean;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.isValidationError = status === 400 || status === 422;
  }
}

/**
 * Normalizes HTTP status codes and error payloads into administrator-friendly strings.
 * Never exposes Prisma, PostgreSQL, database column names, UUIDs, or stack traces.
 */
export function normalizeErrorMessage(err: unknown, fallbackMessage: string = 'An unexpected error occurred.'): string {
  if (!err) return fallbackMessage;

  if (err instanceof ApiError) {
    return err.message;
  }

  if (err instanceof Error) {
    const raw = err.message || '';

    // Check if technical leak
    const containsTechnicalJargon =
      raw.includes('Prisma') ||
      raw.includes('Postgres') ||
      raw.includes('SQL') ||
      raw.includes('SELECT') ||
      raw.includes('INSERT') ||
      raw.includes('foreign key') ||
      raw.includes('unique constraint') ||
      raw.includes('column') ||
      raw.includes('table');

    if (containsTechnicalJargon) {
      return 'The operation could not be completed due to a database constraint. Please check your inputs.';
    }

    if (raw.includes('Failed to fetch') || raw.includes('NetworkError') || raw.includes('ECONNREFUSED')) {
      return 'Unable to connect to the backend server. Please verify your network connection.';
    }

    return raw || fallbackMessage;
  }

  if (typeof err === 'string') {
    return err;
  }

  return fallbackMessage;
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      cache: 'no-store',
    });
  } catch (networkError) {
    throw new ApiError('Unable to connect to the server. Please verify your connection.', 0);
  }

  if (!res.ok) {
    let rawErrorJson: any = null;
    try {
      rawErrorJson = await res.json();
    } catch {
      // Body wasn't JSON
    }

    let friendlyMessage = '';
    const serverMessage = rawErrorJson?.message || rawErrorJson?.error;

    // Check if server message is safe to display (doesn't contain DB traces)
    const isSafeMessage =
      typeof serverMessage === 'string' &&
      !serverMessage.includes('Prisma') &&
      !serverMessage.includes('Postgres') &&
      !serverMessage.includes('foreign key') &&
      !serverMessage.includes('table');

    if (isSafeMessage && serverMessage.length < 150) {
      friendlyMessage = serverMessage;
    } else {
      switch (res.status) {
        case 400:
          friendlyMessage = 'Invalid request. Please verify the entered information.';
          break;
        case 401:
          friendlyMessage = 'Your session has expired. Please sign in again.';
          break;
        case 403:
          friendlyMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          friendlyMessage = 'The requested item was not found.';
          break;
        case 409:
          friendlyMessage = 'A conflict occurred. This record or unique field may already exist.';
          break;
        case 422:
          friendlyMessage = 'Validation failed. Please verify the form inputs.';
          break;
        case 429:
          friendlyMessage = 'Too many requests. Please wait a moment before trying again.';
          break;
        case 500:
          friendlyMessage = 'A server error occurred. Please try again later.';
          break;
        case 503:
          friendlyMessage = 'The service is temporarily unavailable. Please try again shortly.';
          break;
        default:
          friendlyMessage = `Unable to complete the operation (${res.status}).`;
      }
    }

    throw new ApiError(friendlyMessage, res.status, rawErrorJson);
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}
