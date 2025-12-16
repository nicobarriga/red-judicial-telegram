import { Context } from 'grammy';
import { config } from '../config';
import { initSupabase } from '../database/client';

/**
 * Maneja solicitudes de ingreso (Join Requests).
 * - Si el usuario está registrado (onboarding_completed=true), aprueba automáticamente.
 * - Si no está registrado, deja la solicitud pendiente y (si es posible) le envía DM con instrucciones.
 *
 * Nota: el bot solo puede enviar DM si el usuario ya inició chat con el bot antes.
 */
export async function handleJoinRequest(ctx: Context): Promise<void> {
  try {
    const upd: any = (ctx as any).update;
    const req = upd?.chat_join_request;
    if (!req) return;

    const chatId: number | undefined = req.chat?.id;
    const userId: number | undefined = req.from?.id;
    if (typeof chatId !== 'number' || typeof userId !== 'number') return;

    // Solo operar sobre el grupo principal si está configurado
    if (typeof config.mainGroupChatId === 'number' && chatId !== config.mainGroupChatId) return;

    const sb = initSupabase();
    const { data: userRow, error } = await sb
      .from('telegram_users')
      .select('telegram_id,onboarding_completed')
      .eq('telegram_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error consultando usuario para join request:', error);
      return;
    }

    const isRegistered = !!userRow?.onboarding_completed;

    if (isRegistered) {
      try {
        await ctx.api.approveChatJoinRequest(chatId, userId);
      } catch (e) {
        // Si ya fue aprobado/manual, esto puede fallar. No es crítico.
        console.error('No se pudo aprobar join request:', e);
      }
      return;
    }

    // No registrado: dejar pendiente y enviar instrucciones por privado (si es posible)
    const deepLink = config.botUsername ? `https://t.me/${config.botUsername}?start=registro` : null;
    const msg =
      'Para ingresar a **Red Judicial**, primero necesitas completar el registro (1 minuto).\n\n' +
      (deepLink ? `👉 ${deepLink}` : '👉 Abre el bot y presiona “Iniciar”') +
      '\n\nUna vez registrado, tu solicitud se aprueba automáticamente.';

    try {
      await ctx.api.sendMessage(userId, msg, {
        parse_mode: 'Markdown',
        link_preview_options: { is_disabled: true },
      });
    } catch {
      // Si el usuario nunca inició el bot, Telegram no permite DM. Lo ignoramos.
    }
  } catch (e) {
    console.error('Error en handleJoinRequest:', e);
  }
}


