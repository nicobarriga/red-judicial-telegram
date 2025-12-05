# Guía de Configuración de Telegram

Esta guía te llevará paso a paso por la creación del bot y los grupos de Telegram necesarios para Red Judicial.

## 📋 Tabla de Contenidos

1. [Crear el Bot](#1-crear-el-bot)
2. [Crear los Grupos](#2-crear-los-grupos)
3. [Crear la Carpeta Compartida](#3-crear-la-carpeta-compartida)
4. [Configurar el Bot como Admin](#4-configurar-el-bot-como-admin-opcional)

## 1. Crear el Bot

### Paso 1.1: Iniciar conversación con BotFather

1. Abre Telegram
2. Busca `@BotFather` (es el bot oficial de Telegram)
3. Inicia una conversación con `/start`

### Paso 1.2: Crear el bot

1. Envía el comando `/newbot`
2. BotFather te pedirá un nombre para tu bot:
   - Envía: `Red Judicial Bot`
3. BotFather te pedirá un username (debe terminar en 'bot'):
   - Envía: `RedJudicialBot` o el que prefieras
4. BotFather te responderá con:
   - El token de tu bot (guárdalo de forma segura)
   - Un link a tu bot: `t.me/RedJudicialBot`

### Paso 1.3: Configurar el bot

Envía estos comandos a BotFather para mejorar la experiencia:

```
/setdescription
Selecciona: @RedJudicialBot
Envía: Bot oficial de Red Judicial - Comunidad de abogados de Chile

/setabouttext
Selecciona: @RedJudicialBot
Envía: Únete a nuestra comunidad de abogados. Accede a 15 grupos temáticos sobre diferentes especialidades del derecho.

/setcommands
Selecciona: @RedJudicialBot
Envía:
start - Iniciar el bot
menu - Ver menú de especialidades
grupos - Lista de todos los grupos
soporte - Ayuda y soporte
```

## 2. Crear los Grupos

Necesitas crear 16 grupos en total: 1 Lobby + 15 grupos temáticos.

### Paso 2.1: Crear un grupo

1. En Telegram, toca el botón para crear nuevo chat
2. Selecciona "Nuevo Grupo"
3. Añade al menos un contacto inicialmente (puedes eliminarlo después)
4. Escribe el nombre del grupo (ver lista abajo)
5. Toca "Crear"

### Paso 2.2: Convertir a Supergrupo

**Muy importante**: Cada grupo debe ser un **supergrupo**.

1. Entra al grupo
2. Toca el nombre del grupo en la parte superior
3. Toca "Editar"
4. En ajustes, busca "Tipo de grupo"
5. Cambia a "Supergrupo"
6. Confirma

### Paso 2.3: Obtener el Invite Link

Para cada grupo:

1. Entra al grupo
2. Toca el nombre del grupo en la parte superior
3. Toca "Editar"
4. Busca "Link de invitación"
5. Si no existe, toca "Crear link de invitación"
6. El link se verá así: `https://t.me/+XXXXXXXXXX`
7. **Copia y guarda este link** - lo necesitarás para la base de datos

### Paso 2.4: Lista de grupos a crear

Crea estos 16 grupos exactamente con estos nombres:

#### Lobby
- **Nombre**: `Red Judicial – Lobby`
- **Descripción**: Bienvenida y anuncios generales de la comunidad

#### Grupos Temáticos (15)

1. **RJ – Civil**
   - Descripción: Derecho civil, contratos, responsabilidad civil, sucesiones

2. **RJ – Penal**
   - Descripción: Derecho penal, delitos, procedimiento penal

3. **RJ – Familia**
   - Descripción: Divorcio, pensiones, cuidado personal, adopción

4. **RJ – Laboral**
   - Descripción: Derecho laboral, despidos, finiquitos, acoso

5. **RJ – Tributario**
   - Descripción: Impuestos, SII, procedimientos tributarios

6. **RJ – Constitucional**
   - Descripción: Protección, inaplicabilidad, amparo

7. **RJ – Administrativo**
   - Descripción: Contratos públicos, responsabilidad del Estado

8. **RJ – Propiedad / Inmobiliario**
   - Descripción: Compraventas, arrendamientos, propiedad horizontal

9. **RJ – Consumidor**
   - Descripción: SERNAC, garantías, relaciones de consumo

10. **RJ – Ejecuciones / Cobranza**
    - Descripción: Juicios ejecutivos, embargos, apremio

11. **RJ – Comercial**
    - Descripción: Sociedades, quiebras, reorganización empresarial

12. **RJ – Libre Competencia**
    - Descripción: Colusión, abuso de posición dominante

13. **RJ – Ambiental**
    - Descripción: Evaluación de impacto, recursos naturales

14. **RJ – Penal Económico**
    - Descripción: Lavado de activos, cohecho, fraude

15. **RJ – Procesal**
    - Descripción: Recursos, nulidades, incidentes

### Paso 2.5: Organizar los links

Crea un documento temporal con este formato:

```
Lobby: https://t.me/+XXXXX_LOBBY
Civil: https://t.me/+XXXXX_CIVIL
Penal: https://t.me/+XXXXX_PENAL
...
```

Necesitarás estos links para actualizar el archivo `src/database/seed.sql`.

## 3. Crear la Carpeta Compartida

La carpeta permite a los usuarios ver todos los grupos organizados en una pestaña especial.

### En Telegram Desktop o Web

1. Ve a Ajustes → Carpetas
2. Toca "Crear carpeta nueva"
3. Nombra la carpeta: `Red Judicial`
4. Añade todos los grupos que creaste (Lobby + 15 grupos)
5. Toca "Crear"
6. En la lista de carpetas, toca los tres puntos `⋯` en la carpeta "Red Judicial"
7. Selecciona "Compartir carpeta"
8. Copia el link (se verá así: `https://t.me/addlist/XXXXX`)
9. Guarda este link - lo usarás en `FOLDER_INVITE_URL`

### En Telegram Móvil

1. Ve a Ajustes → Carpetas de Chat
2. Toca "Crear carpeta nueva"
3. Nombra la carpeta: `Red Judicial`
4. Añade los chats: toca "Añadir chats" y selecciona todos los grupos
5. Toca "Crear"
6. Toca la carpeta para editarla
7. Busca la opción "Compartir carpeta" o "Link de invitación"
8. Copia el link
9. Guarda este link

## 4. Configurar el Bot como Admin (Opcional)

Si quieres que el bot pueda enviar mensajes o moderar en el futuro:

1. Entra a cada grupo
2. Toca el nombre del grupo → Editar
3. Toca "Administradores"
4. Toca "Añadir administrador"
5. Busca y selecciona tu bot `@RedJudicialBot`
6. Configura los permisos que necesites
7. Guarda

**Nota**: Para la funcionalidad básica del bot (mostrar menús y links), esto no es necesario.

## 5. Crear Canal de Anuncios (Opcional)

Si quieres un canal solo para anuncios:

1. Crea un nuevo canal (no grupo)
2. Nómbralo: `Red Judicial – Anuncios`
3. Hazlo público o privado según prefieras
4. Agrega una descripción con el link al bot
5. Fija un mensaje explicando cómo usar el bot

## ✅ Checklist Final

Antes de proceder con el código, asegúrate de tener:

- [ ] Bot creado y `BOT_TOKEN` guardado
- [ ] 16 grupos creados (1 Lobby + 15 temáticos)
- [ ] Todos los grupos convertidos a supergrupos
- [ ] Los 16 invite links guardados
- [ ] Carpeta compartida creada con su link
- [ ] Todos los links organizados para actualizar `seed.sql`

## 🔄 Próximos Pasos

Una vez que tengas todo lo anterior:

1. Actualiza el archivo `src/database/seed.sql` con tus invite links reales
2. Ejecuta el schema y seed en Supabase
3. Configura las variables de entorno en `.env`
4. Inicia el servidor

## 💡 Tips

- **Guarda los invite links de forma segura**: Si pierdes un link, puedes crear uno nuevo en cualquier momento
- **Los links no expiran**: A menos que los elimines manualmente
- **Puedes regenerar links**: Si un link se compromete, puedes revocar el anterior y crear uno nuevo
- **Organiza bien desde el inicio**: Es más fácil configurar todo correctamente desde el principio que corregir después

## 🆘 Problemas Comunes

### "No puedo crear un supergrupo"

- Asegúrate de tener la última versión de Telegram
- Prueba desde Telegram Desktop si tienes problemas en móvil

### "No aparece la opción de crear link"

- Verifica que el grupo sea un supergrupo
- Asegúrate de ser administrador del grupo

### "La carpeta no se puede compartir"

- Esta función está disponible en Telegram Desktop/Web
- Si no aparece, actualiza tu versión de Telegram

## 📞 Soporte

Si tienes problemas con esta configuración, contacta a soporte@redjudicial.cl

