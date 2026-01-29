/**
 * Script para crear el usuario administrador
 *
 * Uso:
 * DATABASE_URL="tu-url" ADMIN_EMAIL="email" ADMIN_PASSWORD="password" node scripts/seed-admin.js
 *
 * O con npm:
 * DATABASE_URL="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." npm run seed:admin
 */

import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : undefined
});

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_USERNAME || email?.split('@')[0] || 'admin';

  console.log('\n========================================');
  console.log('   CREAR USUARIO ADMINISTRADOR');
  console.log('========================================\n');

  // Validar variables requeridas
  if (!process.env.DATABASE_URL) {
    log.error('DATABASE_URL no está definida');
    process.exit(1);
  }

  if (!email || !password) {
    log.error('ADMIN_EMAIL y ADMIN_PASSWORD son requeridos');
    console.log('\nUso:');
    console.log('  DATABASE_URL="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." node scripts/seed-admin.js\n');
    process.exit(1);
  }

  let client;
  try {
    client = await pool.connect();
    log.success('Conectado a la base de datos');

    // Verificar si el usuario ya existe
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      log.warn(`El usuario ${email} ya existe (ID: ${existing.rows[0].id})`);
      console.log('\nSi necesitas actualizar la contraseña, ejecuta:');
      console.log('  DATABASE_URL="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." ADMIN_UPDATE=1 node scripts/seed-admin.js\n');

      // Si ADMIN_UPDATE está definido, actualizar la contraseña
      if (process.env.ADMIN_UPDATE) {
        const hash = await bcrypt.hash(password, 10);
        await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);
        log.success('Contraseña actualizada');
      }
    } else {
      // Crear nuevo usuario
      const hash = await bcrypt.hash(password, 10);
      const result = await client.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hash]
      );

      log.success('Usuario creado:');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Username: ${result.rows[0].username}`);
      console.log(`   Email: ${result.rows[0].email}`);
    }

  } catch (error) {
    log.error(`Error: ${error.message}`);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }

  console.log('\n');
  process.exit(0);
}

seedAdmin();
