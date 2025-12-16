import { CommandContext, Context } from 'grammy';

/**
 * Devuelve el message_thread_id del tema actual (solo funciona dentro de un tema).
 * Útil para configurar WELCOME_TOPIC_ID en Railway.
 */
export async function handleThreadId(ctx: CommandContext<Context>): Promise<void> {
  const chat = ctx.chat;
  if (!chat || chat.type === 'private') {
    await ctx.reply('Este comando solo funciona dentro de un grupo con temas.');
    return;
  }

  const msg: any = (ctx as any).message;
  const threadId: number | undefined = msg?.message_thread_id;

  if (typeof threadId !== 'number') {
    await ctx.reply(
      'No detecté un tema. Entra al tema **Bienvenida** y ejecuta este comando dentro del tema.',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  await ctx.reply(
    `🧵 Topic (message_thread_id):\n\`${threadId}\`\n\nConfigúralo como \`WELCOME_TOPIC_ID\` en Railway.`,
    { parse_mode: 'Markdown' }
  );
}


