let appPromise: Promise<((request: any, response: any) => void)> | null = null;
const fallbackCorsOrigin = 'https://manolotienda.netlify.app';
const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Carga Express de forma lazy para capturar errores de arranque dentro del handler serverless.
 */
async function getApp() {
  if (!appPromise) {
    appPromise = import('../src/app.js').then(({ createApp }) => createApp());
  }

  try {
    return await appPromise;
  } catch (error) {
    appPromise = null;
    throw error;
  }
}

/**
 * Determina si la ruta necesita la conexion a Mongo antes de despachar la request.
 */
function requiresDatabase(request: any): boolean {
  const requestUrl = typeof request?.url === 'string' ? request.url : '';
  const pathname = requestUrl.split('?')[0];

  return !['/', '/health', '/checkout/transfer-info', '/favicon.ico'].includes(pathname);
}

/**
 * Expone CORS minimo incluso cuando Express todavia no pudo arrancar.
 */
function applyFallbackCorsHeaders(request: any, response: any): void {
  const originHeader = request?.headers?.origin;
  const origin = typeof originHeader === 'string' ? originHeader : '';
  const allowedOrigin =
    origin && (origin === fallbackCorsOrigin || localhostPattern.test(origin))
      ? origin
      : fallbackCorsOrigin;

  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Entry point de Vercel: prepara runtime y delega el request a Express.
 */
export default async function handler(request: any, response: any): Promise<void> {
  if (request?.method === 'OPTIONS') {
    applyFallbackCorsHeaders(request, response);
    response.statusCode = 204;
    response.end();
    return;
  }

  try {
    const [{ prepareAppRuntime }, app] = await Promise.all([
      import('../src/bootstrap.js'),
      getApp(),
    ]);

    if (requiresDatabase(request)) {
      await prepareAppRuntime();
    }

    app(request, response);
  } catch (error) {
    console.error('[ERROR] Vercel handler bootstrap failed:', error);

    if (response.headersSent) {
      return;
    }

    applyFallbackCorsHeaders(request, response);
    response.statusCode = 500;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(
      JSON.stringify({
        message: 'El backend no pudo iniciar correctamente.',
        hint: 'Revisa las variables de entorno en Vercel y la conexion a MongoDB.',
      }),
    );
  }
}
