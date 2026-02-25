import { NextResponse } from 'next/server';
import type { ApiErrorType, ApiErrorResponse } from '@/src/lib/types';

export class AppError extends Error {
  readonly type: ApiErrorType;
  readonly statusCode: number;

  constructor(type: ApiErrorType, message: string, statusCode: number) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
  }
}

export function createErrorResponse(type: ApiErrorType, message: string, statusCode: number) {
  const body: ApiErrorResponse = { error: { type, message } };
  return NextResponse.json(body, { status: statusCode });
}

export function mapErrorToResponse(error: unknown) {
  if (error instanceof AppError) return createErrorResponse(error.type, error.message, error.statusCode);
  const message = error instanceof Error ? error.message : 'Unexpected provider failure.';
  return createErrorResponse('provider', message, 502);
}
