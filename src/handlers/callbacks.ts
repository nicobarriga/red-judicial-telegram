import { Context, InlineKeyboard } from 'grammy';
import { getMainGroup, getTopicBySlug, recordTopicInterest } from '../database/client';

/**
 * Handler para los callback queries (botones inline)
 */
export async function handleCallbacks(ctx: Context): Promise<void> {
  try {
    if (!ctx.callbackQuery || !ctx.callbackQuery.data) {
      await ctx.answerCallbackQuery('❌ Datos inválidos');
      return;
    }
    
    const callbackData = ctx.callbackQuery.data;

    // Parsear el callback data
    if (callbackData.startsWith('topic:')) {
      const slug = callbackData.replace('topic:', '');
      await handleTopicClick(ctx, slug);
    } else {
      await ctx.answerCallbackQuery('❌ Acción no reconocida');
    }

  } catch (error) {
    console.error('Error en handleCallbacks:', error);
    await ctx.answerCallbackQuery('❌ Error al procesar la solicitud');
  }
}

/**
 * Maneja el click en un tema
 */
async function handleTopicClick(
  ctx: Context,
  slug: string
): Promise<void> {
  try {
    const user = ctx.from;
    if (!user) {
      await ctx.answerCallbackQuery('❌ Usuario no identificado');
      return;
    }

    // Buscar el tema y el grupo principal
    const topic = await getTopicBySlug(slug);
    const mainGroup = await getMainGroup();
    
    if (!topic) {
      await ctx.answerCallbackQuery('❌ Tema no encontrado');
      return;
    }

    if (!mainGroup) {
      await ctx.answerCallbackQuery('❌ Grupo principal no configurado');
      return;
    }

    // Registrar el interés en el tema
    try {
      await recordTopicInterest(user.id, slug);
    } catch (error) {
      // No es crítico si falla el registro, continuamos
      console.error('Error registrando interés:', error);
    }

    // Crear botón con el link del grupo principal
    const keyboard = new InlineKeyboard()
      .url('🚀 Unirme a Red Judicial', mainGroup.invite_link);

    // Mensaje de respuesta
    const message = `
📚 **${topic.titulo}**

${topic.descripcion}

**¿Cómo acceder a este tema?**

1️⃣ Haz clic en el botón de abajo para unirte al grupo principal
2️⃣ Una vez dentro, busca el tema **"${topic.titulo}"** en la lista de temas del grupo
3️⃣ Toca el tema para abrirlo y comenzar a participar

💡 **Tip:** Los temas aparecen como subchats organizados dentro del grupo principal, manteniendo las conversaciones ordenadas por especialidad.

👇 Únete al grupo principal ahora:
`;

    // Responder al callback query (feedback inmediato)
    await ctx.answerCallbackQuery(`✅ Tema: ${topic.titulo}`);

    // Enviar mensaje con el botón
    await ctx.reply(message, {
      reply_markup: keyboard,
      parse_mode: 'Markdown',
    });

  } catch (error) {
    console.error('Error en handleTopicClick:', error);
    await ctx.answerCallbackQuery('❌ Error al obtener información del tema');
  }
}

