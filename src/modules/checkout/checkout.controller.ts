import type { Request, Response } from 'express';
import { z } from 'zod';

import { env, storeFrontendUrl } from '../../config/env.js';
import { SettingsModel } from '../../models/index.js';

const MP_API = 'https://api.mercadopago.com';

const createPreferenceSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string().trim().min(1, 'El titulo del item es obligatorio.'),
        quantity: z.number().int().positive('La cantidad debe ser mayor a cero.'),
        unit_price: z.number().positive('El precio unitario debe ser mayor a cero.'),
      }),
    )
    .min(1, 'Debes enviar al menos un item.'),
  payer: z.object({
    email: z.string().email('Ingresa un correo valido para el comprador.'),
    name: z.string().trim().min(2, 'El nombre del comprador es obligatorio.'),
  }),
});

/**
 * Construye la URL OAuth para conectar Mercado Pago con la tienda.
 */
export function getMPAuthUrlHandler(_request: Request, response: Response): void {
  if (!env.MERCADOPAGO_CLIENT_ID || !env.MERCADOPAGO_REDIRECT_URI) {
    response.status(503).json({
      message: 'MERCADOPAGO_CLIENT_ID y MERCADOPAGO_REDIRECT_URI son requeridos.',
    });
    return;
  }

  const params = new URLSearchParams({
    client_id: env.MERCADOPAGO_CLIENT_ID,
    response_type: 'code',
    platform_id: 'mp',
    redirect_uri: env.MERCADOPAGO_REDIRECT_URI,
    state: env.MERCADOPAGO_OAUTH_STATE_SECRET ?? crypto.randomUUID(),
  });

  response.json({
    authUrl: `https://auth.mercadopago.com/authorization?${params.toString()}`,
  });
}

/**
 * Intercambia el code OAuth por tokens y los guarda en settings.
 */
export async function mpCallbackHandler(request: Request, response: Response): Promise<void> {
  const code = typeof request.query.code === 'string' ? request.query.code : undefined;
  const state = typeof request.query.state === 'string' ? request.query.state : undefined;

  if (!code) {
    response.status(400).send('Codigo OAuth ausente.');
    return;
  }

  if (env.MERCADOPAGO_OAUTH_STATE_SECRET && state !== env.MERCADOPAGO_OAUTH_STATE_SECRET) {
    response.status(403).send('State OAuth invalido.');
    return;
  }

  const tokenRes = await fetch(`${MP_API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_secret: env.MERCADOPAGO_CLIENT_SECRET ?? '',
      client_id: env.MERCADOPAGO_CLIENT_ID ?? '',
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.MERCADOPAGO_REDIRECT_URI ?? '',
    }),
  });

  if (!tokenRes.ok) {
    const err = (await tokenRes.json()) as { message?: string };
    response.status(502).send(`Error MP: ${err.message ?? 'desconocido'}`);
    return;
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    user_id: number;
    public_key?: string;
  };

  await SettingsModel.findOneAndUpdate(
    { key: 'app' },
    {
      mpAccessToken: tokens.access_token,
      mpRefreshToken: tokens.refresh_token,
      mpUserId: String(tokens.user_id),
      mpPublicKey: tokens.public_key ?? env.MERCADOPAGO_PUBLIC_KEY ?? '',
    },
    { upsert: true },
  );

  response.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px">
    <h2>Mercado Pago conectado</h2>
    <p>Los pagos de la tienda llegaran directamente a tu cuenta.</p>
    <script>setTimeout(()=>window.close(),2000);</script>
  </body></html>`);
}

/**
 * Devuelve el estado de integracion con Mercado Pago.
 */
export async function getMPStatusHandler(_request: Request, response: Response): Promise<void> {
  const settings = await SettingsModel.findOne({ key: 'app' })
    .select('mpAccessToken mpUserId')
    .lean();

  response.json({
    connected: Boolean(settings?.mpAccessToken),
    userId: settings?.mpUserId ?? null,
  });
}

/**
 * Crea una preferencia de pago usando items y comprador ya validados.
 */
export async function createMPPreference(request: Request, response: Response): Promise<void> {
  const settings = await SettingsModel.findOne({ key: 'app' }).select('mpAccessToken').lean();
  const accessToken = settings?.mpAccessToken || env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    response.status(503).json({
      message: 'Conecta tu cuenta de Mercado Pago en el panel de administracion.',
    });
    return;
  }

  const { items, payer } = createPreferenceSchema.parse(request.body);

  const prefRes = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      items: items.map((item) => ({
        id: crypto.randomUUID(),
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'ARS',
      })),
      payer: {
        email: payer.email,
        name: payer.name,
      },
      back_urls: {
        success: `${storeFrontendUrl}/?pago=ok`,
        failure: `${storeFrontendUrl}/?pago=error`,
        pending: `${storeFrontendUrl}/?pago=pendiente`,
      },
      auto_return: 'approved',
    }),
  });

  if (!prefRes.ok) {
    const err = (await prefRes.json()) as { message?: string };
    response.status(502).json({
      message: err.message ?? 'Error al crear la preferencia de pago.',
    });
    return;
  }

  const pref = (await prefRes.json()) as { init_point: string; id: string };
  response.json({ init_point: pref.init_point, id: pref.id });
}

/**
 * Devuelve los datos de transferencia bancaria visibles para el checkout.
 */
export function getTransferInfo(_request: Request, response: Response): void {
  response.json({
    cbu: env.STORE_TRANSFER_CBU ?? '',
    alias: env.STORE_TRANSFER_ALIAS ?? '',
    bank: env.STORE_TRANSFER_BANK ?? '',
    whatsapp: env.STORE_WHATSAPP_NUMBER ?? '',
  });
}
