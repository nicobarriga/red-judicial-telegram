# Estado actual — Red Judicial Telegram Bot

Última actualización: 2025-12-16

---

### Objetivo del proyecto

Tener un **punto de entrada único** (bot de Telegram) para la comunidad **Red Judicial**, que:

- Da la bienvenida y guía a nuevos miembros.
- Recopila datos mínimos para **seguridad y mejor soporte** (registro).
- Entrega acceso al **grupo principal** y explica cómo usar los **Temas** (topics) por especialidad.
- Registra métricas básicas (intereses/clicks) en Supabase.

---

### Arquitectura (alto nivel)

- **Telegram**
  - Grupo principal (supergrupo) público: `@somosredjudicial`
  - Temas (topics) dentro del grupo (especialidades + temas adicionales como Jurisprudencia y Estudiantes)
  - Tema dedicado: **Bienvenida** (para publicar mensajes de bienvenida sin ensuciar el chat general)
  - Bot: `@RedJudicial_bot`

- **Backend**
  - Node.js + TypeScript + grammy + Express
  - Webhook: `POST /telegram/webhook`
  - Health check: `GET /health`

- **Base de datos**
  - Supabase (PostgreSQL)
  - Tablas: `telegram_group`, `telegram_topics`, `telegram_users`, `user_topic_interest`

- **Hosting**
  - Railway (servicio web)
  - Webhook de Telegram apunta al dominio de Railway

---

### Estado operativo (lo verificado)

- **Railway**
  - Servicio responde `GET /health` con `{"status":"ok", ...}`
  - Webhook del bot apunta a Railway: `https://web-production-75839.up.railway.app/telegram/webhook`

- **Telegram Webhook**
  - `allowed_updates` incluye:
    - `message`
    - `callback_query`
    - `chat_member` y `my_chat_member` (para eventos de ingreso/estado del bot)
  - `pending_update_count = 0` (sin cola)

- **Supabase**
  - `telegram_users` contiene columnas de onboarding (registro):
    - `phone_number`, `email`, `is_lawyer`, `profession_or_study`, `onboarding_step`, `onboarding_completed`, `updated_at`
  - `telegram_topics` incluye 17 temas (se agregaron **Jurisprudencia** y **Estudiantes**)

---

### Cómo funciona el flujo (usuario nuevo)

#### A) Usuario entra al grupo por link público

1. Telegram registra que el usuario **entró** al supergrupo.
2. Telegram envía un update `chat_member` al webhook.
3. El bot:
   - valida que el evento sea del grupo correcto (`MAIN_GROUP_CHAT_ID`)
   - detecta un ingreso real (`left/kicked → member/restricted`)
4. El bot publica un mensaje de bienvenida:
   - **en el Tema “Bienvenida”** si `WELCOME_TOPIC_ID` está configurado
   - mensaje incluye botón **🚀 Empezar** (deep link al bot)
   - mensaje se envía **silencioso** (`disable_notification: true`)
   - opcional: puede auto-borrarse con `WELCOME_AUTO_DELETE_SECONDS`

#### B) Usuario abre el bot (privado) y completa registro (onboarding)

1. El usuario abre el bot y presiona **Iniciar** (o escribe cualquier mensaje en privado).
2. El bot realiza onboarding (registro):
   - pide **Nombre y Apellido(s)** (formato recomendado: `Nombre(s), Apellido(s)`)
   - pregunta si es **abogado/a**
   - si NO: pide **profesión/estudios**
   - pide **email** (obligatorio)
   - pide **teléfono** usando botón de “Compartir mi número” (obligatorio)
3. El bot guarda en Supabase en `telegram_users` asociado a:
   - `telegram_id` (ID de Telegram)
   - `phone_number` (al compartir contacto)
4. Al completar:
   - marca `onboarding_completed = true`
   - muestra menú con temas y botón “Unirme a Red Judicial”

#### Nota importante (privacidad / límites Telegram)

- El bot **no puede** iniciar conversación privada con usuarios que **no han abierto el bot** antes.
- Por eso el saludo “automático” ocurre en el **grupo/tema**, y el registro ocurre en **privado**.

---

### Temas (topics) actuales en Supabase

Los temas se leen desde `telegram_topics` (activo=true, orden ascendente).  
Actualmente hay **17** incluyendo:

- `jurisprudencia` (orden 16)
- `estudiantes` (orden 17)

Agregar un tema nuevo = insertar una fila en `telegram_topics`.

---

### Base de datos (Supabase)

#### Tablas principales

- **`telegram_group`**
  - 1 fila: grupo principal (invite_link, descripción, activo)

- **`telegram_topics`**
  - lista de temas, con `slug`, `titulo`, `descripcion`, `orden`, `activo`

- **`telegram_users`**
  - registro y perfil:
    - `telegram_id`, `username`, `first_name`, `last_name`
    - onboarding: `email`, `phone_number`, `is_lawyer`, `profession_or_study`
    - estado: `onboarding_step`, `onboarding_completed`, `updated_at`

- **`user_topic_interest`**
  - métricas: clicks/intereses por `topic_slug`

#### Migración importante (onboarding)

Archivo: `src/database/migrations/2025-12-15_onboarding.sql`  
Se ejecuta una vez si la DB ya existía, para agregar columnas de onboarding en `telegram_users`.

---

### Variables de entorno (Railway / local)

**Requeridas**

- `BOT_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `WEBHOOK_DOMAIN` (dominio público)

**Recomendadas para operación**

- `MAIN_GROUP_CHAT_ID`  
  - Grupo `@somosredjudicial`: `-1003445173954`

- `BOT_USERNAME`  
  - `RedJudicial_bot`

- `WELCOME_TOPIC_ID`  
  - Tema “Bienvenida”: `46`

- `WELCOME_AUTO_DELETE_SECONDS` (opcional)  
  - Ej: `60`

- `DELETE_SERVICE_MESSAGES` (opcional)  
  - `true` para borrar mensajes de servicio “se unió / salió” (requiere permisos de admin)

---

### Telegram (config clave)

#### Bot en grupo

Para que el bot pueda publicar y moderar:

- Agregar `@RedJudicial_bot` al grupo
- Dar permisos de admin recomendados:
  - Enviar mensajes
  - Borrar mensajes (si se usa `DELETE_SERVICE_MESSAGES`)

#### Tema “Bienvenida”

- Tema creado manualmente en Telegram: **Bienvenida**
- `WELCOME_TOPIC_ID` se obtiene ejecutando:
  - `/threadid@RedJudicial_bot` dentro del tema

---

### Railway (deploy)

El servicio corre como web app con:

- build: TypeScript → `dist/`
- start: `node dist/index.js`

Endpoints:

- `GET /health`
- `POST /telegram/webhook`

Después de cambios relevantes en webhook/updates:

- correr localmente: `npm run set-webhook` (configura webhook en Telegram)

---

### Seguridad (recordatorios)

- Nunca publicar `BOT_TOKEN` ni `SUPABASE_KEY`.
- Si un token se expone: revocar en @BotFather (`/revoke`) y actualizar en Railway y `.env`.
- Mantener `.env` fuera del repo (ya está en `.gitignore`).

---

### Checklist (hoy)

- **Supabase**
  - [x] Tablas creadas
  - [x] Seed ejecutado
  - [x] Migración onboarding ejecutada
  - [x] Temas extra agregados (Jurisprudencia, Estudiantes)

- **Telegram**
  - [x] Bot creado
  - [x] Grupo principal creado y con temas
  - [x] Tema “Bienvenida” creado
  - [x] Bot agregado al grupo (ideal admin)

- **Railway**
  - [x] Deploy activo
  - [x] Health OK
  - [x] Webhook OK con `chat_member`
  - [ ] Confirmar variables: `MAIN_GROUP_CHAT_ID`, `WELCOME_TOPIC_ID`, `DELETE_SERVICE_MESSAGES` según preferencia

---

### Próximos pasos sugeridos (producto)

- Crear canal “Anuncios” y sembrar 3 posts mínimos:
  - Criterio práctico corto
  - Jurisprudencia útil resumida
  - “Cómo usar la comunidad”
- (Opcional) Implementar estado “soft” de membresía:
  - registrar `joined_group_at` / `left_group_at` y métricas de churn


