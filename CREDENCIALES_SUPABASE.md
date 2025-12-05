# 🔑 Credenciales de Supabase que Necesito

## 📍 Dónde encontrarlas:

1. Ve a tu proyecto en Supabase
2. Settings (icono de engranaje, abajo izquierda)
3. API (en el menú lateral)
4. En la sección "Project API keys"

## ✅ Necesito estos 2 valores:

### 1. SUPABASE_URL
- Busca "Project URL"
- Se ve así: `https://xxxxxxxxxxxxx.supabase.co`
- Copia esa URL completa

### 2. SUPABASE_KEY
- Busca "anon public" key
- Se ve así: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (muy largo)
- Copia esa key completa

## 📝 Ejemplo de cómo se ven:

```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## ⚠️ Importante:

- Usa la key "anon public" (NO la "service_role")
- La key "anon public" es segura para usar en el frontend/bot
- La "service_role" es solo para backend seguro

---

**Pega aquí las credenciales cuando las tengas:**
