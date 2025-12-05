# 🚀 Guía Rápida de Inicio

Esta guía te llevará de 0 a producción en pocos pasos.

## ✅ Checklist Completo

### Fase 1: Configuración de Telegram (Manual)

- [ ] **Crear el bot**
  - Hablar con @BotFather en Telegram
  - Comando: `/newbot`
  - Guardar el `BOT_TOKEN`
  - Ver: [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) sección 1

- [ ] **Crear 16 grupos** (1 Lobby + 15 temáticos)
  - Todos deben ser **supergrupos**
  - Obtener los invite links de cada uno
  - Ver: [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) sección 2

- [ ] **Crear carpeta compartida**
  - Desde Telegram Desktop/Web
  - Añadir todos los grupos
  - Obtener link de la carpeta
  - Ver: [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) sección 3

### Fase 2: Configuración de Supabase

- [ ] **Crear proyecto en Supabase**
  - Ve a [supabase.com](https://supabase.com)
  - Crea un nuevo proyecto
  - Espera a que termine de configurarse

- [ ] **Ejecutar esquema de tablas**
  - En Supabase: SQL Editor
  - Copia y ejecuta: `src/database/schema.sql`

- [ ] **Insertar datos iniciales**
  - Edita `src/database/seed.sql`
  - Reemplaza todos los `https://t.me/+XXXXX_...` con tus invite links reales
  - Ejecuta en SQL Editor

- [ ] **Obtener credenciales**
  - Settings → API
  - Copia `URL` → tu `SUPABASE_URL`
  - Copia `anon public` key → tu `SUPABASE_KEY`

### Fase 3: Configuración del Proyecto

- [ ] **Clonar e instalar**
  ```bash
  cd "Redjudicial Telegram"
  npm install
  ```

- [ ] **Configurar variables de entorno**
  ```bash
  # Crear archivo .env (copia de .env.example si existe)
  # O créalo manualmente con este contenido:
  ```
  
  Crea archivo `.env` con:
  ```env
  BOT_TOKEN=tu_token_del_bot_aqui
  SUPABASE_URL=tu_url_de_supabase
  SUPABASE_KEY=tu_anon_key_de_supabase
  FOLDER_INVITE_URL=tu_link_de_carpeta_aqui
  PORT=3000
  ```

### Fase 4: Testing Local

- [ ] **Compilar el proyecto**
  ```bash
  npm run build
  ```

- [ ] **Iniciar en desarrollo**
  ```bash
  npm run dev
  ```

- [ ] **Configurar ngrok** (en otra terminal)
  ```bash
  ngrok http 3000
  ```
  - Copia la URL HTTPS que te da (ej: `https://xxxx.ngrok.io`)
  - Agrégala a `.env`:
    ```env
    WEBHOOK_DOMAIN=https://xxxx.ngrok.io
    ```

- [ ] **Configurar webhook**
  ```bash
  npm run set-webhook
  ```

- [ ] **Probar el bot**
  - Abre Telegram
  - Busca tu bot
  - Envía `/start`
  - Verifica que responde con el menú
  - Prueba todos los comandos
  - Prueba hacer clic en los botones

### Fase 5: Deploy a Producción

Elige una plataforma:

#### Opción A: Railway (Recomendado)

- [ ] Ve a [railway.app](https://railway.app)
- [ ] New Project → Deploy from GitHub
- [ ] Selecciona el repositorio
- [ ] Agrega variables de entorno (sin WEBHOOK_DOMAIN por ahora)
- [ ] Railway te dará un dominio (ej: `https://tu-app.up.railway.app`)
- [ ] Agrega `WEBHOOK_DOMAIN` con ese dominio
- [ ] Redeploy si es necesario
- [ ] Ejecuta localmente: `npm run set-webhook` (con el nuevo WEBHOOK_DOMAIN)

#### Opción B: Render

- [ ] Ve a [render.com](https://render.com)
- [ ] New → Web Service
- [ ] Conecta GitHub
- [ ] Build: `npm install && npm run build`
- [ ] Start: `npm start`
- [ ] Agrega variables de entorno
- [ ] Copia el dominio de Render
- [ ] Agrega `WEBHOOK_DOMAIN`
- [ ] Ejecuta: `npm run set-webhook`

Ver guía completa: [DEPLOY.md](DEPLOY.md)

### Fase 6: Verificación Final

- [ ] **Webhook configurado**
  ```bash
  curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
  ```
  - Debe mostrar tu dominio
  - `pending_update_count` debe ser 0

- [ ] **Bot responde**
  - Envía `/start` al bot
  - Debe responder con el menú
  - Los botones deben funcionar

- [ ] **Grupos accesibles**
  - Haz clic en un botón de especialidad
  - Debe mostrar el link del grupo
  - El link debe funcionar

- [ ] **Carpeta funciona**
  - El botón de carpeta debe abrir Telegram
  - Debe mostrar todos los grupos

- [ ] **Health check**
  ```bash
  curl https://tu-dominio.com/health
  ```
  - Debe responder con `{"status":"ok",...}`

## 📁 Estructura del Proyecto

```
Redjudicial Telegram/
├── src/
│   ├── bot/
│   │   └── bot.ts              # Bot principal
│   ├── config/
│   │   └── index.ts            # Configuración
│   ├── database/
│   │   ├── client.ts           # Cliente Supabase
│   │   ├── schema.sql          # Esquema de tablas
│   │   └── seed.sql            # Datos iniciales
│   ├── handlers/
│   │   ├── start.ts            # /start
│   │   ├── menu.ts             # /menu
│   │   ├── grupos.ts           # /grupos
│   │   ├── soporte.ts          # /soporte
│   │   └── callbacks.ts        # Botones
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   └── index.ts                # Entry point
├── scripts/
│   └── set-webhook.ts          # Script de webhook
├── package.json
├── tsconfig.json
├── .gitignore
├── Procfile                    # Railway
├── render.yaml                 # Render
├── README.md                   # Documentación completa
├── TELEGRAM_SETUP.md           # Guía de Telegram
├── DEPLOY.md                   # Guía de deploy
└── QUICKSTART.md              # Este archivo
```

## 🎯 Comandos del Bot

Una vez en producción:

- `/start` - Inicia el bot y muestra bienvenida
- `/menu` - Ver menú de especialidades
- `/grupos` - Lista completa con links
- `/soporte` - Información de ayuda

## 🐛 Solución de Problemas Rápida

**Bot no responde:**
- Verifica que el webhook esté configurado: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Revisa los logs de tu servidor
- Verifica variables de entorno

**Error de Supabase:**
- Verifica credenciales
- Asegúrate de que las tablas existan
- Revisa que `seed.sql` se haya ejecutado

**Links no funcionan:**
- Verifica que los grupos sean supergrupos
- Regenera los invite links si es necesario
- Actualiza la BD con los nuevos links

## 📞 Ayuda

- **Documentación completa**: [README.md](README.md)
- **Setup de Telegram**: [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)
- **Guía de deploy**: [DEPLOY.md](DEPLOY.md)
- **Soporte**: soporte@redjudicial.cl

## ⏱️ Tiempo Estimado

- Fase 1 (Telegram): 30-45 minutos
- Fase 2 (Supabase): 10 minutos
- Fase 3 (Proyecto): 5 minutos
- Fase 4 (Testing): 15 minutos
- Fase 5 (Deploy): 15-20 minutos
- **Total: ~1.5 horas**

¡Éxito! 🎉

