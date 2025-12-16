import { Bot } from 'grammy';
import { config } from '../config';

// Crear instancia del bot
export const bot = new Bot(config.botToken);

/**
 * Configura el manejo de errores del bot
 */
export function setupErrorHandling(): void {
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error procesando update ${ctx.update.update_id}:`);
    const e = err.error;
    
    if (e instanceof Error) {
      console.error('Error:', e.message);
      console.error('Stack:', e.stack);
    } else {
      console.error('Error desconocido:', e);
    }
  });
}

/**
 * Registra los handlers del bot
 */
export async function registerHandlers(): Promise<void> {
  // Los handlers se importan y registran aquí para evitar dependencias circulares
  const { handleStart } = await import('../handlers/start');
  const { handleMenu } = await import('../handlers/menu');
  const { handleGrupos } = await import('../handlers/grupos');
  const { handleSoporte } = await import('../handlers/soporte');
  const { handleChatId } = await import('../handlers/chatid');
  const { handleThreadId } = await import('../handlers/threadid');
  const { handleCallbacks } = await import('../handlers/callbacks');
  const { ensureUserAndGetStep, handleOnboardingContact, handleOnboardingText, startOrContinueOnboarding } =
    await import('../handlers/onboarding');
  const { handleGroupWelcome } = await import('../handlers/welcome-group');
  const { handleDeleteServiceMessages } = await import('../handlers/delete-service-messages');

  // Comandos
  bot.command('start', handleStart);
  bot.command('menu', handleMenu);
  bot.command('grupos', handleGrupos);
  bot.command('soporte', handleSoporte);
  bot.command('chatid', handleChatId);
  bot.command('threadid', handleThreadId);

  // Captura de onboarding también si el usuario escribe sin /start (en privado)
  bot.on('message:contact', async (ctx, next) => {
    if (ctx.chat?.type !== 'private') return await next();
    await ensureUserAndGetStep(ctx);
    const handled = await handleOnboardingContact(ctx);
    if (!handled) await next();
  });

  bot.on('message:text', async (ctx, next) => {
    if (ctx.chat?.type !== 'private') return await next();
    if (ctx.message?.text?.startsWith('/')) return await next();
    const step = await ensureUserAndGetStep(ctx);
    if (!step) return await next();

    const handled = await handleOnboardingText(ctx);
    if (!handled) {
      await startOrContinueOnboarding(ctx);
    }
  });

  // Borrar mensajes de servicio join/leave (si está habilitado por env)
  bot.on('message', async (ctx, next) => {
    await handleDeleteServiceMessages(ctx);
    return await next();
  });

  // Callbacks
  bot.on('callback_query:data', handleCallbacks);

  // Bienvenida automática al entrar al grupo (chat_member)
  bot.on('chat_member', handleGroupWelcome);

  console.log('✅ Handlers registrados correctamente');
}

/**
 * Inicializa el bot
 */
export async function initBot(): Promise<void> {
  setupErrorHandling();
  await registerHandlers();
  console.log('🤖 Bot inicializado correctamente');
}

