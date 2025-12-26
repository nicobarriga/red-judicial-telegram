import { Context, InlineKeyboard } from 'grammy';
import { config } from '../config';
import { getActiveTopics, markInviteUsed } from '../database/client';

function getDeepLinkStart(): string | null {
  if (!config.botUsername) return null;
  return `https://t.me/${config.botUsername}?start=registro`;
}

function mentionMarkdown(user: any): string {
  // Preferir @username si existe; si no, mención por link a user id (funciona en grupos/supergrupos).
  if (user?.username) return `@${user.username}`;
  const name = String(user?.first_name || 'Hola').replace(/\[/g, '(').replace(/\]/g, ')');
  const id = user?.id;
  if (typeof id === 'number') return `[${name}](tg://user?id=${id})`;
  return name;
}

// Deduplicación simple para evitar doble saludo (chat_member + new_chat_members).
const recentlyWelcomed = new Map<string, number>();
function shouldWelcome(chatId: number, userId: number, windowMs = 60_000): boolean {
  const key = `${chatId}:${userId}`;
  const now = Date.now();
  const last = recentlyWelcomed.get(key);
  if (last && now - last < windowMs) return false;
  recentlyWelcomed.set(key, now);
  // limpieza best-effort
  for (const [k, ts] of recentlyWelcomed.entries()) {
    if (now - ts > windowMs * 5) recentlyWelcomed.delete(k);
  }
  return true;
}

async function sendWelcome(params: { ctx: Context; chatId: number; user: any; usedInvite?: string | null }): Promise<void> {
  const { ctx, chatId, user, usedInvite } = params;
  if (!user) return;

  // Restringir a grupo principal si está configurado
  if (typeof config.mainGroupChatId === 'number' && chatId !== config.mainGroupChatId) {
    return;
  }

  if (typeof user?.id === 'number' && !shouldWelcome(chatId, user.id)) {
    return;
  }

  // Marcar invite usado (si Telegram lo entrega)
  if (typeof usedInvite === 'string' && usedInvite.startsWith('http')) {
    try {
      await markInviteUsed({ inviteLink: usedInvite });
    } catch (e) {
      console.error('No se pudo marcar invite usado:', e);
    }
  }

  const mention = mentionMarkdown(user);
  const botLink = config.botUsername ? `https://t.me/${config.botUsername}` : null;

  let topicsText = '';
  try {
    const topics = await getActiveTopics();
    if (topics?.length) {
      topicsText =
        '\n\n**Temas disponibles** (elige el que corresponda):\n' +
        topics.map((t) => `- ${t.titulo}`).join('\n');
    }
  } catch (e) {
    console.error('Error obteniendo temas para bienvenida:', e);
  }

  const text =
    `Hola ${mention}, bienvenid@ al Grupo Privado de **Red Judicial**.\n\n` +
    `Te dejamos una guía rápida de uso\n\n` +
    `**Uso recomendado**\n` +
    `- Utiliza el tema correspondiente a tu materia\n` +
    `- Preguntas claras, con contexto mínimo (hechos + etapa + qué necesitas)\n` +
    `- Publicidad/servicios solo en el tema **“Oportunidades Laborales”**\n` +
    `- Mantengamos orden, utilidad y respeto profesional` +
    topicsText +
    (botLink ? `\n\nPor último, si quieres invitar a alguien puedes compartir el siguiente link: ${botLink}` : '');

  try {
    const keyboard = botLink ? new InlineKeyboard().url('🤖 Abrir bot', botLink) : undefined;

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

/**
 * Saluda a nuevos miembros cuando entran al grupo principal.
 * - Si WELCOME_TOPIC_ID está configurado, publica dentro del tema "Bienvenida".
 * - Mensaje silencioso para evitar spam de notificaciones al resto.
 */
export async function handleGroupWelcome(ctx: Context): Promise<void> {
  const upd: any = (ctx as any).update;

  // 1) Preferimos service message new_chat_members (más confiable)
  const msg: any = (ctx as any).message;
  const newMembers: any[] | undefined = msg?.new_chat_members;
  if (Array.isArray(newMembers) && newMembers.length > 0) {
    const chatId = ctx.chat?.id;
    if (typeof chatId !== 'number') return;
    const usedInvite: string | null = msg?.invite_link?.invite_link || null;
    for (const u of newMembers) {
      await sendWelcome({ ctx, chatId, user: u, usedInvite });
    }
    return;
  }

  // 2) Fallback: chat_member update
  const chatMember = upd?.chat_member;
  if (!chatMember) return;

  const chatId: number | undefined = chatMember.chat?.id;
  if (typeof chatId !== 'number') return;

  const oldStatus: string | undefined = chatMember.old_chat_member?.status;
  const newStatus: string | undefined = chatMember.new_chat_member?.status;
  const user = chatMember.new_chat_member?.user;

  const isJoin =
    (oldStatus === 'left' || oldStatus === 'kicked') &&
    (newStatus === 'member' || newStatus === 'restricted');

  if (!isJoin || !user) return;

  const usedInvite: string | null =
    chatMember?.invite_link?.invite_link || chatMember?.invite_link?.invite_link?.invite_link || null;

  await sendWelcome({ ctx, chatId, user, usedInvite });
}


