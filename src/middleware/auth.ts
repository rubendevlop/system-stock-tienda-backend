import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { UserRole } from '../models/index.js';

interface TokenPayload { sub: string; role: UserRole; }

export function requireAuth(request: Request, _res: Response, next: NextFunction): void {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next({ status: 401, message: 'No autenticado.' }); return;
  }
  try {
    const payload = jwt.verify(header.replace('Bearer ', ''), env.JWT_SECRET) as TokenPayload;
    (request as Request & { auth: { userId: string; role: UserRole } }).auth = {
      userId: payload.sub,
      role: payload.role,
    };
    next();
  } catch {
    next({ status: 401, message: 'Sesión inválida o expirada.' });
  }
}
