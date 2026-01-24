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

  // Actualizar Post por Slug
  static async update(slug: string, post: Partial<IPost>): Promise<IPost | null> {
    // Construir dinámicamente los campos a actualizar
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (post.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      params.push(post.title);
    }
    if (post.slug !== undefined) {
      fields.push(`slug = $${paramIndex++}`);
      params.push(post.slug);
    }
    if (post.excerpt !== undefined) {
      fields.push(`excerpt = $${paramIndex++}`);
      params.push(post.excerpt);
    }
    if (post.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      params.push(JSON.stringify(post.content));
    }
    if (post.cover_image_url !== undefined) {
      fields.push(`cover_image_url = $${paramIndex++}`);
      params.push(post.cover_image_url);
    }
    if (post.type !== undefined) {
      fields.push(`type = $${paramIndex++}`);
      params.push(post.type);
    }
    if (post.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      params.push(post.status);
      // Si se publica, actualizar published_at
      if (post.status === 'published') {
        fields.push(`published_at = COALESCE(published_at, NOW())`);
      }
    }

    if (fields.length === 0) {
      // No hay nada que actualizar, devolver el post actual
      return this.findBySlug(slug);
    }

    // Agregar updated_at
    fields.push(`updated_at = NOW()`);

    // El slug original va al final para el WHERE
    params.push(slug);

    const sql = `
      UPDATE posts
      SET ${fields.join(', ')}
      WHERE slug = $${paramIndex}
      RETURNING *;
    `;

    const result = await query(sql, params);
    return result.rows.length ? result.rows[0] : null;
  }

  // Eliminar Post por Slug
  static async delete(slug: string): Promise<boolean> {
    const sql = `DELETE FROM posts WHERE slug = $1 RETURNING id`;
    const result = await query(sql, [slug]);
    return result.rows.length > 0;
  }

  // Obtener Post por ID (útil para verificar propiedad)
  static async findById(id: number): Promise<IPost | null> {
    const sql = `SELECT * FROM posts WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows.length ? result.rows[0] : null;
  }

  // Listar TODOS los Posts para admin (incluye drafts y archived)
  static async findAllAdmin(limit: number = 50, offset: number = 0): Promise<IPost[]> {
    const sql = `
      SELECT id, title, slug, excerpt, cover_image_url, status, created_at, updated_at
      FROM posts
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await query(sql, [limit, offset]);
    return result.rows;
  }
}