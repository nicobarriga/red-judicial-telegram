import type { Api } from 'grammy';
import { initSupabase, recordUserInvite } from '../database/client';

/**
 * Crea un link de invitación de 1 uso para un usuario y lo registra en Supabase.
 */
export async function createOneTimeInviteLink(params: {
  api: Api;
  chatId: number;
  telegramUserId: number;
}): Promise<string> {
  const { api, chatId, telegramUserId } = params;

  // Asegurar Supabase inicializado (por si se llama desde rutas HTTP)
  initSupabase();

  // Nombre corto y único (Telegram limita el name a 32 chars)
  const yymmdd = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6);
  const name = `RJ${telegramUserId}-${yymmdd}-${rand}`.slice(0, 32);

  const link = await api.createChatInviteLink(chatId, {
    member_limit: 1,
    creates_join_request: false,
    name,
  });

  const inviteUrl = link.invite_link;
  await recordUserInvite({ telegramUserId, chatId, inviteLink: inviteUrl });
  return inviteUrl;
}

export async function isUserInChat(params: {
  api: Api;
  chatId: number;
  telegramUserId: number;
}): Promise<boolean> {
  const { api, chatId, telegramUserId } = params;
  try {
    const m = await api.getChatMember(chatId, telegramUserId);
    // status: creator | administrator | member | restricted | left | kicked
    return m.status !== 'left' && m.status !== 'kicked';
  } catch {
    return false;
  }
}


