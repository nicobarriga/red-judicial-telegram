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
  const { handleRegistro } = await import('../handlers/registro');
  const { handleCallbacks } = await import('../handlers/callbacks');
  const { handleWebAppData } = await import('../handlers/webapp');
  const { sendMenu } = await import('../handlers/onboarding');
  const { handleGroupWelcome } = await import('../handlers/welcome-group');
  const { handleDeleteServiceMessages } = await import('../handlers/delete-service-messages');

  // Comandos
  bot.command('start', handleStart);
  bot.command('menu', handleMenu);
  bot.command('grupos', handleGrupos);
  bot.command('soporte', handleSoporte);
  bot.command('chatid', handleChatId);
  bot.command('threadid', handleThreadId);
  bot.command('registro', handleRegistro);

  // Nota: el onboarding conversacional queda como legacy. El registro principal es vía Web App.

  // Manejo global de mensajes:
  // - Procesar WebApp data (registro) incluso si el filtro específico no se dispara en algún cliente.
  // - Borrar mensajes de servicio join/leave (si está habilitado por env).
  bot.on('message', async (ctx, next) => {
    const msg: any = ctx.message;
    if (msg?.web_app_data) {
      await handleWebAppData(ctx);
      // No retornamos: si alguien quiere además borrar service messages u otros, seguimos.
    }
    // Bienvenida también vía service message (new_chat_members), más confiable que chat_member
    if (Array.isArray(msg?.new_chat_members) && msg.new_chat_members.length > 0) {
      await handleGroupWelcome(ctx);
    }
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

