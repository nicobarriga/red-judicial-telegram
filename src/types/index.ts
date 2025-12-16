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
  phone_number?: string | null;
  email?: string | null;
  is_lawyer?: boolean | null;
  profession_or_study?: string | null;
  onboarding_step?: string | null;
  onboarding_completed?: boolean | null;
  joined_at: string;
  origen: string;
  updated_at?: string;
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
  mainGroupChatId?: number; // ID numérico del grupo principal (para saludar al entrar)
  botUsername?: string; // Username del bot (para deep link)
  welcomeAutoDeleteSeconds?: number; // Borra el mensaje de bienvenida tras N segundos (opcional)
  welcomeTopicId?: number; // message_thread_id del tema "Bienvenida" (opcional)
  port: number;
}

