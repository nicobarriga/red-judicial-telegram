import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN;

/**
 * Configura el webhook del bot de Telegram
 */
async function setWebhook(): Promise<void> {
  if (!BOT_TOKEN) {
    console.error('❌ Error: BOT_TOKEN no configurado en .env');
    process.exit(1);
  }

  if (!WEBHOOK_DOMAIN) {
    console.error('❌ Error: WEBHOOK_DOMAIN no configurado en .env');
    process.exit(1);
  }

  const webhookUrl = `${WEBHOOK_DOMAIN}/telegram/webhook`;
  const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;

  console.log('🔧 Configurando webhook...');
  console.log(`📡 URL del webhook: ${webhookUrl}`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Webhook configurado exitosamente');
      console.log('📋 Respuesta:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Error al configurar webhook');
      console.error('📋 Respuesta:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error al hacer la petición:', error);
    process.exit(1);
  }
}

/**
 * Obtiene información del webhook actual
 */
async function getWebhookInfo(): Promise<void> {
  if (!BOT_TOKEN) {
    console.error('❌ Error: BOT_TOKEN no configurado');
    return;
  }

  const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log('\n📊 Información actual del webhook:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error al obtener información:', error);
  }
}

// Ejecutar
async function main(): Promise<void> {
  console.log('🤖 Red Judicial - Configuración de Webhook\n');
  
  await setWebhook();
  await getWebhookInfo();
  
  console.log('\n✨ Proceso completado');
}

main();

