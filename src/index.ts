import express from 'express';
import { webhookCallback } from 'grammy';
import { config, validateConfig } from './config';
import { bot, initBot } from './bot/bot';
import { initSupabase, keepSupabaseAwake } from './database/client';
import { getRegistroWebAppHtml } from './webapp/registroPage';
import { verifyTelegramWebAppInitData } from './utils/telegramWebApp';
import { updateUserProfile } from './database/client';
import { createOneTimeInviteLink } from './utils/inviteLinks';

const app = express();

/**
 * Inicializa la aplicación
 */
async function init(): Promise<void> {
  try {
    // Validar configuración
    console.log('🔧 Validando configuración...');
    validateConfig();

    // Inicializar Supabase
    console.log('🗄️  Conectando a Supabase...');
    initSupabase();

    // Inicializar bot
    console.log('🤖 Inicializando bot...');
    await initBot();

    console.log('✅ Inicialización completada');
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    process.exit(1);
  }
}

function scheduleSupabaseKeepAlive(): void {
  const enabled = config.supabaseKeepAliveEnabled !== false;
  if (!enabled) {
    console.log('🫀 Supabase keep-alive deshabilitado (SUPABASE_KEEPALIVE_ENABLED=false)');
    return;
  }

  const hoursRaw = config.supabaseKeepAliveIntervalHours ?? 24;
  const hours = Number.isFinite(hoursRaw) ? Math.max(1, hoursRaw) : 24;
  const intervalMs = hours * 60 * 60 * 1000;

  const run = async () => {
    const res = await keepSupabaseAwake();
    if (!res.ok) {
      console.warn(`🫀 Supabase keep-alive falló: ${res.error || 'unknown_error'}`);
    }
  };

  // Primer ping con un pequeño delay para no competir con el arranque.
  setTimeout(() => {
    run().catch((e) => console.warn('🫀 Supabase keep-alive error:', e));
  }, 15_000);

  const t = setInterval(() => {
    run().catch((e) => console.warn('🫀 Supabase keep-alive error:', e));
  }, intervalMs);

  // No bloquear shutdown.
  (t as any).unref?.();

  console.log(`🫀 Supabase keep-alive habilitado: cada ${hours}h`);
}

/**
 * Configura las rutas
 */
function setupRoutes(): void {
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Web App (registro)
  app.get('/webapp/registro', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getRegistroWebAppHtml({ botUsername: config.botUsername }));
  });

  // Web App submit (fallback robusto para clientes que no entregan web_app_data al bot)
  app.post('/webapp/registro/submit', express.json(), async (req, res) => {
    try {
      const initData = String(req.body?.initData || '');
      const payload = req.body?.payload || null;

      const verified = verifyTelegramWebAppInitData({
        initData,
        botToken: config.botToken,
        maxAgeSeconds: 24 * 60 * 60,
      });

      if (!verified.ok) {
        res.status(401).json({ ok: false, error: 'invalid_init_data' });
        return;
      }

      const userId = verified.data.user?.id;
      if (typeof userId !== 'number') {
        res.status(400).json({ ok: false, error: 'missing_user' });
        return;
      }

      const firstName = String(payload?.firstName || '').trim();
      const lastName = String(payload?.lastName || '').trim();
      const email = String(payload?.email || '').trim().toLowerCase();
      const phoneNumber = String(payload?.phoneNumber || '').trim().replace(/\s+/g, ' ');
      const role = String(payload?.role || '');
      const professionOrStudy = payload?.professionOrStudy ? String(payload.professionOrStudy).trim() : null;

      if (firstName.length < 2 || lastName.length < 2) {
        res.status(400).json({ ok: false, error: 'invalid_name' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ ok: false, error: 'invalid_email' });
        return;
      }
      if (phoneNumber.length < 6) {
        res.status(400).json({ ok: false, error: 'invalid_phone' });
        return;
      }
      if (!['lawyer', 'student', 'related'].includes(role)) {
        res.status(400).json({ ok: false, error: 'invalid_role' });
        return;
      }
      if (role === 'related' && (!professionOrStudy || professionOrStudy.length < 2)) {
        res.status(400).json({ ok: false, error: 'missing_profession' });
        return;
      }

      await updateUserProfile(userId, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        is_lawyer: role === 'lawyer',
        profession_or_study: role === 'related' ? professionOrStudy : role === 'student' ? 'Estudiante de Derecho' : null,
        onboarding_completed: true,
        onboarding_step: null,
      });

      // Entregar link personal (1 uso) al grupo privado (si el usuario ya inició el bot, esto llega)
      if (typeof config.mainGroupChatId === 'number') {
        try {
          const invite = await createOneTimeInviteLink({
            api: bot.api,
            chatId: config.mainGroupChatId,
            telegramUserId: userId,
          });
          const text =
            '✅ Listo.\n\n' +
            'Link personal (1 uso):\n' +
            `${invite}\n\n` +
            'Importante: no lo compartas. Si tienes varias cuentas en Telegram, ábrelo desde la **misma cuenta** con la que te registraste.\n' +
            'Si te aparece “caducado” o ya lo usaste, vuelve a abrir el bot y usa /registro para generar uno nuevo.';
          bot.api
            .sendMessage(userId, text, {
              parse_mode: 'Markdown',
              link_preview_options: { is_disabled: true },
            })
            .catch(() => undefined);
        } catch (e) {
          console.error('Error creando invite link (submit):', e);
          bot.api
            .sendMessage(
              userId,
              '✅ Registro listo.\n\nNo pude generar tu link de acceso en este momento. ' +
                'Por favor avisa a un administrador para revisar permisos del bot (crear links de invitación).'
            )
            .catch(() => undefined);
        }
      } else {
        bot.api
          .sendMessage(userId, '✅ Registro listo. (Falta configurar MAIN_GROUP_CHAT_ID para generar el link de acceso).')
          .catch(() => undefined);
      }

      res.json({ ok: true });
    } catch (e) {
      console.error('Error en /webapp/registro/submit:', e);
      res.status(500).json({ ok: false, error: 'server_error' });
    }
  });

  // Webhook de Telegram
  app.use(express.json());
  app.post('/telegram/webhook', webhookCallback(bot, 'express'));

  console.log('🛣️  Rutas configuradas');
}

/**
 * Inicia el servidor
 */
async function start(): Promise<void> {
  await init();
  setupRoutes();
  scheduleSupabaseKeepAlive();

  app.listen(config.port, () => {
    console.log(`🚀 Servidor escuchando en puerto ${config.port}`);
    console.log(`📡 Webhook endpoint: /telegram/webhook`);
    console.log(`💚 Health check: /health`);
    
    if (config.webhookDomain) {
      console.log(`🌐 Webhook URL: ${config.webhookDomain}/telegram/webhook`);
      console.log('⚠️  Recuerda configurar el webhook con el script set-webhook');
    } else {
      console.log('⚠️  WEBHOOK_DOMAIN no configurado - modo desarrollo');
      console.log('💡 Usa ngrok para testing local');
    }
  });
}

// Manejo de señales para shutdown graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Deteniendo servidor...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Deteniendo servidor...');
  await bot.stop();
  process.exit(0);
});

// Iniciar la aplicación
start().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

