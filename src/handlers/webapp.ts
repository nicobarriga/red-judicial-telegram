import { Context } from 'grammy';
import { config } from '../config';
import { getOrCreateUser, updateUserProfile } from '../database/client';
import { verifyTelegramWebAppInitData } from '../utils/telegramWebApp';
import { sendMenu } from './onboarding';
import { getMainGroup } from '../database/client';

type WebAppPayload = {
  firstName: string;
  lastName: string;
  role: 'lawyer' | 'student' | 'related';
  email: string;
  phoneNumber: string;
  professionOrStudy?: string | null;
};

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
}

function sanitizePhone(s: string): string {
  return String(s || '').trim().replace(/\s+/g, ' ');
}

export async function handleWebAppData(ctx: Context): Promise<void> {
  try {
    if (ctx.chat?.type !== 'private') {
      // Si por alguna razón llega desde un grupo (p.ej. WebApp abierta desde un botón en grupo),
      // informamos para que el usuario entienda por qué no ve confirmación.
      await ctx.reply('Para completar el registro, por favor abre el bot por **privado** y usa /registro.');
      return;
    }
    const from = ctx.from;
    if (!from) return;

    const msg: any = ctx.message;
    const raw = msg?.web_app_data?.data;
    if (typeof raw !== 'string' || raw.length < 2) return;

    // Ack temprano para confirmar recepción del payload (útil para debugging UX)
    await ctx.reply('📩 Recibí tu formulario. Procesando…');

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      await ctx.reply('❌ No pude leer el formulario. Intenta nuevamente.');
      return;
    }

    const initData = String(parsed?.initData || '');
    const payload: WebAppPayload | undefined = parsed?.payload;

    const verified = verifyTelegramWebAppInitData({
      initData,
      botToken: config.botToken,
      maxAgeSeconds: 24 * 60 * 60,
    });

    if (!verified.ok) {
      await ctx.reply('❌ Registro inválido. Por favor abre el formulario desde Telegram e intenta nuevamente.');
      return;
    }

    // Cruce adicional: user.id del initData debe coincidir con el chat privado
    const initUserId = verified.data.user?.id;
    if (typeof initUserId === 'number' && initUserId !== from.id) {
      await ctx.reply('❌ Registro inválido (usuario no coincide). Intenta nuevamente.');
      return;
    }

    if (!payload) {
      await ctx.reply('❌ Faltan datos del formulario. Intenta nuevamente.');
      return;
    }

    const firstName = String(payload.firstName || '').trim();
    const lastName = String(payload.lastName || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const phoneNumber = sanitizePhone(payload.phoneNumber || '');
    const role = payload.role;
    const professionOrStudy = payload.professionOrStudy ? String(payload.professionOrStudy).trim() : null;

    if (firstName.length < 2 || lastName.length < 2) {
      await ctx.reply('❌ Nombre y apellido son obligatorios.');
      return;
    }
    if (!isEmail(email)) {
      await ctx.reply('❌ Correo inválido.');
      return;
    }
    if (phoneNumber.length < 6) {
      await ctx.reply('❌ Teléfono inválido.');
      return;
    }
    if (!['lawyer', 'student', 'related'].includes(String(role))) {
      await ctx.reply('❌ Perfil inválido.');
      return;
    }
    if (role === 'related' && (!professionOrStudy || professionOrStudy.length < 2)) {
      await ctx.reply('❌ Indica tu carrera/profesión.');
      return;
    }

    // Asegurar usuario y guardar perfil
    await getOrCreateUser(from.id, from.username, from.first_name, from.last_name, 'direct_bot');

    await updateUserProfile(from.id, {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      is_lawyer: role === 'lawyer' ? true : role === 'student' ? false : false,
      profession_or_study: role === 'related' ? professionOrStudy : role === 'student' ? 'Estudiante de Derecho' : null,
      onboarding_completed: true,
      onboarding_step: null,
    });

    // Si el grupo está en modo "solicitudes", intentar aprobar automáticamente (si ya solicitó)
    if (typeof config.mainGroupChatId === 'number') {
      try {
        await ctx.api.approveChatJoinRequest(config.mainGroupChatId, from.id);
      } catch {
        // Puede fallar si no hay solicitud pendiente; no es crítico.
      }
    }

    // Instrucción clara de ingreso instantáneo
    const mainGroup = await getMainGroup().catch(() => null);
    if (mainGroup?.invite_link) {
      await ctx.reply(
        '🚀 Listo. Ahora solicita unirte al grupo y te aprobamos automáticamente (en segundos):\n' +
          `${mainGroup.invite_link}`,
        { link_preview_options: { is_disabled: true } }
      );
    }

    await ctx.reply('✅ ¡Registro completado! Gracias.');
    await sendMenu(ctx);
  } catch (e) {
    console.error('Error en handleWebAppData:', e);
    await ctx.reply('❌ Hubo un error guardando tu registro. Intenta nuevamente.');
  }
}


