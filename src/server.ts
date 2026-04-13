import { connectDB } from './config/database.js';
import { createApp } from './app.js';
import { env } from './config/env.js';

async function bootstrap() {
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`[INFO] Tienda backend corriendo en http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[ERROR] No se pudo arrancar el servidor:', err);
  process.exit(1);
});
