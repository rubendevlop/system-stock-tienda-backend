import type { Request, Response } from 'express';
import { ProductModel } from '../../models/index.js';

/** GET /products/catalog — público, solo productos ACTIVE con stock > 0 */
export async function getCatalogHandler(_request: Request, response: Response): Promise<void> {
  const products = await ProductModel.find({ status: 'ACTIVE', stock: { $gt: 0 } })
    .select('name description category salePrice stock imageUrl')
    .sort({ createdAt: -1 })
    .lean();

  response.json({ data: products });
}
