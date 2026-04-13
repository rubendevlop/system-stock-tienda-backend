import mongoose from 'mongoose';
import { env } from './env.js';

let connectionPromise: Promise<typeof mongoose> | null = null;
let hasLoggedConnection = false;

/**
 * Abre la conexion principal a MongoDB reutilizando el pool global en serverless.
 */
export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.MONGODB_URI);
  }

  try {
    await connectionPromise;

    if (!hasLoggedConnection) {
      hasLoggedConnection = true;
      console.log(`[INFO] MongoDB conectado en ${mongoose.connection.host}`);
    }
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}
