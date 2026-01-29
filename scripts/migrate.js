/**
 * Script de migración para inicializar la base de datos
 * Ejecutar: npm run migrate
 *
 * Este script es idempotente: puede ejecutarse múltiples veces sin problemas
 * ya que usa CREATE TABLE IF NOT EXISTS
 */

import pg from 'pg';
const { Pool } = pg;

// Configuración de conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : undefined
});

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

// SQL de migración - Orden importante por foreign keys
const migrations = [
  {
    name: 'Extensión UUID',
    sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  },
  {
    name: 'Tabla users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'Tabla projects',
    sql: `
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        slug VARCHAR(120) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        tech_stack TEXT[],
        image_url TEXT,
        repo_url TEXT,
        live_url TEXT,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'Tabla services',
    sql: `
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'EUR',
        features JSONB,
        is_active BOOLEAN DEFAULT true
      );
    `
  },
  {
    name: 'Tabla posts',
    sql: `
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content JSONB NOT NULL,
        cover_image_url TEXT,
        type VARCHAR(20) DEFAULT 'blog',
        status VARCHAR(20) DEFAULT 'draft',
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'Índice posts(slug)',
    sql: `CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);`
  },
  {
    name: 'Índice posts(status)',
    sql: `CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);`
  },
  {
    name: 'Índice projects(is_featured)',
    sql: `CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);`
  },
  {
    name: 'Índice GIN posts(content)',
    sql: `CREATE INDEX IF NOT EXISTS idx_posts_content ON posts USING GIN (content);`
  }
];

async function migrate() {
  console.log('\n========================================');
  console.log('   MIGRACIÓN DE BASE DE DATOS');
  console.log('========================================\n');

  if (!process.env.DATABASE_URL) {
    log.error('DATABASE_URL no está definida');
    log.info('Asegúrate de tener la variable de entorno configurada');
    process.exit(1);
  }

  log.info(`Conectando a la base de datos...`);

  let client;
  try {
    client = await pool.connect();
    log.success('Conexión establecida\n');
  } catch (error) {
    log.error(`Error de conexión: ${error.message}`);
    process.exit(1);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const migration of migrations) {
    try {
      await client.query(migration.sql);
      log.success(migration.name);
      successCount++;
    } catch (error) {
      log.error(`${migration.name}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n----------------------------------------');
  console.log(`Completadas: ${successCount}/${migrations.length}`);
  if (errorCount > 0) {
    console.log(`Errores: ${errorCount}`);
  }
  console.log('----------------------------------------\n');

  // Mostrar tablas existentes
  try {
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    log.info('Tablas en la base de datos:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
  } catch (error) {
    log.warn('No se pudo listar las tablas');
  }

  // Cerrar conexiones
  client.release();
  await pool.end();

  console.log('\n');
  log.success('Migración completada');
  console.log('\n');

  process.exit(errorCount > 0 ? 1 : 0);
}

// Ejecutar
migrate().catch(error => {
  log.error(`Error fatal: ${error.message}`);
  process.exit(1);
});
