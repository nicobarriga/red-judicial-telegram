import { CommandContext, Context } from 'grammy';

/**
 * Comando utilitario para obtener el chat_id del chat actual.
 * Útil para configurar MAIN_GROUP_CHAT_ID (formato típico: -100xxxxxxxxxx).
 */
export async function handleChatId(ctx: CommandContext<Context>): Promise<void> {
  const chat = ctx.chat;
  if (!chat) return;

  if (chat.type === 'private') {
    await ctx.reply('Este comando solo funciona dentro de un grupo/supergrupo.');
    return;
  }

  await ctx.reply(
    `🆔 Chat ID:\n\`${chat.id}\`\n\nCopia ese valor y configúralo como \`MAIN_GROUP_CHAT_ID\` en Railway.`,
    { parse_mode: 'Markdown' }
  );
}


