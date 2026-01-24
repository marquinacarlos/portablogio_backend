import { query } from '../config/db.js';

export class UserModel {
  static async findByEmail(email: string) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }
  
  // Función auxiliar para actualizar password (solo para setup inicial)
  static async updatePassword(id: number, hash: string) {
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, id]);
  }
  
  static async create(user: { username: string; email: string; password_hash: string }) {
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [user.username, user.email, user.password_hash]
    );
    return result.rows[0];
  }
}