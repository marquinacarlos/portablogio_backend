-- 1. Activamos la extensión para UUIDs (opcional pero recomendado para IDs públicos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Usuarios (Para ti como admin)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Proyectos (Portafolio)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL, -- Para URLs amigables: /proyectos/mi-app
    description TEXT NOT NULL,
    tech_stack TEXT[], -- Array de strings: ['React', 'Node', 'AWS']
    image_url TEXT,
    repo_url TEXT,
    live_url TEXT,
    is_featured BOOLEAN DEFAULT false, -- Para destacar en la home
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Servicios (Tarifas Freelance)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL, -- Ej: "Landing Page SPA"
    description TEXT,
    price DECIMAL(10, 2) NOT NULL, -- DECIMAL es vital para dinero, nunca FLOAT
    currency VARCHAR(3) DEFAULT 'EUR',
    features JSONB, -- Lista de qué incluye: ["SEO básico", "Responsive", "Hosting"]
    is_active BOOLEAN DEFAULT true
);

-- 5. Tabla de Posts (Blog y Colaboraciones)
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- Vital para SEO: /blog/como-usar-react
    excerpt TEXT, -- Resumen corto para tarjetas de vista previa
    
    -- AQUÍ ESTÁ LA MAGIA DEL BLOG TIPO MEDIUM
    content JSONB NOT NULL, 
    /* Estructura esperada del JSONB:
       [
         { "type": "paragraph", "data": { "text": "Hola mundo..." } },
         { "type": "image", "data": { "url": "...", "caption": "..." } },
         { "type": "code", "data": { "code": "console.log()", "lang": "js" } }
       ]
    */

    cover_image_url TEXT,
    type VARCHAR(20) DEFAULT 'blog', -- 'blog' o 'collaboration'
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Índices para rendimiento (Buenas prácticas)
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_projects_featured ON projects(is_featured);
-- Índice GIN para buscar dentro del JSONB si fuera necesario en el futuro
CREATE INDEX idx_posts_content ON posts USING GIN (content);



--! TEST
-- usuario de prueba
INSERT INTO users (username, email, password_hash)
VALUES ('dev_junior', 'hola@miportafolio.com', 'hash_secreto_temporal');

/* json de prueba
{
  "user_id": 1,
  "title": "Cómo configurar VS Code para ser productivo",
  "slug": "configurar-vscode-productivo",
  "excerpt": "Una guía rápida con mis extensiones favoritas y configuración de settings.json.",
  "type": "blog",
  "status": "published",
  "content": [
    {
      "id": "abc1234",
      "type": "header",
      "data": {
        "text": "Introducción",
        "level": 2
      }
    },
    {
      "id": "def5678",
      "type": "paragraph",
      "data": {
        "text": "VS Code es el editor más popular por una razón: su ecosistema de extensiones. Aquí te muestro las que uso día a día en mi stack PERN."
      }
    },
    {
      "id": "ghi9012",
      "type": "list",
      "data": {
        "style": "unordered",
        "items": [
          "ESLint: Para encontrar errores rápido.",
          "Prettier: Para formatear el código automáticamente.",
          "GitLens: Para ver quién rompió el código (broma)."
        ]
      }
    },
    {
      "id": "jkl3456",
      "type": "code",
      "data": {
        "language": "json",
        "code": "{\n  \"editor.formatOnSave\": true,\n  \"editor.fontSize\": 14\n}"
      }
    }
  ]
}
*/

-- haseando la clave de mi usuario

UPDATE users SET password_hash = '$2b$10$SUaDdKWqUhjtgHAx22edduamjmz6LzvIJAfX4MtY1lEDvHFI69rse' WHERE email = 'hola@miportafolio.com';
