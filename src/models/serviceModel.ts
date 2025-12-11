import { query } from '../config/db.js';

export interface IService {
  title: string;
  description?: string;
  price: number;
  features: string[]; // Se guardará como JSONB en la BD
}

export class ServiceModel {
  static async findAll() {
    const sql = `SELECT * FROM services WHERE is_active = true ORDER BY price ASC`;
    const result = await query(sql);
    return result.rows;
  }

  static async create(service: IService) {
    const sql = `
      INSERT INTO services (title, description, price, features)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    // features es un array en JS, Postgres lo convierte a JSONB
    const params = [
      service.title, service.description, 
      service.price, JSON.stringify(service.features)
    ];
    const result = await query(sql, params);
    return result.rows[0];
  }
}