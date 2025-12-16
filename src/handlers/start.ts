import { CommandContext, Context } from 'grammy';
import { getOrCreateUser, getUserByTelegramId } from '../database/client';
import { InlineKeyboard } from 'grammy';
import { sendMenu } from './onboarding';
import { config } from '../config';
import { createOneTimeInviteLink, isUserInChat } from '../utils/inviteLinks';

/**
 * Handler para el comando /start
 */
export async function handleStart(ctx: CommandContext<Context>): Promise<void> {
  try {
    const user = ctx.from;
    if (!user) {
      return;
    }

    // Si /start se ejecuta en un grupo, redirigir a privado (evitar onboarding público)
    if (ctx.chat?.type !== 'private') {
      const deepLink = config.botUsername ? `https://t.me/${config.botUsername}?start=registro` : undefined;
      const msg =
        '👋 ¡Bienvenido/a a Red Judicial!\n\n' +
        'Para completar/actualizar tu registro y ver los temas, por favor escríbeme por **privado**.\n' +
        (deepLink ? `👉 ${deepLink}` : '👉 Abre el bot y presiona “Iniciar”');
      await ctx.reply(msg, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
      return;
    }

    // Registrar o actualizar usuario
    await getOrCreateUser(
      user.id,
      user.username,
      user.first_name,
      user.last_name,
      'direct_bot'
    );

    const payload = String((ctx as any).match || '').trim();
    const dbUser = await getUserByTelegramId(user.id);
    const webAppUrl = config.webhookDomain ? `${config.webhookDomain}/webapp/registro` : undefined;

    if (dbUser && dbUser.onboarding_completed) {
      // Si vino por deep link de registro pero ya está registrado, mostrar menú y explicar cómo actualizar
      if (payload === 'registro') {
        await ctx.reply('✅ Ya estás registrado.\n\nSi quieres **actualizar tus datos**, usa /registro.', { parse_mode: 'Markdown' });
      }

      // Si el grupo es privado y el usuario no está dentro, entregarle link personal (1 uso)
      if (typeof config.mainGroupChatId === 'number') {
        const inGroup = await isUserInChat({ api: ctx.api, chatId: config.mainGroupChatId, telegramUserId: user.id });
        if (!inGroup) {
          try {
            const invite = await createOneTimeInviteLink({
              api: ctx.api,
              chatId: config.mainGroupChatId,
              telegramUserId: user.id,
            });
            await ctx.reply(
              '🔐 Aquí tienes tu link **personal** para entrar al grupo (es de **1 uso**):\n' +
                `${invite}\n\n` +
                'Si ya lo usaste o te da error, usa /registro para generar uno nuevo.',
              { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
            );
          } catch (e) {
            console.error('Error creando invite link (start):', e);
            await ctx.reply(
              '🔐 Estás registrado, pero no pude generar tu link de acceso ahora. ' +
                'Por favor avisa a un administrador para revisar permisos del bot (crear links de invitación).'
            );
          }
        }
      }

      await sendMenu(ctx);
      return;
    }

    // Usuario no registrado: ofrecer Web App
    if (!webAppUrl) {
      await ctx.reply('⚠️ Falta configurar WEBHOOK_DOMAIN. No puedo abrir el formulario de registro.');
      return;
    }

    const kb = new InlineKeyboard().webApp('📝 Completar registro', webAppUrl);
    await ctx.reply(
      '¡Bienvenido/a a **Red Judicial**! 👋\n\n' +
        'Para acceder a la comunidad privada, completa tu registro en 1 minuto.\n' +
        'Luego te entrego un link **personal** de acceso (1 uso):',
      { parse_mode: 'Markdown', reply_markup: kb }
    );

  } catch (error) {
    console.error('Error en handleStart:', error);
    const msg = typeof (error as any)?.message === 'string' ? (error as any).message : '';
    // Mensaje más útil cuando el esquema de Supabase no está actualizado
    if (/column .* does not exist|schema cache|PGRST/i.test(msg)) {
      await ctx.reply(
        '⚠️ El bot está funcionando, pero la base de datos no está actualizada para el registro.\n\n' +
          'El administrador debe ejecutar la migración SQL de onboarding en Supabase y redeployar.\n' +
          'Luego vuelve a intentar.',
      );
      return;
    }
    await ctx.reply(
      '❌ Hubo un error al procesar tu solicitud. Por favor intenta nuevamente.'
    );
  }
}

