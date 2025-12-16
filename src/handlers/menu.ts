import { CommandContext, Context, InlineKeyboard } from 'grammy';
import { getMainGroup, getActiveTopics } from '../database/client';

/**
 * Handler para el comando /menu
 */
export async function handleMenu(ctx: CommandContext<Context>): Promise<void> {
  try {
    // Obtener grupo principal y temas
    const mainGroup = await getMainGroup();
    const topics = await getActiveTopics();

    if (!mainGroup) {
      await ctx.reply('❌ El grupo principal no está configurado.');
      return;
    }

    // Crear teclado inline con los temas
    const keyboard = new InlineKeyboard();
    
    // Organizar botones en filas de 2 columnas
    for (let i = 0; i < topics.length; i += 2) {
      if (i + 1 < topics.length) {
        keyboard
          .text(topics[i].titulo, `topic:${topics[i].slug}`)
          .text(topics[i + 1].titulo, `topic:${topics[i + 1].slug}`);
        keyboard.row();
      } else {
        keyboard.text(topics[i].titulo, `topic:${topics[i].slug}`);
        keyboard.row();
      }
    }

    // Nota: el grupo es privado y el acceso es por link personal (1 uso).
    // Evitamos publicar invite_link del grupo (puede filtrarse o quedar inválido).

    const menuMessage =
      '📋 **Menú de Especialidades**\n\n' +
      'Selecciona un tema.\n\n' +
      '🔐 Para entrar al grupo privado, usa /start (te genero un link personal de 1 uso).';

    await ctx.reply(menuMessage, {
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    });

  } catch (error) {
    console.error('Error en handleMenu:', error);
    await ctx.reply(
      '❌ Hubo un error al mostrar el menú. Por favor intenta nuevamente.'
    );
  }
}

