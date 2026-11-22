import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex');

export interface TokenPayload {
  userId: string;
  email: string;
  isGuest?: boolean;
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (e) {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = { userId: 'guest', email: 'guest@fitforge.local', isGuest: true };
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    req.user = { userId: 'guest', email: 'guest@fitforge.local', isGuest: true };
    return next();
  }

  req.user = payload;
  next();
}
