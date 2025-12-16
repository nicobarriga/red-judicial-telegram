import { CommandContext, Context } from 'grammy';
import { getOrCreateUser, getUserByTelegramId } from '../database/client';
import { sendMenu, startOrContinueOnboarding } from './onboarding';

/**
 * Handler para el comando /start
 */
export async function handleStart(ctx: CommandContext<Context>): Promise<void> {
  try {
    const user = ctx.from;
    if (!user) {
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

    await ctx.reply('¡Bienvenido a Red Judicial! 👋\n\nAntes de mostrarte los temas, necesito completar tu registro (1 minuto).');

    const dbUser = await getUserByTelegramId(user.id);
    if (dbUser && dbUser.onboarding_completed) {
      await sendMenu(ctx);
      return;
    }

    await startOrContinueOnboarding(ctx);

  } catch (error) {
    console.error('Error en handleStart:', error);
    await ctx.reply(
      '❌ Hubo un error al procesar tu solicitud. Por favor intenta nuevamente.'
    );
  }
}

