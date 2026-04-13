import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4020),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().trim().optional().default(''),
  JWT_SECRET: z.string().trim().optional().default(''),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_APP_URL: z.string().optional(),
  STORE_FRONTEND_URL: z.string().default('http://127.0.0.1:5500'),
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_PUBLIC_KEY: z.string().optional(),
  MERCADOPAGO_CLIENT_ID: z.string().optional(),
  MERCADOPAGO_CLIENT_SECRET: z.string().optional(),
  MERCADOPAGO_REDIRECT_URI: z.string().optional(),
  MERCADOPAGO_OAUTH_STATE_SECRET: z.string().optional(),
  STORE_TRANSFER_CBU: z.string().optional(),
  STORE_TRANSFER_ALIAS: z.string().optional(),
  STORE_TRANSFER_BANK: z.string().optional(),
  STORE_WHATSAPP_NUMBER: z.string().optional(),
});

export const env = envSchema.parse(process.env);

/**
 * Crea un error uniforme para variables de entorno faltantes o invalidas.
 */
function createEnvError(message: string): Error & { status: number } {
  const error = new Error(message) as Error & { status: number };
  error.status = 500;

  return error;
}

/**
 * Devuelve la URI de MongoDB o lanza un error controlado si falta.
 */
export function getMongoDbUri(): string {
  if (!env.MONGODB_URI) {
    throw createEnvError('MONGODB_URI es requerida para acceder a la base de datos.');
  }

  return env.MONGODB_URI;
}

/**
 * Devuelve el secreto JWT o lanza un error controlado si no es valido.
 */
export function getJwtSecret(): string {
  if (env.JWT_SECRET.length < 16) {
    throw createEnvError('JWT_SECRET debe tener al menos 16 caracteres.');
  }

  return env.JWT_SECRET;
}

/**
 * Resuelve la URL publica esperada del frontend de tienda.
 */
export const storeFrontendUrl = env.CLIENT_APP_URL ?? env.STORE_FRONTEND_URL;
