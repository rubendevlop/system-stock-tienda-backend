# System Stock Tienda Backend

API Express para la tienda online conectada a la misma base MongoDB del sistema de stock.

## Stack

- Node.js
- Express
- MongoDB + Mongoose
- TypeScript
- Zod

## Scripts

- `npm run dev`: desarrollo local con recarga
- `npm run build`: compila TypeScript a `dist`
- `npm start`: ejecuta el build local

## Variables de entorno

Crear `.env` a partir de `.env.example`.

Variables principales:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_APP_URL`
- `MERCADOPAGO_REDIRECT_URI`

## Desarrollo local

```bash
npm install
npm run dev
```

La API queda disponible en `http://127.0.0.1:4020`.

## Deploy en Vercel

El repo ya incluye:

- `api/index.ts` como entrypoint serverless
- `vercel.json` con rewrite de todas las rutas hacia Express
- cache de conexion Mongo para funciones serverless

Variables recomendadas en Vercel:

- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_APP_URL=https://manolotienda.netlify.app`
- `MERCADOPAGO_REDIRECT_URI=https://tiendamanolo.vercel.app/checkout/mp-callback`

## Como se conecta con el frontend

Este backend esta pensado para ser consumido por `system-stock-tienda-frontend`.

- local: `http://127.0.0.1:4020`
- Vercel previsto: `https://tiendamanolo.vercel.app`

Endpoints principales:

- `POST /auth/login`
- `POST /auth/register`
- `GET /products/catalog`
- `GET /checkout/transfer-info`
- `POST /checkout/mercadopago`
- `GET /checkout/mp-auth-url`
- `GET /checkout/mp-status`
