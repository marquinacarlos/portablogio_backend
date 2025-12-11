import { query } from '../config/db.js';
import { IPost, ContentBlock } from '../types/blog.js';

export class PostModel {
  
  // Crear un nuevo Post
  static async create(post: IPost): Promise<IPost> {
    const sql = `
      INSERT INTO posts (user_id, title, slug, excerpt, content, type, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    // Postgres convierte automáticamente el Array de JS a JSONB
    const params = [
      post.user_id,
      post.title,
      post.slug,
      post.excerpt,
      JSON.stringify(post.content), // Aseguramos que sea string JSON
      post.type,
      post.status || 'draft'
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Obtener Post por Slug (Para la vista pública)
  static async findBySlug(slug: string): Promise<IPost | null> {
    const sql = `SELECT * FROM posts WHERE slug = $1`;
    const result = await query(sql, [slug]);
    
    if (result.rows.length) {
      return result.rows[0]; // pg parsea el JSONB de vuelta a Objeto JS automáticamente
    }
    return null;
  }

  // Listar Posts (Paginado básico)
  static async findAll(limit: number = 10, offset: number = 0): Promise<IPost[]> {
    const sql = `
      SELECT id, title, slug, excerpt, cover_image_url, created_at 
      FROM posts 
      WHERE status = 'published' 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    // Nota: No traemos el 'content' aquí para no hacer pesada la lista
    const result = await query(sql, [limit, offset]);
    return result.rows;
  }
}