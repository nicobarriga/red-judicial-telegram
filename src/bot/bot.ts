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
  const { handleCallbacks } = await import('../handlers/callbacks');

  // Comandos
  bot.command('start', handleStart);
  bot.command('menu', handleMenu);
  bot.command('grupos', handleGrupos);
  bot.command('soporte', handleSoporte);

  // Callbacks
  bot.on('callback_query:data', handleCallbacks);

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

