import { Context } from 'hono';
import { StatusCode } from 'hono/utils/http-status';

export function successResponse(c: Context, data: any, message = 'Success', status: StatusCode = 200) {
  return c.json({
    success: true,
    message,
    data,
  }, status);
}

export function errorResponse(c: Context, message: string, status: StatusCode = 400, details?: any) {
  return c.json({
    success: false,
    error: message,
    details,
  }, status);
}
