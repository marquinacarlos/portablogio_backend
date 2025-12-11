import { Pool, Client } from "pg";
import {
		DB_USER,
		DB_HOST,
		DB_NAME,
		DB_PASSWORD,
		DB_PORT
} from "./env.config.js";

const pool = new Pool({
		user: DB_USER,
		host: DB_HOST,
		database: DB_NAME,
		password: DB_PASSWORD,
		port: Number(process.env.DB_PORT) || 5432,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
		maxLifetimeSeconds: 60
});

// Wrapper para ejecutar queries y loguear errores si es necesario
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Opcional: console.log('Query ejecutada', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error en Database Query', error);
    throw error;
  }
};