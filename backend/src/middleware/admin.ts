import { Response } from 'express';
import { AuthRequest } from './auth';

export const adminMiddleware = (req: AuthRequest, res: Response, next: Function) => {
  // Por enquanto, vamos verificar se o email é do admin
  // Em produção, isso deve vir do token JWT
  const adminEmails = ['admin@autoskill.com', 'admin@test.com'];
  
  if (!req.userEmail || !adminEmails.includes(req.userEmail)) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }

  next();
};
