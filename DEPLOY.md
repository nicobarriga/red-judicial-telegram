# Guía de Deploy - Red Judicial Telegram Bot

Esta guía explica cómo hacer deploy del bot en diferentes plataformas.

## 📋 Pre-requisitos

Antes de hacer deploy, asegúrate de tener:

1. ✅ Bot de Telegram creado y `BOT_TOKEN`
2. ✅ Grupos de Telegram creados con sus invite links
3. ✅ Carpeta compartida creada con su link
4. ✅ Proyecto de Supabase configurado
5. ✅ Tablas creadas en Supabase (`schema.sql` ejecutado)
6. ✅ Datos iniciales insertados (`seed.sql` ejecutado con tus links reales)

## 🚀 Opción 1: Railway

Railway es la opción más simple para deploy.

### Paso 1: Conectar repositorio

1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Autoriza Railway para acceder a tus repositorios
6. Selecciona el repositorio `redjudicial-telegram`

### Paso 2: Configurar variables de entorno

Railway detectará automáticamente que es un proyecto Node.js.

1. Ve a la pestaña "Variables"
2. Agrega las siguientes variables:

```
BOT_TOKEN=tu_token_del_bot_aqui
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_anon_key_de_supabase
FOLDER_INVITE_URL=https://t.me/addlist/XXXXX
PORT=3000
```

3. Railway generará automáticamente un dominio público

### Paso 3: Configurar el webhook

1. Copia el dominio público que Railway asignó (ej: `https://tu-proyecto.up.railway.app`)
2. Agrega una nueva variable de entorno:

```
WEBHOOK_DOMAIN=https://tu-proyecto.up.railway.app
```

3. Desde tu máquina local, con las mismas variables configuradas, ejecuta:

```bash
npm run set-webhook
```

### Paso 4: Verificar

1. Railway hará deploy automáticamente
2. Revisa los logs para verificar que no hay errores
3. Prueba el bot enviando `/start` en Telegram

## 🚀 Opción 2: Render

### Paso 1: Crear Web Service

1. Ve a [render.com](https://render.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New +" → "Web Service"
4. Conecta tu repositorio de GitHub
5. Selecciona el repositorio `redjudicial-telegram`

### Paso 2: Configurar el servicio

En la página de configuración:

**Basic Info:**
- Name: `red-judicial-telegram-bot`
- Region: Elige la más cercana
- Branch: `main`

**Build & Deploy:**
- Runtime: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Plan:**
- Elige el plan que prefieras (Free tier disponible)

### Paso 3: Variables de entorno

En la sección "Environment Variables", agrega:

```
BOT_TOKEN=tu_token_del_bot_aqui
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_anon_key_de_supabase
FOLDER_INVITE_URL=https://t.me/addlist/XXXXX
PORT=3000
NODE_VERSION=20.10.0
```

### Paso 4: Deploy

1. Haz clic en "Create Web Service"
2. Render empezará a hacer el deploy
3. Una vez completado, copia la URL del servicio (ej: `https://tu-servicio.onrender.com`)

### Paso 5: Configurar el webhook

1. Agrega una nueva variable de entorno en Render:

```
WEBHOOK_DOMAIN=https://tu-servicio.onrender.com
```

2. Desde tu máquina local, ejecuta:

```bash
npm run set-webhook
```

## 🚀 Opción 3: Fly.io

### Paso 1: Instalar flyctl

```bash
# macOS
brew install flyctl

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Linux
curl -L https://fly.io/install.sh | sh
```

### Paso 2: Autenticarse

```bash
flyctl auth login
```

### Paso 3: Crear la aplicación

```bash
flyctl launch
```

Fly.io detectará tu aplicación y te preguntará:
- ¿Desplegar ahora? → No (primero configuraremos variables)

### Paso 4: Configurar variables

```bash
flyctl secrets set BOT_TOKEN=tu_token_del_bot
flyctl secrets set SUPABASE_URL=tu_url_de_supabase
flyctl secrets set SUPABASE_KEY=tu_anon_key
flyctl secrets set FOLDER_INVITE_URL=https://t.me/addlist/XXXXX
flyctl secrets set WEBHOOK_DOMAIN=https://tu-app.fly.dev
```

### Paso 5: Deploy

```bash
flyctl deploy
```

### Paso 6: Configurar webhook

```bash
npm run set-webhook
```

## 🔧 Configuración Post-Deploy

### Verificar el webhook

Puedes verificar que el webhook esté configurado correctamente:

```bash
curl https://api.telegram.org/bot<TU_BOT_TOKEN>/getWebhookInfo
```

Deberías ver tu dominio en la respuesta.

### Probar el bot

1. Abre Telegram
2. Busca tu bot (ej: `@RedJudicialBot`)
3. Envía `/start`
4. Deberías recibir el mensaje de bienvenida con el menú

## 🐛 Debugging

### Ver logs

**Railway:**
```
# En el dashboard de Railway, pestaña "Deployments" → Logs
```

**Render:**
```
# En el dashboard de Render, pestaña "Logs"
```

**Fly.io:**
```bash
flyctl logs
```

### Errores comunes

#### Error: "Webhook was not set"

- Verifica que `WEBHOOK_DOMAIN` esté configurado
- Ejecuta `npm run set-webhook` nuevamente
- Verifica que el dominio sea accesible públicamente

#### Error: "Database connection failed"

- Verifica las credenciales de Supabase
- Asegúrate de que las tablas existan
- Revisa las políticas RLS en Supabase

#### Error: "Bot token is invalid"

- Verifica que `BOT_TOKEN` esté correcto
- Obtén un nuevo token de @BotFather si es necesario

## 🔄 Actualizaciones

### Railway y Render

Ambas plataformas hacen auto-deploy cuando haces push a la rama configurada (normalmente `main`).

### Fly.io

```bash
flyctl deploy
```

## 💰 Costos Estimados

### Railway
- Starter: $5/mes (500 horas, suficiente para este bot)
- Pro: $20/mes (uso ilimitado)

### Render
- Free: $0 (se duerme después de inactividad)
- Starter: $7/mes (siempre activo)

### Fly.io
- Free tier: $0 (límites generosos, suficiente para empezar)
- Más recursos: pago por uso

### Supabase
- Free tier: $0 (500 MB de DB, suficiente para este proyecto)
- Pro: $25/mes (si necesitas más)

## 📊 Monitoreo

### Health Check

Todas las plataformas pueden usar el endpoint `/health`:

```
https://tu-dominio.com/health
```

Configurar health checks en tu plataforma para asegurar uptime.

### Uptime Monitoring (Opcional)

Servicios gratuitos de monitoreo:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

## 🆘 Soporte

Si tienes problemas con el deploy:

1. Revisa los logs de tu plataforma
2. Verifica las variables de entorno
3. Contacta soporte@redjudicial.cl

## ✅ Checklist Post-Deploy

- [ ] Servidor corriendo sin errores en los logs
- [ ] Webhook configurado correctamente
- [ ] Bot responde a `/start`
- [ ] Todos los botones funcionan
- [ ] Los invite links redirigen correctamente
- [ ] Health check responde correctamente
- [ ] Monitoreo configurado (opcional)

¡Felicidades! Tu bot está en producción. 🎉

