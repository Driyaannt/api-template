import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { createAuthRepository } from '../modules/auth/auth.factory.js';
import { AuthService } from '../modules/auth/auth.service.js';
const auth = new AuthService(createAuthRepository());
export const authenticate: RequestHandler = async (req, _res, next) => { try { const header=req.header('authorization'); if (!header?.startsWith('Bearer ')) throw new AppError(401,'UNAUTHORIZED','Bearer token required'); req.user=await auth.verifyAccess(header.slice(7)); next(); } catch(error) { next(error); } };
