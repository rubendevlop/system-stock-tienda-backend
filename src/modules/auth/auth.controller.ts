import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { env } from '../../config/env.js';
import { UserModel } from '../../models/index.js';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo valido.'),
  password: z.string().min(1, 'La contrasena es obligatoria.'),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es obligatorio.'),
  email: z.string().email('Ingresa un correo valido.'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres.'),
});

/**
 * Firma el JWT de sesion usando el secreto configurado.
 */
function signToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as `${number}${'s' | 'm' | 'h' | 'd'}`,
  });
}

/**
 * Autentica a un usuario existente y devuelve su sesion.
 */
export async function loginHandler(request: Request, response: Response): Promise<void> {
  const { email, password } = loginSchema.parse(request.body);

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    response.status(401).json({ message: 'Credenciales invalidas.' });
    return;
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    response.status(401).json({ message: 'Credenciales invalidas.' });
    return;
  }

  if (!user.active) {
    response.status(403).json({ message: 'Tu cuenta esta desactivada.' });
    return;
  }

  response.json({
    data: {
      token: signToken(String(user.id), user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
}

/**
 * Registra clientes de la tienda y devuelve una sesion inicial.
 */
export async function registerHandler(request: Request, response: Response): Promise<void> {
  const { name, email, password } = registerSchema.parse(request.body);

  const normalizedEmail = email.toLowerCase();
  const existingUser = await UserModel.findOne({ email: normalizedEmail });
  if (existingUser) {
    response.status(400).json({ message: 'El correo ya esta registrado.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'CLIENT',
    active: true,
  });

  response.status(201).json({
    data: {
      token: signToken(String(user.id), user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
}
