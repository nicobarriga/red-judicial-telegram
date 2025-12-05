import { CommandContext, Context } from 'grammy';
import { getMainGroup, getActiveTopics } from '../database/client';

/**
 * Handler para el comando /grupos
 */
export async function handleGrupos(ctx: CommandContext<Context>): Promise<void> {
  try {
    // Obtener grupo principal y temas
    const mainGroup = await getMainGroup();
    const topics = await getActiveTopics();

    if (!mainGroup) {
      await ctx.reply('❌ El grupo principal no está configurado.');
      return;
    }

    // Crear mensaje con lista de temas
    let message = '📚 **Red Judicial - Temas Disponibles**\n\n';
    message += `🔗 **Grupo Principal:** ${mainGroup.invite_link}\n\n`;
    message += 'Una vez dentro del grupo, encontrarás estos temas organizados:\n\n';

    for (const topic of topics) {
      message += `🔹 **${topic.titulo}**\n`;
      message += `   ${topic.descripcion}\n\n`;
    }

    message += '\n💡 **¿Cómo usar los temas?**\n';
    message += '1. Únete al grupo principal usando el link de arriba\n';
    message += '2. Dentro del grupo, verás una lista de temas\n';
    message += '3. Toca el tema que te interese para abrirlo\n';
    message += '4. Cada tema es un subchat organizado dentro del grupo\n\n';
    message += '✨ Los temas mantienen las conversaciones ordenadas por especialidad.';

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true },
    });

  } catch (error) {
    console.error('Error en handleGrupos:', error);
    await ctx.reply(
      '❌ Hubo un error al obtener la información. Por favor intenta nuevamente.'
    );
  }
}

