import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { AppError } from '../../../domain/errors/AppError';

interface TokenPayload {
  id: number;
  type: string;
  iat: number;
  exp: number;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token não informado', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const { id, type } = decoded as TokenPayload;

    // Injeta o usuário na requisição para os controllers usarem
    req.user = {
      id,
      type
    };

    return next();
  } catch {
    throw new AppError('Token inválido', 401);
  }
}