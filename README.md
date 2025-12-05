# Red Judicial Telegram Bot

Bot de Telegram para gestionar la comunidad Red Judicial de abogados en Chile.

## 🎯 Descripción

Este bot permite a los abogados descubrir y unirse a los 15 grupos temáticos de la comunidad Red Judicial. El bot actúa como punto de entrada único, mostrando todas las especialidades disponibles y facilitando el acceso a cada grupo.

## 🏗️ Arquitectura

```
Usuario → Bot de Telegram → Backend (Node.js + Express)
                               ↓
                         Supabase (PostgreSQL)
                               ↓
                         15 Grupos Temáticos
```

### Componentes

1. **Bot de Telegram** (@RedJudicialBot): Punto de entrada único
2. **Backend**: Node.js + TypeScript + grammy + Express
3. **Base de datos**: Supabase (PostgreSQL)
4. **Grupos**: 15 supergrupos temáticos en Telegram

## 📋 Requisitos Previos

- Node.js >= 20.0.0
- Una cuenta de Supabase
- Un bot de Telegram creado con @BotFather
- Los grupos de Telegram ya creados con sus invite links

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd redjudicial-telegram
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
BOT_TOKEN=tu_token_del_bot
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_anon_key_de_supabase
FOLDER_INVITE_URL=https://t.me/addlist/XXXXX
WEBHOOK_DOMAIN=https://tu-dominio.com
PORT=3000
```

### 4. Configurar la base de datos

Ejecuta los scripts SQL en tu proyecto de Supabase:

```bash
# 1. Crear las tablas
# Ejecutar src/database/schema.sql en el editor SQL de Supabase

# 2. Insertar datos iniciales
# Editar src/database/seed.sql con tus invite_link reales
# Ejecutar en el editor SQL de Supabase
```

**Importante**: Debes reemplazar los `invite_link` en `seed.sql` con los links reales de tus grupos antes de ejecutarlo.

## 💻 Desarrollo Local

### Iniciar en modo desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`.

### Testing con ngrok

Para probar el bot en desarrollo, necesitas exponer tu servidor local:

```bash
# En una terminal separada
ngrok http 3000
```

Copia la URL HTTPS que ngrok te proporciona y configura el webhook:

```bash
# Actualiza WEBHOOK_DOMAIN en .env con la URL de ngrok
WEBHOOK_DOMAIN=https://xxxx-xx-xx-xxx-xxx.ngrok.io

# Configura el webhook
npm run set-webhook
```

## 🏭 Producción

### Build

```bash
npm run build
```

Esto compilará TypeScript a JavaScript en la carpeta `dist/`.

### Iniciar en producción

```bash
npm start
```

## 🚢 Deploy

### Opción 1: Railway

1. Conecta tu repositorio de GitHub a Railway
2. Configura las variables de entorno en el dashboard
3. Railway detectará automáticamente el `package.json` y hará el deploy

### Opción 2: Render

1. Crea un nuevo Web Service en Render
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Agrega las variables de entorno
5. Deploy

### Configurar el Webhook

Una vez que tengas tu dominio público:

```bash
# Actualiza WEBHOOK_DOMAIN en las variables de entorno de tu plataforma
# Luego ejecuta (localmente con las credenciales):
npm run set-webhook
```

## 📝 Comandos del Bot

- `/start` - Inicia el bot y muestra el menú de bienvenida
- `/menu` - Muestra el menú de especialidades
- `/grupos` - Lista todos los grupos con sus links
- `/soporte` - Información de ayuda y contacto

## 🗂️ Estructura del Proyecto

```
src/
├── bot/
│   └── bot.ts              # Inicialización del bot y registro de handlers
├── config/
│   └── index.ts            # Configuración y variables de entorno
├── database/
│   ├── client.ts           # Cliente de Supabase y funciones auxiliares
│   ├── schema.sql          # Esquema de tablas
│   └── seed.sql            # Datos iniciales
├── handlers/
│   ├── start.ts            # Handler del comando /start
│   ├── menu.ts             # Handler del comando /menu
│   ├── grupos.ts           # Handler del comando /grupos
│   ├── soporte.ts          # Handler del comando /soporte
│   └── callbacks.ts        # Handler de callbacks (botones)
├── types/
│   └── index.ts            # Tipos TypeScript
└── index.ts                # Entry point del servidor
```

## 🗄️ Base de Datos

### Tablas

**telegram_groups**
- Almacena la información de los 15 grupos temáticos
- Campos: slug, titulo, descripcion, invite_link, orden, activo

**telegram_users**
- Registra usuarios que interactúan con el bot
- Campos: telegram_id, username, first_name, last_name, joined_at, origen

**user_group_join_intent**
- Métricas de intentos de unirse a grupos
- Campos: telegram_user_id, group_slug, clicked_at

## 🔍 Troubleshooting

### El bot no responde

1. Verifica que el webhook esté configurado correctamente:
   ```bash
   curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
   ```

2. Revisa los logs del servidor para errores

3. Verifica que todas las variables de entorno estén configuradas

### Error de conexión a Supabase

1. Verifica que `SUPABASE_URL` y `SUPABASE_KEY` sean correctos
2. Asegúrate de que las tablas existan en Supabase
3. Revisa las políticas RLS (Row Level Security) en Supabase

### Los invite_link no funcionan

1. Verifica que los grupos sean **supergrupos**
2. Asegúrate de que los links de invitación no hayan expirado
3. Genera nuevos links si es necesario y actualiza la BD

## 📚 Documentación Adicional

- [Configuración de Telegram](./TELEGRAM_SETUP.md) - Guía paso a paso para crear el bot y los grupos
- [grammy Documentation](https://grammy.dev/) - Documentación de la librería del bot
- [Supabase Documentation](https://supabase.com/docs) - Documentación de Supabase

## 🤝 Soporte

Para preguntas o problemas:
- Email: soporte@redjudicial.cl
- Telegram: @RedJudicialSoporte

## 📄 Licencia

MIT

