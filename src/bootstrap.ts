import { connectDB } from './config/database.js';

let runtimePromise: Promise<void> | null = null;

/**
 * Prepara recursos compartidos para procesos locales y funciones serverless.
 */
export async function prepareAppRuntime(): Promise<void> {
  if (!runtimePromise) {
    runtimePromise = connectDB();
  }

  try {
    await runtimePromise;
  } catch (error) {
    runtimePromise = null;
    throw error;
  }
}
