# CLAUDE.md - Memoria del Proyecto Backend

> Este archivo sirve como contexto persistente para Claude Code en el desarrollo de este proyecto.

## Visión General

**Proyecto:** API REST para Portfolio y Blog personal de Carlos Marquina
**Propósito:** Backend que sirve contenido para el portafolio (proyectos, servicios, blog)
**Administrador único:** Carlos Marquina (único usuario con acceso de escritura)
**Estado:** En desarrollo activo (v1.0.0)

---

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | - | Runtime |
| Express | 5.1.0 | Framework web |
| TypeScript | 5.9.3 | Tipado estático |
| PostgreSQL | - | Base de datos |
| pg | 8.16.3 | Driver PostgreSQL |
| jsonwebtoken | 9.0.2 | Autenticación JWT |
| bcrypt | 6.0.0 | Hash de contraseñas |
| cors | 2.8.5 | Control CORS |
| tsx | 4.21.0 | Ejecutor TS para desarrollo |

---

## Estructura del Proyecto

```
src/
├── app.ts                  # Entry point
├── config/
│   ├── env.config.ts       # Variables de entorno validadas
│   └── db.ts               # Pool de conexión PostgreSQL
├── controllers/
│   ├── auth.controller.ts  # Login y generación JWT
│   ├── post.controller.ts  # CRUD de posts
│   ├── project.controller.ts
│   └── service.controller.ts
├── models/
│   ├── userModel.ts        # Acceso a tabla users
│   ├── postModel.ts        # Acceso a tabla posts
│   ├── projectModel.ts
│   └── serviceModel.ts
├── routes/
│   ├── index.ts            # Router principal /api/v1
│   ├── auth.routes.ts
│   ├── post.routes.ts
│   ├── project.routes.ts
│   └── service.routes.ts
├── middlewares/
│   └── auth.middleware.ts  # Validación JWT
├── types/
│   └── blog.ts             # Interfaces TypeScript
└── utils/
    └── buildApiUrl.ts
database/
└── structure/
    └── v1_structure.sql    # Esquema completo de BD
```

---

## Base de Datos

### Conexión
- **Host:** localhost
- **Puerto:** 5432
- **Database:** portablogio
- **Usuario:** mordecai
- **Pool:** 20 conexiones máximo

### Tablas

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
**Usuario de prueba:** `hola@miportafolio.com` / `dev_junior`

#### posts
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content JSONB NOT NULL,           -- Array de bloques de contenido
    cover_image_url TEXT,
    type VARCHAR(20) DEFAULT 'blog',  -- 'blog' | 'collaboration'
    status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'published' | 'archived'
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### projects
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    tech_stack TEXT[],                -- Array nativo PostgreSQL
    image_url TEXT,
    repo_url TEXT,
    live_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### services
```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    features JSONB,                   -- Array de features
    is_active BOOLEAN DEFAULT true
);
```

---

## API Endpoints

**Base URL:** `http://localhost:3000/api/v1`

### Autenticación

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login, retorna JWT (2h) |

**Request:**
```json
{ "email": "hola@miportafolio.com", "password": "..." }
```
**Response:**
```json
{ "message": "Bienvenido", "token": "eyJ..." }
```

### Posts (Blog)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/posts` | No | Listar posts publicados |
| GET | `/posts/:slug` | No | Obtener post por slug |
| POST | `/posts` | JWT | Crear nuevo post |

**GET /posts** - Query params: `?limit=10&offset=0`
```json
{
  "data": [
    {
      "id": 1,
      "title": "Mi post",
      "slug": "mi-post",
      "excerpt": "Resumen...",
      "cover_image_url": "https://...",
      "created_at": "2025-01-22T12:00:00Z"
    }
  ]
}
```

**GET /posts/:slug** - Incluye `content` completo
```json
{
  "data": {
    "id": 1,
    "title": "Mi post",
    "slug": "mi-post",
    "content": [
      { "id": "abc", "type": "header", "data": { "text": "Título", "level": 2 } },
      { "id": "def", "type": "paragraph", "data": { "text": "Contenido..." } }
    ],
    ...
  }
}
```

### Projects

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/projects` | No | Listar proyectos |
| POST | `/projects` | JWT | Crear proyecto |

### Services

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/services` | No | Listar servicios activos |
| POST | `/services` | JWT | Crear servicio |

---

## Estructura de Contenido (JSONB)

El campo `content` de posts es un array de bloques:

```typescript
type BlockType = 'paragraph' | 'header' | 'image' | 'code' | 'video' | 'quote';

interface ContentBlock {
  id: string;        // ID único para keys React
  type: BlockType;
  data: {
    text?: string;     // Para paragraph, header, quote
    level?: number;    // Para header (1-6)
    url?: string;      // Para image, video
    caption?: string;  // Pie de imagen/video
    language?: string; // Para code (js, ts, sql, etc.)
    code?: string;     // Contenido del código
  };
}
```

**Ejemplo:**
```json
[
  { "id": "1", "type": "header", "data": { "text": "Introducción", "level": 2 } },
  { "id": "2", "type": "paragraph", "data": { "text": "Contenido del párrafo..." } },
  { "id": "3", "type": "code", "data": { "language": "typescript", "code": "const x = 1;" } },
  { "id": "4", "type": "image", "data": { "url": "https://...", "caption": "Mi imagen" } }
]
```

---

## Autenticación JWT

### Flujo
1. POST `/auth/login` con email + password
2. Backend valida con bcrypt
3. Genera JWT válido por **2 horas**
4. Cliente guarda token
5. Requests protegidas: `Authorization: Bearer <token>`

### Payload del Token
```json
{
  "id": 1,
  "username": "dev_junior",
  "iat": 1674403200,
  "exp": 1674410400
}
```

### Middleware de Autenticación
```typescript
// Header requerido para rutas protegidas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Variables de Entorno (.env)

```env
DB_USER="mordecai"
DB_HOST="localhost"
DB_NAME="portablogio"
DB_PASSWORD=""
DB_PORT="5432"

PROTOCOL="http"
DOMAIN="localhost"
PORT="3000"

JWT_SECRET="clave_ultra_super_segura"
CLIENT_URLS="http://localhost:5173,http://192.168.0.33:5173/"
```

---

## Comandos

```bash
# Desarrollo (hot-reload)
npm run dev

# Build
npm run build

# Producción
npm start
```

---

## Estado del Desarrollo

### Implementado
- [x] Express + TypeScript setup
- [x] PostgreSQL con pool de conexiones
- [x] Autenticación JWT + bcrypt
- [x] CRUD Posts (crear, listar, obtener por slug)
- [x] CRUD Projects (crear, listar)
- [x] CRUD Services (crear, listar)
- [x] Contenido tipo Medium (JSONB blocks)
- [x] CORS configurado
- [x] Validación de env vars

### Pendiente
- [ ] PUT/DELETE para posts, projects, services
- [ ] Validación de input (Zod/Joi)
- [ ] Upload de imágenes (Multer/Cloudinary)
- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] Búsqueda/filtrado en posts
- [ ] Tests automatizados
- [ ] Documentación Swagger

---

## Relación con Frontend

**Frontend:** `/Users/mordecai/dev/portablogio_frontend`
**Puerto Frontend:** 5173 (Vite)
**Puerto Backend:** 3000

El frontend consume esta API para:
- Mostrar posts del blog (público)
- Mostrar proyectos (público)
- Mostrar servicios (público)
- Administrar contenido (requiere login)

---

*Última actualización: Enero 2026*
