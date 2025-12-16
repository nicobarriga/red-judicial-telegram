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

    const dbUser = await getUserByTelegramId(user.id);
    if (dbUser && dbUser.onboarding_completed) {
      await sendMenu(ctx);
      return;
    }

    await startOrContinueOnboarding(ctx);

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

