import { Request } from 'express';
import { RoleName } from '@prisma/client';

export interface JwtUserPayload {
  userId: string;
  email: string;
  roles: RoleName[];
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}
