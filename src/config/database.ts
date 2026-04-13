import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  mongoose.connection.on('connected', () => {
    const host = mongoose.connection.host;
    console.log(`[INFO] MongoDB conectado en ${host}`);
  });
  await mongoose.connect(env.MONGODB_URI);
}
