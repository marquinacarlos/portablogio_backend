import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos la interfaz de Request para que soporte el campo "user"
export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  // El formato suele ser: "Bearer EYJhbGci..."
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: Token requerido' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'mi_secreto_super_seguro';
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next(); // Pasa al siguiente controlador
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};