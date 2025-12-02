import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../domain/errors/AppError';
import { logger } from '../../../shared/logger';

export function errorHandler(
  err: Error,
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  logger.error('Erro interno do servidor:', err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}