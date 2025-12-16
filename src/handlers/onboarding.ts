import { Context, InlineKeyboard, Keyboard } from 'grammy';
import { getActiveTopics, getMainGroup, getOrCreateUser, getUserByTelegramId, updateUserProfile } from '../database/client';

export type OnboardingStep =
  | 'ask_full_name'
  | 'ask_lawyer'
  | 'ask_profession_or_study'
  | 'ask_email'
  | 'ask_phone';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function parseFullName(input: string): { firstName: string; lastName: string } | null {
  const raw = input.trim().replace(/\s+/g, ' ');
  if (!raw) return null;

  if (raw.includes(',')) {
    const [left, right] = raw.split(',', 2).map((s) => s.trim());
    if (!left || !right) return null;
    return { firstName: left, lastName: right };
  }

  const parts = raw.split(' ').filter(Boolean);
  if (parts.length < 2) return null;
  if (parts.length >= 3) {
    return { firstName: parts.slice(0, -2).join(' '), lastName: parts.slice(-2).join(' ') };
  }
  return { firstName: parts[0], lastName: parts[1] };
}

export async function ensureUserAndGetStep(ctx: Context): Promise<OnboardingStep | null> {
  const from = ctx.from;
  if (!from) return null;

  await getOrCreateUser(from.id, from.username, from.first_name, from.last_name, 'direct_bot');
  const user = await getUserByTelegramId(from.id);
  if (!user) return null;
  if (user.onboarding_completed) return null;
  return (user.onboarding_step as OnboardingStep) || 'ask_full_name';
}

export async function startOrContinueOnboarding(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const user = await getUserByTelegramId(from.id);
  if (!user) return;
  if (user.onboarding_completed) return;

  const step: OnboardingStep = (user.onboarding_step as OnboardingStep) || 'ask_full_name';

  if (step === 'ask_full_name') {
    await ctx.reply(
      `¡Bienvenido/a a **Red Judicial**! 👋\n\n` +
        `Esta es una comunidad para **abogados**, **estudiantes de Derecho** y **carreras afines al ámbito jurídico**.\n` +
        `Aquí puedes **hacer consultas**, aprender de otros y participar en conversaciones ordenadas por especialidad (temas).\n\n` +
        `Antes de mostrarte los temas, necesitamos un registro rápido (**1 minuto**).\n` +
        `**¿Para qué?**\n` +
        `- Para **orientarte mejor** y enviarte al tema correcto según tu necesidad.\n` +
        `- Para **cuidar la comunidad** y reducir cuentas falsas/spam.\n` +
        `- Para mejorar la calidad de respuestas entendiendo tu contexto (abogado/a, estudiante, etc.).\n` +
        `\n` +
        `🔒 Tus datos se usan solo para registro, verificación y soporte de la comunidad. No spam.\n\n` +
        `✍️ Escribe tu **Nombre y Apellido(s)**\n` +
        `Formato recomendado: \`Nombre(s), Apellido(s)\`\n` +
        `Ejemplo: \`Juan Pablo, Pérez Soto\``,
      { parse_mode: 'Markdown' }
    );
    await updateUserProfile(from.id, { onboarding_step: 'ask_full_name' });
    return;
  }

  if (step === 'ask_lawyer') {
    const kb = new InlineKeyboard()
      .text('✅ Sí, soy abogado/a', 'onb:lawyer:yes')
      .row()
      .text('❌ No', 'onb:lawyer:no');
    await ctx.reply('👩‍⚖️ ¿Eres abogado/a?', { reply_markup: kb });
    await updateUserProfile(from.id, { onboarding_step: 'ask_lawyer' });
    return;
  }

  if (step === 'ask_profession_or_study') {
    await ctx.reply('📚 ¿Cuál es tu **profesión** o qué estás **estudiando**?', { parse_mode: 'Markdown' });
    await updateUserProfile(from.id, { onboarding_step: 'ask_profession_or_study' });
    return;
  }

  if (step === 'ask_email') {
    await ctx.reply(
      `Gracias 🙌\n\n` +
        `Ahora te pediremos **correo** y luego **teléfono** (**obligatorio**) para:\n` +
        `- **Verificación y seguridad** de la comunidad\n` +
        `- Poder contactarte si hay un **tema importante** (cambios de acceso, soporte o incidentes)\n\n` +
        `**No se usan para marketing** ni se comparten con terceros.\n\n` +
        `📧 ¿Cuál es tu **correo electrónico**?`,
      { parse_mode: 'Markdown' }
    );
    await updateUserProfile(from.id, { onboarding_step: 'ask_email' });
    return;
  }

  if (step === 'ask_phone') {
    if (ctx.chat?.type !== 'private') {
      await ctx.reply('Para registrar tu teléfono, por favor escríbeme por **chat privado**.');
      return;
    }
    const kb = new Keyboard().requestContact('📱 Compartir mi número').resized().oneTime();
    await ctx.reply(
      '📱 Para asociarte por número (obligatorio), comparte tu **teléfono** con el botón:',
      { reply_markup: kb }
    );
    await updateUserProfile(from.id, { onboarding_step: 'ask_phone' });
    return;
  }
}

export async function handleOnboardingText(ctx: Context): Promise<boolean> {
  const from = ctx.from;
  if (!from) return false;
  const msg = ctx.message as any;
  if (!msg || typeof msg.text !== 'string') return false;

  const user = await getUserByTelegramId(from.id);
  if (!user || user.onboarding_completed) return false;

  const text = msg.text.trim();
  const step: OnboardingStep = (user.onboarding_step as OnboardingStep) || 'ask_full_name';

  if (step === 'ask_full_name') {
    const parsed = parseFullName(text);
    if (!parsed || parsed.firstName.length < 2 || parsed.lastName.length < 2) {
      await ctx.reply(
        'No pude interpretar tu nombre.\n\nEscríbelo así, por favor:\n`Nombre(s), Apellido(s)`\nEjemplo: `Juan Pablo, Pérez Soto`',
        { parse_mode: 'Markdown' }
      );
      return true;
    }
    await updateUserProfile(from.id, { first_name: parsed.firstName, last_name: parsed.lastName, onboarding_step: 'ask_lawyer' });
    await startOrContinueOnboarding(ctx);
    return true;
  }

  if (step === 'ask_profession_or_study') {
    if (text.length < 2) {
      await ctx.reply('Cuéntame un poco más (ej: “ingeniero”, “estudiante de derecho”, etc.).');
      return true;
    }
    await updateUserProfile(from.id, { profession_or_study: text, onboarding_step: 'ask_email' });
    await startOrContinueOnboarding(ctx);
    return true;
  }

  if (step === 'ask_email') {
    if (!isValidEmail(text)) {
      await ctx.reply('Ese correo no parece válido. Ejemplo: `nombre@dominio.cl`', { parse_mode: 'Markdown' });
      return true;
    }
    await updateUserProfile(from.id, { email: text.toLowerCase(), onboarding_step: 'ask_phone' });
    await startOrContinueOnboarding(ctx);
    return true;
  }

  return false;
}

export async function handleOnboardingContact(ctx: Context): Promise<boolean> {
  const from = ctx.from;
  if (!from) return false;
  const msg = ctx.message as any;
  if (!msg || !msg.contact) return false;

  const user = await getUserByTelegramId(from.id);
  if (!user || user.onboarding_completed) return false;

  const step: OnboardingStep = (user.onboarding_step as OnboardingStep) || 'ask_full_name';
  if (step !== 'ask_phone') return false;

  const contact = msg.contact;
  if (contact.user_id && contact.user_id !== from.id) {
    await ctx.reply('Por favor comparte **tu propio** número usando el botón.');
    return true;
  }

  await updateUserProfile(from.id, { phone_number: contact.phone_number, onboarding_step: null, onboarding_completed: true });
  await ctx.reply('✅ ¡Registro completado! Gracias.', { reply_markup: { remove_keyboard: true } });
  await sendMenu(ctx);
  return true;
}

export async function handleOnboardingLawyerChoice(ctx: Context, isLawyer: boolean): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  if (isLawyer) {
    await updateUserProfile(from.id, { is_lawyer: true, onboarding_step: 'ask_email' });
  } else {
    await updateUserProfile(from.id, { is_lawyer: false, onboarding_step: 'ask_profession_or_study' });
  }

  await ctx.answerCallbackQuery('✅ Listo');
  await startOrContinueOnboarding(ctx);
}

export async function sendMenu(ctx: Context): Promise<void> {
  const mainGroup = await getMainGroup();
  const topics = await getActiveTopics();
  if (!mainGroup) {
    await ctx.reply('❌ El grupo principal no está configurado.');
    return;
  }

  const keyboard = new InlineKeyboard();
  for (let i = 0; i < topics.length; i += 2) {
    if (i + 1 < topics.length) {
      keyboard.text(topics[i].titulo, `topic:${topics[i].slug}`).text(topics[i + 1].titulo, `topic:${topics[i + 1].slug}`);
      keyboard.row();
    } else {
      keyboard.text(topics[i].titulo, `topic:${topics[i].slug}`);
      keyboard.row();
    }
  }
  keyboard.url('🚀 Unirme a Red Judicial', mainGroup.invite_link);

  await ctx.reply('📋 **Temas disponibles**\n\nSelecciona un tema para ver detalles o únete al grupo principal:', {
    reply_markup: keyboard,
    parse_mode: 'Markdown',
  });
}


