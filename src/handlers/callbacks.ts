import { Context, InlineKeyboard } from 'grammy';
import { getTopicBySlug, recordTopicInterest, updateUserProfile } from '../database/client';
import { handleOnboardingLawyerChoice, startOrContinueOnboarding } from './onboarding';

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
    if (callbackData.startsWith('onb:name:')) {
      const action = callbackData.replace('onb:name:', '');
      if (!ctx.from) {
        await ctx.answerCallbackQuery('❌ Usuario no identificado');
        return;
      }
      if (action === 'ok') {
        await updateUserProfile(ctx.from.id, { onboarding_step: 'ask_lawyer' });
        await ctx.answerCallbackQuery('✅ Confirmado');
        await startOrContinueOnboarding(ctx);
      } else if (action === 'edit') {
        await updateUserProfile(ctx.from.id, { onboarding_step: 'ask_full_name' });
        await ctx.answerCallbackQuery('✏️ Ok, corrígelo');
        await startOrContinueOnboarding(ctx);
      } else {
        await ctx.answerCallbackQuery('❌ Acción no reconocida');
      }
    } else if (callbackData.startsWith('onb:lawyer:')) {
      const value = callbackData.replace('onb:lawyer:', '');
      await handleOnboardingLawyerChoice(ctx, value === 'yes');
    } else if (callbackData.startsWith('topic:')) {
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

    // Buscar el tema
    const topic = await getTopicBySlug(slug);
    
    if (!topic) {
      await ctx.answerCallbackQuery('❌ Tema no encontrado');
      return;
    }

    // Registrar el interés en el tema
    try {
      await recordTopicInterest(user.id, slug);
    } catch (error) {
      // No es crítico si falla el registro, continuamos
      console.error('Error registrando interés:', error);
    }

    const message =
      `📚 **${topic.titulo}**\n\n` +
      `${topic.descripcion}\n\n` +
      `**Cómo se usa**\n` +
      `- Dentro del grupo, busca el tema **"${topic.titulo}"** y entra a conversar.\n\n` +
      `🔐 Si aún no estás dentro del grupo privado, usa /start (te genero un link personal de 1 uso).`;

    // Responder al callback query (feedback inmediato)
    await ctx.answerCallbackQuery(`✅ Tema: ${topic.titulo}`);

    await ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error en handleTopicClick:', error);
    await ctx.answerCallbackQuery('❌ Error al obtener información del tema');
  }
}

