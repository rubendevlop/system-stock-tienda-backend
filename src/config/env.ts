import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4020),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
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
 * Resuelve la URL publica esperada del frontend de tienda.
 */
export const storeFrontendUrl = env.CLIENT_APP_URL ?? env.STORE_FRONTEND_URL;
