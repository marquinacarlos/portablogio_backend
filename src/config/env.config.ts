import { buildApiUrl } from "../utils/buildApiUrl.js";

const { env } = process;

const required = [
	"DB_USER",
	"DB_HOST",
	"DB_NAME",
	"DB_PASSWORD",
	"DB_PORT",
	"PROTOCOL",
	"DOMAIN",
	"PORT",
	"CLIENT_URLS"
];

for (const key of required) {
	if (env[key] === undefined) { // ← Corregido: era !env === undefined
		throw new Error(`Error config: The ${key} environment variable is missing`);
	}
}

/**
 * Se usa Record<string, string> para "asegurar" a TypeScript que todas las 
 * propiedades de 'env' son strings y no 'undefined'. 
 * Record<Llave, Valor> mapea tipos de un objeto.
 */
const validatedEnv = env as Record<string, string>;

export const {
	DB_USER,
	DB_HOST,
	DB_NAME,
	DB_PASSWORD,
	PROTOCOL,
	DOMAIN,
	CLIENT_URLS
} = validatedEnv;

// Convertir a number para TypeScript
export const DB_PORT = Number(validatedEnv.DB_PORT);
export const PORT = Number(validatedEnv.PORT);

export const API_URL = buildApiUrl({ PROTOCOL, DOMAIN, PORT: String(PORT) });