import { query } from '../config/db.js';

export interface IProject {
  title: string;
  slug: string;
  description: string;
  tech_stack: string[]; // Array de strings en TS y Postgres
  image_url?: string;
  repo_url?: string;
  live_url?: string;
  is_featured?: boolean;
}

export class ProjectModel {
  static async findAll() {
    // Ordenamos por "destacados" primero, luego por fecha
    const sql = `SELECT * FROM projects ORDER BY is_featured DESC, created_at DESC`;
    const result = await query(sql);
    return result.rows;
  }

  static async create(project: IProject) {
    const sql = `
      INSERT INTO projects (title, slug, description, tech_stack, repo_url, live_url, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const params = [
      project.title, project.slug, project.description, 
      project.tech_stack, // pg maneja el array nativo automáticamente
      project.repo_url, project.live_url, project.is_featured || false
    ];
    const result = await query(sql, params);
    return result.rows[0];
  }
}