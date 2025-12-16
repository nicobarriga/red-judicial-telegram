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

  const link = await api.createChatInviteLink(chatId, {
    member_limit: 1,
    name: `RJ ${telegramUserId} ${new Date().toISOString().slice(0, 10)}`,
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


