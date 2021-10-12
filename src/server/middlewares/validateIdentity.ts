import HttpStatus from 'http-status-codes';
import {
  MissingAuthHeaderError,
  InvalidAuthSchemeError,
  InvalidTokenError
} from '@app/common/errors';
import logger from '@app/common/services/logger/logger';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../services';
import { IdentityRepository } from '@app/data/identity';

/**
 * Verfies that the request if from a verified identity.
 * Mounts the identity's data in `req.user`
 */
export async function validateIdentity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const identityRepo = new IdentityRepository();

    if (!req.headers?.authorization) {
      const error = new MissingAuthHeaderError();
      res.jSend.error(null, error.message, error.code, error.error_code);
      logger.logAPIError(req, res, error);
      MetricsService.record(req, res);
    }

    const [bearer, token] = req.headers.authorization.split(' ');
    if (bearer !== 'Bearer') {
      const error = new InvalidAuthSchemeError();
      res.jSend.error(null, error.message, error.code, error.error_code);
      logger.logAPIError(req, res, error);
      MetricsService.record(req, res);
    }

    if (!token) {
      const error = new InvalidTokenError();
      res.jSend.error(null, error.message, error.code, error.error_code);
      logger.logAPIError(req, res, error);
      MetricsService.record(req, res);
    }

    const identity = identityRepo.verifyToken(token);

    const identityData = await identityRepo.byID(identity.user._id, '+token');

    if (token !== identityData.token) {
      throw new InvalidTokenError();
    }

    req.user = identity.user;

    next();
  } catch (error) {
    res.status(HttpStatus.UNAUTHORIZED).send({
      status: 'error',
      data: null,
      message: error.message,
      code: HttpStatus.UNAUTHORIZED
    });
  }
}

/**
 * Verfies that the request if from an admin.
 */
export async function validateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.user.role !== 'admin') {
      throw new Error('You do not have permission to access this route');
    }

    next();
  } catch (error) {
    res.status(HttpStatus.UNAUTHORIZED).send({
      status: 'error',
      data: null,
      message: error.message,
      code: HttpStatus.UNAUTHORIZED
    });
  }
}
