// 1. Tipos de bloques soportados
export type BlockType = 'paragraph' | 'header' | 'image' | 'code' | 'video' | 'quote';

// 2. Estructura base de un bloque
export interface ContentBlock {
  id: string; // ID único para keys de React
  type: BlockType;
  data: {
    text?: string;          // Para párrafos, headers
    level?: number;         // Para headers (h1, h2, h3)
    url?: string;           // Para imágenes, videos
    caption?: string;       // Pie de foto
    language?: string;      // Para bloques de código (js, sql, css)
    code?: string;          // El código en sí
    style?: string;         // 'ordered' | 'unordered' para listas, etc.
  };
}

// 3. La interfaz que representa una fila de la BD
export interface IPost {
  id?: number;
  user_id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: ContentBlock[]; // <--- AQUÍ ESTÁ LA CLAVE DEL JSONB
  cover_image_url?: string;
  type: 'blog' | 'collaboration';
  status: 'draft' | 'published' | 'archived';
  published_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}