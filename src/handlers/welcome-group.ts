import { Context, InlineKeyboard } from 'grammy';
import { config } from '../config';
import { getActiveTopics, markInviteUsed } from '../database/client';

function getDeepLinkStart(): string | null {
  if (!config.botUsername) return null;
  return `https://t.me/${config.botUsername}?start=registro`;
}

/**
 * Saluda a nuevos miembros cuando entran al grupo principal.
 * - Si WELCOME_TOPIC_ID está configurado, publica dentro del tema "Bienvenida".
 * - Mensaje silencioso para evitar spam de notificaciones al resto.
 */
export async function handleGroupWelcome(ctx: Context): Promise<void> {
  const upd: any = (ctx as any).update;
  const chatMember = upd?.chat_member;
  if (!chatMember) return;

  const chatId: number | undefined = chatMember.chat?.id;
  if (typeof chatId !== 'number') return;

  // Restringir a grupo principal si está configurado
  if (typeof config.mainGroupChatId === 'number' && chatId !== config.mainGroupChatId) {
    return;
  }

  const oldStatus: string | undefined = chatMember.old_chat_member?.status;
  const newStatus: string | undefined = chatMember.new_chat_member?.status;
  const user = chatMember.new_chat_member?.user;

  const isJoin =
    (oldStatus === 'left' || oldStatus === 'kicked') &&
    (newStatus === 'member' || newStatus === 'restricted');

  if (!isJoin || !user) return;

  // Registrar en Supabase el invite link usado (si Telegram lo entrega en el update)
  try {
    const usedInvite = chatMember?.invite_link?.invite_link || chatMember?.invite_link?.invite_link?.invite_link;
    if (typeof usedInvite === 'string' && usedInvite.startsWith('http')) {
      await markInviteUsed({ inviteLink: usedInvite });
    }
  } catch (e) {
    console.error('No se pudo marcar invite usado:', e);
  }

  const mention = user.username ? `@${user.username}` : (user.first_name || 'Hola');
  const deepLink = getDeepLinkStart();

  let topicsText = '';
  try {
    const topics = await getActiveTopics();
    if (topics?.length) {
      // Lista compacta para que quede legible en el tema de Bienvenida
      topicsText =
        '\n\n**Temas disponibles** (elige el que corresponda):\n' +
        topics.map((t) => `- ${t.titulo}`).join('\n');
    }
  } catch (e) {
    console.error('Error obteniendo temas para bienvenida:', e);
  }

  const text =
    `${mention} — **Guía rápida de uso**\n\n` +
    `**Uso recomendado**\n` +
    `- Utiliza el tema correspondiente a tu materia\n` +
    `- Preguntas claras, con contexto mínimo (hechos + etapa + qué necesitas)\n` +
    `- Publicidad/servicios solo en el tema **“Oportunidades Laborales”**\n` +
    `- Mantengamos orden, utilidad y respeto profesional` +
    topicsText;

  try {
    // En modo privado, el usuario ya viene registrado; dejamos botón opcional para actualizar datos.
    const keyboard = deepLink ? new InlineKeyboard().url('✍️ Actualizar registro', deepLink) : undefined;

    const sent = await ctx.api.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
      link_preview_options: { is_disabled: true },
      disable_notification: true,
      ...(typeof config.welcomeTopicId === 'number' ? { message_thread_id: config.welcomeTopicId } : {}),
    });

    if (config.welcomeAutoDeleteSeconds && Number.isFinite(config.welcomeAutoDeleteSeconds)) {
      const ms = Math.max(5, config.welcomeAutoDeleteSeconds) * 1000;
      setTimeout(() => {
        ctx.api.deleteMessage(chatId, sent.message_id).catch(() => undefined);
      }, ms);
    }
  } catch (e) {
    console.error('Error enviando saludo al grupo:', e);
  }
}


