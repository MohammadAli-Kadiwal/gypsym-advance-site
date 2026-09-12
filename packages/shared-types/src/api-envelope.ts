export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextCursor?: string | null;
    };
    [key: string]: unknown;
  };
  timestamp: string;
  requestId: string;
  correlationId: string;
}

export interface ValidationErrorDetail {
  field?: string;
  issue: string;
  constraint?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ValidationErrorDetail[];
  };
  timestamp: string;
  requestId: string;
  correlationId: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
