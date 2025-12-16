import { Context } from 'grammy';
import { config } from '../config';

function isTargetGroup(ctx: Context): boolean {
  const chatId = ctx.chat?.id;
  if (typeof chatId !== 'number') return false;
  if (typeof config.mainGroupChatId === 'number') return chatId === config.mainGroupChatId;
  return true; // si no está configurado, aplica a cualquier grupo donde esté el bot (no recomendado)
}

/**
 * Borra mensajes de servicio "X se unió / X salió" para reducir ruido.
 * Requiere que el bot sea admin con permiso de borrar mensajes.
 */
export async function handleDeleteServiceMessages(ctx: Context): Promise<void> {
  if (!config.deleteServiceMessages) return;
  if (!ctx.message) return;
  if (ctx.chat?.type === 'private') return;
  if (!isTargetGroup(ctx)) return;

  const msg: any = ctx.message;
  const isJoin = Array.isArray(msg.new_chat_members) && msg.new_chat_members.length > 0;
  const isLeave = !!msg.left_chat_member;

  if (!isJoin && !isLeave) return;

  try {
    await ctx.api.deleteMessage(ctx.chat!.id, msg.message_id);
  } catch (e) {
    // Si no tiene permisos, fallará aquí.
    console.error('No se pudo borrar mensaje de servicio:', e);
  }
}


