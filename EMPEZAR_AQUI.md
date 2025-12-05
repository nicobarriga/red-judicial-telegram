# 🚀 EMPEZAR AQUÍ - Red Judicial Telegram Bot

## ✅ ¡El proyecto está 100% implementado!

Todos los archivos de código están listos. Solo necesitas configurar Telegram, Supabase y hacer deploy.

---

## 📚 ¿Por dónde empiezo?

### 🎯 Si quieres empezar rápido (1.5 horas)
👉 Lee: **[QUICKSTART.md](QUICKSTART.md)**
- Checklist paso a paso
- Todo lo que necesitas hacer
- En orden de prioridad

### 📖 Si quieres entender todo el proyecto
👉 Lee: **[README.md](README.md)**
- Documentación técnica completa
- Arquitectura del sistema
- Cómo funciona cada componente

### 🤖 Si necesitas crear el bot y los grupos
👉 Lee: **[TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)**
- Guía paso a paso con @BotFather
- Cómo crear los 16 grupos
- Cómo crear la carpeta compartida
- Screenshots e instrucciones detalladas

### 🚀 Si estás listo para hacer deploy
👉 Lee: **[DEPLOY.md](DEPLOY.md)**
- Guía para Railway, Render y Fly.io
- Configuración de variables de entorno
- Troubleshooting común

### 📊 Si quieres ver un resumen ejecutivo
👉 Lee: **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
- Qué se implementó
- Arquitectura visual
- Decisiones de diseño
- Próximos pasos

### 📁 Si quieres entender la estructura del código
👉 Lee: **[ESTRUCTURA.md](ESTRUCTURA.md)**
- Árbol de archivos
- Flujo de datos
- Tablas de base de datos
- Endpoints y comandos

---

## 🎯 Ruta Recomendada (Orden de Lectura)

```
1. 📄 EMPEZAR_AQUI.md  ← Estás aquí
   └─→ Entiendes qué leer

2. 📄 QUICKSTART.md
   └─→ Ves el checklist completo

3. 📄 TELEGRAM_SETUP.md
   └─→ Creas bot y grupos

4. 📄 README.md (sección "Configuración")
   └─→ Instalas dependencias y configuras .env

5. 📄 README.md (sección "Testing Local")
   └─→ Pruebas localmente con ngrok

6. 📄 DEPLOY.md
   └─→ Haces deploy a producción

7. 🎉 ¡Bot funcionando!
```

---

## 📋 Checklist Ultra-Rápido

### Fase 1: Telegram (30-45 min)
- [ ] Crear bot con @BotFather → guardar `BOT_TOKEN`
- [ ] Crear 16 grupos (1 Lobby + 15 temáticos)
- [ ] Convertir todos a supergrupos
- [ ] Copiar los 16 invite links
- [ ] Crear carpeta compartida → guardar link

### Fase 2: Supabase (10 min)
- [ ] Crear proyecto en supabase.com
- [ ] Ejecutar `src/database/schema.sql`
- [ ] Editar `src/database/seed.sql` con tus links
- [ ] Ejecutar `src/database/seed.sql`
- [ ] Copiar URL y anon key

### Fase 3: Código (5 min)
- [ ] `npm install`
- [ ] Crear `.env` con todas las credenciales
- [ ] `npm run build`

### Fase 4: Testing (15 min)
- [ ] `npm run dev`
- [ ] `ngrok http 3000` (en otra terminal)
- [ ] Agregar URL de ngrok a `.env` como `WEBHOOK_DOMAIN`
- [ ] `npm run set-webhook`
- [ ] Probar el bot en Telegram

### Fase 5: Deploy (15-20 min)
- [ ] Subir a GitHub
- [ ] Conectar con Railway/Render
- [ ] Configurar variables de entorno
- [ ] Obtener dominio público
- [ ] Actualizar `WEBHOOK_DOMAIN`
- [ ] `npm run set-webhook`
- [ ] ✅ ¡Listo!

---

## 🎨 Lo que vas a construir

```
┌─────────────────────────────────────────┐
│         Usuario en Instagram            │
│    "Únete a Red Judicial - t.me/..."   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       @RedJudicialBot en Telegram       │
│                                         │
│  Bienvenido a Red Judicial! 👋          │
│                                         │
│  Tenemos 15 grupos por especialidad:   │
│                                         │
│  [ Civil ]  [ Penal ]                  │
│  [ Familia ]  [ Laboral ]              │
│  [ Tributario ]  [ Constitucional ]    │
│  ...                                    │
│                                         │
│  [ 📁 Ver todos (Carpeta) ]            │
└──────────────┬──────────────────────────┘
               │
               ▼ (usuario hace clic en "Civil")
┌─────────────────────────────────────────┐
│       @RedJudicialBot responde:         │
│                                         │
│  📚 RJ – Civil                          │
│                                         │
│  Discusiones sobre derecho civil,      │
│  contratos, responsabilidad civil...   │
│                                         │
│  [ 🚀 Unirme a RJ – Civil ]            │
└──────────────┬──────────────────────────┘
               │
               ▼ (usuario hace clic)
┌─────────────────────────────────────────┐
│      Telegram abre el grupo             │
│      Usuario se une con 1 clic          │
│      ✅ Ahora es miembro de RJ – Civil  │
└─────────────────────────────────────────┘
```

---

## 🛠️ Tecnologías Usadas

- **Node.js 20+** - Runtime
- **TypeScript** - Lenguaje
- **grammy** - Bot de Telegram
- **Express** - Servidor HTTP
- **Supabase** - Base de datos PostgreSQL
- **Railway/Render** - Hosting

---

## 📞 ¿Necesitas Ayuda?

### Durante la configuración:
- 📖 Revisa la documentación correspondiente
- 🔍 Busca en la sección "Troubleshooting" de cada guía

### Si algo no funciona:
- 📧 Email: soporte@redjudicial.cl
- 💬 Telegram: @RedJudicialSoporte

### Errores comunes:
- **Bot no responde**: Verifica webhook con `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- **Error de Supabase**: Verifica credenciales y que las tablas existan
- **Links no funcionan**: Asegúrate de que los grupos sean supergrupos

---

## 📦 Archivos del Proyecto

```
📄 Documentación:
   ├── EMPEZAR_AQUI.md      ← Estás aquí
   ├── QUICKSTART.md         ← Checklist rápido
   ├── README.md             ← Documentación completa
   ├── TELEGRAM_SETUP.md     ← Guía de Telegram
   ├── DEPLOY.md             ← Guía de deploy
   ├── PROJECT_SUMMARY.md    ← Resumen ejecutivo
   └── ESTRUCTURA.md         ← Estructura del código

📁 Código:
   ├── src/                  ← Todo el código fuente
   ├── scripts/              ← Scripts de utilidad
   ├── package.json          ← Dependencias
   ├── tsconfig.json         ← Config TypeScript
   └── .env (crear)          ← Variables de entorno

🚀 Deploy:
   ├── Procfile              ← Railway
   └── render.yaml           ← Render
```

---

## ⏱️ Tiempo Estimado Total

- **Configuración de Telegram**: 30-45 minutos
- **Setup de Supabase**: 10 minutos
- **Instalación local**: 5 minutos
- **Testing local**: 15 minutos
- **Deploy a producción**: 15-20 minutos

**Total: ~1.5 horas** ⏰

---

## 🎯 Próximo Paso

👉 **Abre [QUICKSTART.md](QUICKSTART.md)** y sigue el checklist paso a paso.

---

## ✨ ¡Éxito!

Este proyecto está completamente implementado y listo para usar.
Solo necesitas configurar las credenciales y hacer deploy.

**¡Vamos a crear la comunidad Red Judicial! 🚀**

---

_Última actualización: Diciembre 2024_

