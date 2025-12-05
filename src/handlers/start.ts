import { CommandContext, Context, InlineKeyboard } from 'grammy';
import { getOrCreateUser, getMainGroup, getActiveTopics } from '../database/client';
import { config } from '../config';

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

    // Obtener grupo principal y temas
    const mainGroup = await getMainGroup();
    const topics = await getActiveTopics();

    if (!mainGroup) {
      await ctx.reply('❌ El grupo principal no está configurado. Contacta al administrador.');
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

    // Botón para unirse al grupo principal
    keyboard.url('🚀 Unirme a Red Judicial', mainGroup.invite_link);

    // Mensaje de bienvenida
    const welcomeMessage = `
¡Bienvenido a Red Judicial! 👋

Somos una comunidad de abogados que comparten conocimiento, resuelven dudas y se apoyan mutuamente en diferentes áreas del derecho.

🔹 **¿Cómo funciona?**
• Tenemos un grupo principal con 15 temas organizados por especialidad
• Cada tema es un espacio de discusión profesional dentro del grupo
• Una vez dentro, podrás navegar por los temas que te interesen

🔹 **Especialidades disponibles:**
Elige un tema para conocer más detalles, o únete directamente al grupo principal.

👇 Selecciona un tema para más información o únete al grupo:
`;

    await ctx.reply(welcomeMessage, {
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    });

  } catch (error) {
    console.error('Error en handleStart:', error);
    await ctx.reply(
      '❌ Hubo un error al procesar tu solicitud. Por favor intenta nuevamente.'
    );
  }
}

