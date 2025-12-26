import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

export const config: Config = {
  botToken: process.env.BOT_TOKEN || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || '',
  folderInviteUrl: process.env.FOLDER_INVITE_URL || '',
  webhookDomain: process.env.WEBHOOK_DOMAIN,
  mainGroupChatId: process.env.MAIN_GROUP_CHAT_ID ? parseInt(process.env.MAIN_GROUP_CHAT_ID, 10) : undefined,
  botUsername: process.env.BOT_USERNAME,
  welcomeAutoDeleteSeconds: process.env.WELCOME_AUTO_DELETE_SECONDS
    ? parseInt(process.env.WELCOME_AUTO_DELETE_SECONDS, 10)
    : undefined,
  welcomeTopicId: process.env.WELCOME_TOPIC_ID ? parseInt(process.env.WELCOME_TOPIC_ID, 10) : undefined,
  deleteServiceMessages: ['1', 'true', 'yes', 'on'].includes((process.env.DELETE_SERVICE_MESSAGES || '').toLowerCase()),
  // Keep-alive de Supabase (plan free). Por defecto habilitado cada 24h.
  supabaseKeepAliveEnabled: !['0', 'false', 'no', 'off'].includes(
    String(process.env.SUPABASE_KEEPALIVE_ENABLED || 'true').toLowerCase()
  ),
  supabaseKeepAliveIntervalHours: process.env.SUPABASE_KEEPALIVE_INTERVAL_HOURS
    ? parseInt(process.env.SUPABASE_KEEPALIVE_INTERVAL_HOURS, 10)
    : 24,
  port: parseInt(process.env.PORT || '3000', 10),
};

// Validar configuración requerida
export function validateConfig(): void {
  const required = ['botToken', 'supabaseUrl', 'supabaseKey'];
  const missing = required.filter(key => !config[key as keyof Config]);
  
  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  }
}

