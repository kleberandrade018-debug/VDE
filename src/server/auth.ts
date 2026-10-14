import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Database } from './db';
import { AdminUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'vai-de-eletrica-jwt-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  adminUser?: AdminUser;
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser;
    return decoded;
  } catch {
    return null;
  }
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : (req.headers['x-access-token'] as string | undefined);

  if (!token) {
    res.status(401).json({
      error: 'Não autorizado. Faça login como administrador para realizar esta operação.'
    });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({
      error: 'Sessão expirada ou inválida. Faça login novamente.'
    });
    return;
  }

  // Ensure user still exists in database
  const adminInDb = Database.findAdminByEmail(decoded.email);
  if (!adminInDb) {
    res.status(401).json({
      error: 'Usuário administrador não encontrado no sistema.'
    });
    return;
  }

  req.adminUser = {
    id: adminInDb.id,
    email: adminInDb.email,
    name: adminInDb.name,
    role: adminInDb.role,
    createdAt: adminInDb.createdAt
  };

  next();
}
