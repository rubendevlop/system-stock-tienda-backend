import { Schema, model, models } from 'mongoose';

// Estos modelos leen de la MISMA colección que el backend principal
// por eso usan los mismos nombres de colección (Mongoose pluraliza el nombre)

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'CLIENT';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'EMPLOYEE', 'CLIENT'], default: 'CLIENT' },
  active: { type: Boolean, default: true },
}, { timestamps: true, collection: 'users' });

export const UserModel = models.User || model('User', userSchema);

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  salePrice: { type: Number, required: true },
  supplierPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  imageUrl: { type: String, default: '' },
}, { timestamps: true, collection: 'products' });

export const ProductModel = models.Product || model('Product', productSchema);

// Settings (para el token de MP guardado por el admin)
const settingsSchema = new Schema({
  key: { type: String, default: 'app', unique: true },
  mpAccessToken: { type: String, default: '' },
  mpRefreshToken: { type: String, default: '' },
  mpUserId: { type: String, default: '' },
  mpPublicKey: { type: String, default: '' },
}, { collection: 'appsettings' });

export const SettingsModel = models.AppSettings || model('AppSettings', settingsSchema);
