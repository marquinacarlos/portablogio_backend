import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';

export class AuthController {
  
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);

      if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

      // Comparamos la contraseña enviada con el hash de la BD
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

      // Creamos el Token
      const secret = process.env.JWT_SECRET || 'mi_secreto_super_seguro';
      const token = jwt.sign({ id: user.id, username: user.username }, secret, {
        expiresIn: '2h' // El token expira en 2 horas
      });

      res.json({ message: 'Bienvenido', token });
    } catch (error) {
      res.status(500).json({ error: 'Error en login' });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Verificamos si el usuario ya existe
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) return res.status(400).json({ error: 'El usuario ya existe' });

      // Hasheamos la contraseña
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Creamos el nuevo usuario
      const newUser = await UserModel.create({ username, email, password_hash });

      res.status(201).json({ message: 'Usuario registrado', userId: newUser.id });
    } catch (error) {
      res.status(500).json({ error: 'Error en registro' });
    }
  }
  
}
