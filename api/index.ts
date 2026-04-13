import { createApp } from '../src/app.js';
import { prepareAppRuntime } from '../src/bootstrap.js';

const app = createApp();

/**
 * Entry point de Vercel: prepara runtime y delega el request a Express.
 */
export default async function handler(request: any, response: any): Promise<void> {
  await prepareAppRuntime();
  app(request, response);
}
