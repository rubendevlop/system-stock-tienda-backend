import { Router } from 'express';

import { requireAuth } from './middleware/auth.js';
import { loginHandler, registerHandler } from './modules/auth/auth.controller.js';
import {
  createMPPreference,
  getMPAuthUrlHandler,
  getMPStatusHandler,
  getTransferInfo,
  mpCallbackHandler,
} from './modules/checkout/checkout.controller.js';
import { getCatalogHandler } from './modules/products/products.controller.js';
import { asyncHandler } from './utils/async-handler.js';

export const router = Router();

router.get('/', (_req, res) => res.json({ ok: true, service: 'system-stock-tienda-backend' }));
router.get('/health', (_req, res) => res.json({ ok: true, service: 'system-stock-tienda-backend' }));
router.get('/favicon.ico', (_req, res) => res.status(204).end());

router.post('/auth/login', asyncHandler(loginHandler));
router.post('/auth/register', asyncHandler(registerHandler));

router.get('/products/catalog', asyncHandler(getCatalogHandler));

router.get('/checkout/transfer-info', getTransferInfo);
router.get('/checkout/mp-callback', asyncHandler(mpCallbackHandler));
router.post('/checkout/mercadopago', requireAuth, asyncHandler(createMPPreference));
router.get('/checkout/mp-auth-url', requireAuth, getMPAuthUrlHandler);
router.get('/checkout/mp-status', requireAuth, asyncHandler(getMPStatusHandler));
