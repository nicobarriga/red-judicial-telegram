import express from 'express';
import { webhookCallback } from 'grammy';
import { config, validateConfig } from './config';
import { bot, initBot } from './bot/bot';
import { initSupabase } from './database/client';
import { getRegistroWebAppHtml } from './webapp/registroPage';

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

