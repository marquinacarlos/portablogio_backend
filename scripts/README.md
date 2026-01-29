# Scripts de Base de Datos

## migrate.js

Script para inicializar el esquema de la base de datos. Es **idempotente** (puede ejecutarse múltiples veces sin problemas).

### Ejecutar localmente

Usa el archivo `.env` local:

```bash
npm run migrate
```

### Ejecutar en producción (Render)

Opción 1 - Desde tu máquina local con DATABASE_URL de producción:

```bash
DATABASE_URL="postgres://user:pass@host:port/dbname" npm run migrate:prod
```

Opción 2 - Desde la Shell de Render:

1. Ve a tu servicio en Render
2. Click en "Shell"
3. Ejecuta:
```bash
node scripts/migrate.js
```

### Qué hace cada tabla

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuario administrador (Carlos). Almacena credenciales para login JWT |
| `projects` | Proyectos del portafolio. Tech stack como array PostgreSQL |
| `services` | Servicios/tarifas freelance. Features como JSONB |
| `posts` | Blog y colaboraciones. Contenido tipo Medium usando bloques JSONB |

### Índices creados

- `idx_posts_slug` - Búsqueda rápida de posts por URL amigable
- `idx_posts_status` - Filtrado por estado (draft/published/archived)
- `idx_projects_featured` - Proyectos destacados en home
- `idx_posts_content` - Índice GIN para búsqueda dentro del contenido JSONB

### Notas

- El script usa `CREATE TABLE IF NOT EXISTS`, por lo que no destruye datos existentes
- El orden de creación respeta las foreign keys (users antes que posts)
- La configuración SSL se activa automáticamente para URLs de Render
