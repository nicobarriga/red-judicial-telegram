# ✅ Instrucciones para Actualizar Supabase

## Paso 1: Ejecutar el Nuevo Schema

1. Ve a tu proyecto en Supabase
2. SQL Editor → New query
3. Copia TODO el contenido de `src/database/schema.sql`
4. Pega y ejecuta (Run)
5. ✅ Debería decir "Success"

## Paso 2: Ejecutar el Seed (Datos Iniciales)

1. En SQL Editor → New query
2. Copia TODO el contenido de `src/database/seed.sql`
3. **Verifica que el link esté correcto:**
   - Debe ser: `https://t.me/somosredjudicial`
   - Si tu grupo tiene un invite link diferente (tipo `https://t.me/+XXXXX`), reemplázalo
4. Pega y ejecuta (Run)
5. ✅ Debería insertar 1 grupo + 16 temas

## Paso 3: Verificar

Ejecuta esta query para verificar:

```sql
-- Ver el grupo principal
SELECT * FROM telegram_group;

-- Ver todos los temas
SELECT * FROM telegram_topics ORDER BY orden;
```

Deberías ver:
- 1 fila en `telegram_group`
- 16 filas en `telegram_topics`

## ✅ Listo!

Una vez hecho esto, el bot podrá:
- Mostrar los 16 temas
- Dar el link al grupo principal
- Registrar intereses de usuarios

---
_Última actualización: Grupo principal configurado como @somosredjudicial_
