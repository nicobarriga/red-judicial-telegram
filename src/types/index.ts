// Tipos para la base de datos
export interface TelegramGroup {
  id: number;
  nombre: string;
  invite_link: string;
  descripcion: string | null;
  activo: boolean;
}

export interface TelegramTopic {
  id: number;
  slug: string;
  titulo: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

export interface TelegramUser {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  joined_at: string;
  origen: string;
}

export interface UserTopicInterest {
  id: number;
  telegram_user_id: number;
  topic_slug: string;
  clicked_at: string;
}

// Tipos para la configuración
export interface Config {
  botToken: string;
  supabaseUrl: string;
  supabaseKey: string;
  folderInviteUrl?: string; // Opcional ahora que usamos temas
  webhookDomain?: string;
  port: number;
}

