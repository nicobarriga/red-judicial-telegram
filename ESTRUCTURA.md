# 📁 Estructura del Proyecto

```
Redjudicial Telegram/
│
├── 📄 package.json                    # Dependencias y scripts npm
├── 📄 tsconfig.json                   # Configuración TypeScript
├── 📄 nodemon.json                    # Configuración desarrollo
├── 📄 .gitignore                      # Archivos ignorados por Git
├── 📄 .dockerignore                   # Archivos ignorados por Docker
│
├── 🚀 DEPLOY
│   ├── 📄 Procfile                    # Configuración Railway
│   └── 📄 render.yaml                 # Configuración Render
│
├── 📚 DOCUMENTACIÓN
│   ├── 📄 README.md                   # Documentación principal
│   ├── 📄 TELEGRAM_SETUP.md           # Guía setup Telegram
│   ├── 📄 DEPLOY.md                   # Guía de deploy
│   ├── 📄 QUICKSTART.md               # Guía rápida
│   ├── 📄 PROJECT_SUMMARY.md          # Resumen ejecutivo
│   └── 📄 ESTRUCTURA.md               # Este archivo
│
├── 📁 scripts/
│   └── 📄 set-webhook.ts              # Script configurar webhook
│
└── 📁 src/                            # Código fuente
    │
    ├── 📄 index.ts                    # 🚪 Entry point del servidor
    │   └── Inicializa Express + Bot + Webhook
    │
    ├── 📁 config/
    │   └── 📄 index.ts                # ⚙️ Configuración y variables
    │       └── Carga .env y valida
    │
    ├── 📁 types/
    │   └── 📄 index.ts                # 📝 Tipos TypeScript
    │       ├── TelegramGroup
    │       ├── TelegramUser
    │       ├── UserGroupJoinIntent
    │       └── Config
    │
    ├── 📁 bot/
    │   └── 📄 bot.ts                  # 🤖 Inicialización del bot
    │       ├── Crea instancia de grammy
    │       ├── Configura error handling
    │       └── Registra todos los handlers
    │
    ├── 📁 database/
    │   ├── 📄 client.ts               # 🗄️ Cliente Supabase
    │   │   ├── initSupabase()
    │   │   ├── getOrCreateUser()
    │   │   ├── getActiveGroups()
    │   │   ├── getGroupBySlug()
    │   │   ├── recordJoinIntent()
    │   │   └── getUserStats()
    │   │
    │   ├── 📄 schema.sql              # 🏗️ Esquema de tablas
    │   │   ├── telegram_groups
    │   │   ├── telegram_users
    │   │   └── user_group_join_intent
    │   │
    │   └── 📄 seed.sql                # 🌱 Datos iniciales
    │       └── INSERT de 15 grupos
    │
    └── 📁 handlers/                   # 🎯 Handlers del bot
        │
        ├── 📄 start.ts                # Comando /start
        │   ├── Registra usuario
        │   ├── Mensaje bienvenida
        │   └── Menú con botones
        │
        ├── 📄 menu.ts                 # Comando /menu
        │   └── Reenvía menú de especialidades
        │
        ├── 📄 grupos.ts               # Comando /grupos
        │   └── Lista todos los grupos con links
        │
        ├── 📄 soporte.ts              # Comando /soporte
        │   └── Información de ayuda
        │
        └── 📄 callbacks.ts            # Botones inline
            ├── Detecta join:<slug>
            ├── Busca grupo en DB
            ├── Registra intento
            └── Envía link de invitación
```

## 🔄 Flujo de Datos

```
1. Usuario → /start
   ↓
2. Telegram → POST /telegram/webhook
   ↓
3. src/index.ts → Recibe update
   ↓
4. src/bot/bot.ts → Procesa comando
   ↓
5. src/handlers/start.ts → Handler específico
   ↓
6. src/database/client.ts → getOrCreateUser()
   ↓
7. Supabase → Guarda/actualiza usuario
   ↓
8. src/database/client.ts → getActiveGroups()
   ↓
9. Supabase → Retorna grupos
   ↓
10. src/handlers/start.ts → Crea teclado
    ↓
11. Telegram API → Envía mensaje con botones
    ↓
12. Usuario → Ve mensaje con menú
```

## 🎯 Flujo de Callback (Botón)

```
1. Usuario → Click en "Civil"
   ↓
2. Telegram → callback_query con data: "join:civil"
   ↓
3. src/handlers/callbacks.ts → handleCallbacks()
   ↓
4. src/database/client.ts → getGroupBySlug('civil')
   ↓
5. Supabase → Retorna info del grupo
   ↓
6. src/database/client.ts → recordJoinIntent()
   ↓
7. Supabase → Guarda intento
   ↓
8. src/handlers/callbacks.ts → Crea botón URL
   ↓
9. Telegram API → Envía mensaje con link
   ↓
10. Usuario → Click en link → Unirse al grupo
```

## 📊 Tablas de Base de Datos

### telegram_groups
```
┌────┬───────────┬──────────────┬──────────────┬──────────────┬───────┬────────┐
│ id │   slug    │    titulo    │ descripcion  │ invite_link  │ orden │ activo │
├────┼───────────┼──────────────┼──────────────┼──────────────┼───────┼────────┤
│ 1  │ civil     │ RJ – Civil   │ Derecho...   │ https://...  │   1   │  true  │
│ 2  │ penal     │ RJ – Penal   │ Temas de...  │ https://...  │   2   │  true  │
│... │ ...       │ ...          │ ...          │ ...          │  ...  │  ...   │
└────┴───────────┴──────────────┴──────────────┴──────────────┴───────┴────────┘
```

### telegram_users
```
┌────┬──────────────┬──────────┬────────────┬───────────┬────────────┬────────────┐
│ id │ telegram_id  │ username │ first_name │ last_name │ joined_at  │   origen   │
├────┼──────────────┼──────────┼────────────┼───────────┼────────────┼────────────┤
│ 1  │ 123456789    │ juanp    │ Juan       │ Pérez     │ 2024-01... │ direct_bot │
│ 2  │ 987654321    │ mariag   │ María      │ González  │ 2024-01... │ web        │
│... │ ...          │ ...      │ ...        │ ...       │ ...        │ ...        │
└────┴──────────────┴──────────┴────────────┴───────────┴────────────┴────────────┘
```

### user_group_join_intent
```
┌────┬───────────────────┬─────────────┬────────────────────┐
│ id │ telegram_user_id  │ group_slug  │    clicked_at      │
├────┼───────────────────┼─────────────┼────────────────────┤
│ 1  │ 123456789         │ civil       │ 2024-01-15 10:30   │
│ 2  │ 123456789         │ penal       │ 2024-01-15 10:32   │
│ 3  │ 987654321         │ laboral     │ 2024-01-15 11:00   │
│... │ ...               │ ...         │ ...                │
└────┴───────────────────┴─────────────┴────────────────────┘
```

## 🔌 Endpoints del Servidor

```
GET  /health              → Health check
                            Responde: {"status":"ok","timestamp":"..."}

POST /telegram/webhook    → Webhook de Telegram
                            Recibe: Updates de Telegram
                            Procesa: Comandos y callbacks
```

## ⚙️ Variables de Entorno

```env
# Requeridas
BOT_TOKEN          → Token del bot de @BotFather
SUPABASE_URL       → URL del proyecto Supabase
SUPABASE_KEY       → Anon key de Supabase
FOLDER_INVITE_URL  → Link de carpeta compartida

# Opcionales
WEBHOOK_DOMAIN     → Dominio público (solo producción)
PORT               → Puerto del servidor (default: 3000)
```

## 🛠️ Scripts NPM

```bash
npm run dev          # Desarrollo con hot reload
                     # Usa: nodemon + ts-node
                     # Puerto: 3000

npm run build        # Compilar TypeScript → JavaScript
                     # Input: src/**/*.ts
                     # Output: dist/**/*.js

npm start           # Producción
                     # Ejecuta: node dist/index.js

npm run set-webhook  # Configurar webhook
                     # Ejecuta: ts-node scripts/set-webhook.ts
```

## 📦 Dependencias

### Producción
```
grammy                    → Bot de Telegram
@supabase/supabase-js     → Cliente Supabase
express                   → Servidor HTTP
dotenv                    → Variables de entorno
```

### Desarrollo
```
typescript                → Compilador TypeScript
@types/node              → Tipos Node.js
@types/express           → Tipos Express
ts-node                  → Ejecutar TS directamente
nodemon                  → Hot reload
```

## 🎨 Comandos del Bot

```
/start     → Inicia el bot
             Muestra: Bienvenida + menú con 15 especialidades
             Botones: 15 especialidades + carpeta

/menu      → Ver menú de especialidades
             Muestra: Mismo menú que /start

/grupos    → Lista completa de grupos
             Muestra: Texto con todos los links

/soporte   → Ayuda y contacto
             Muestra: Info de soporte + FAQs
```

## 🔘 Callbacks (Botones)

```
join:civil              → Unirse a RJ – Civil
join:penal              → Unirse a RJ – Penal
join:familia            → Unirse a RJ – Familia
join:laboral            → Unirse a RJ – Laboral
join:tributario         → Unirse a RJ – Tributario
join:constitucional     → Unirse a RJ – Constitucional
join:administrativo     → Unirse a RJ – Administrativo
join:propiedad          → Unirse a RJ – Propiedad
join:consumidor         → Unirse a RJ – Consumidor
join:ejecuciones        → Unirse a RJ – Ejecuciones
join:comercial          → Unirse a RJ – Comercial
join:libre_competencia  → Unirse a RJ – Libre Competencia
join:ambiental          → Unirse a RJ – Ambiental
join:penal_economico    → Unirse a RJ – Penal Económico
join:procesal           → Unirse a RJ – Procesal
```

## 🚀 Plataformas de Deploy

### Railway
```
Archivo: Procfile
Comando: web: npm start
Auto-deploy: ✅ (push a main)
```

### Render
```
Archivo: render.yaml
Build: npm install && npm run build
Start: npm start
Auto-deploy: ✅ (push a main)
```

### Fly.io
```
Comando: flyctl deploy
Build: npm run build
Start: npm start
Auto-deploy: ❌ (manual)
```

## 📈 Métricas Disponibles

```sql
-- Usuarios totales
SELECT COUNT(*) FROM telegram_users;

-- Usuarios por origen
SELECT origen, COUNT(*) 
FROM telegram_users 
GROUP BY origen;

-- Grupos más populares
SELECT group_slug, COUNT(*) as clicks
FROM user_group_join_intent
GROUP BY group_slug
ORDER BY clicks DESC;

-- Actividad por día
SELECT DATE(clicked_at), COUNT(*)
FROM user_group_join_intent
GROUP BY DATE(clicked_at);
```

## 🔍 Debugging

```bash
# Ver logs del servidor
# Railway: Dashboard → Logs
# Render: Dashboard → Logs
# Fly.io: flyctl logs

# Verificar webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Health check
curl https://tu-dominio.com/health

# Test local
npm run dev
# En otra terminal:
ngrok http 3000
```

## ✅ Checklist de Archivos

- [x] package.json
- [x] tsconfig.json
- [x] nodemon.json
- [x] .gitignore
- [x] .dockerignore
- [x] Procfile
- [x] render.yaml
- [x] README.md
- [x] TELEGRAM_SETUP.md
- [x] DEPLOY.md
- [x] QUICKSTART.md
- [x] PROJECT_SUMMARY.md
- [x] ESTRUCTURA.md
- [x] src/index.ts
- [x] src/config/index.ts
- [x] src/types/index.ts
- [x] src/bot/bot.ts
- [x] src/database/client.ts
- [x] src/database/schema.sql
- [x] src/database/seed.sql
- [x] src/handlers/start.ts
- [x] src/handlers/menu.ts
- [x] src/handlers/grupos.ts
- [x] src/handlers/soporte.ts
- [x] src/handlers/callbacks.ts
- [x] scripts/set-webhook.ts

**Total: 26 archivos ✅**

## 🎯 Estado del Proyecto

```
✅ Configuración del proyecto
✅ Base de datos (esquema + seed)
✅ Cliente Supabase
✅ Bot de Telegram
✅ Servidor Express
✅ Handlers de comandos
✅ Handlers de callbacks
✅ Scripts de utilidades
✅ Configuración de deploy
✅ Documentación completa

🎉 PROYECTO 100% COMPLETO
```

