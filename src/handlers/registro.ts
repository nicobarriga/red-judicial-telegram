import { CommandContext, Context, InlineKeyboard } from 'grammy';
import { getOrCreateUser } from '../database/client';
import { config } from '../config';

/**
 * /registro
 * Abre la Web App para actualizar datos (solo privado).
 */
export async function handleRegistro(ctx: CommandContext<Context>): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  // En grupos, redirigir a privado
  if (ctx.chat?.type !== 'private') {
    const deepLink = config.botUsername ? `https://t.me/${config.botUsername}?start=registro` : undefined;
    await ctx.reply(
      'Para actualizar tu registro, escríbeme por **privado**.\n' +
        (deepLink ? `👉 ${deepLink}` : '👉 Abre el bot y presiona “Iniciar”'),
      { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
    );
    return;
  }

  // Asegurar usuario
  await getOrCreateUser(from.id, from.username, from.first_name, from.last_name, 'direct_bot');

  const webAppUrl = config.webhookDomain ? `${config.webhookDomain}/webapp/registro` : undefined;
  if (!webAppUrl) {
    await ctx.reply('⚠️ Falta configurar WEBHOOK_DOMAIN. No puedo abrir el formulario.');
    return;
  }

  const kb = new InlineKeyboard().webApp('📝 Actualizar registro', webAppUrl);
  await ctx.reply('Abre el formulario para actualizar tu registro:', { reply_markup: kb });
}


