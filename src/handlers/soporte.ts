import { CommandContext, Context } from 'grammy';

/**
 * Handler para el comando /soporte
 */
export async function handleSoporte(ctx: CommandContext<Context>): Promise<void> {
  try {
    const supportMessage = `
🆘 **Soporte y Ayuda**

Si tienes problemas o preguntas sobre Red Judicial:

📧 **Correo:** soporte@redjudicial.cl
💬 **Telegram:** @RedJudicialSoporte

**Comandos disponibles:**
• /start - Iniciar el bot y ver bienvenida
• /menu - Ver menú de especialidades
• /grupos - Lista completa de grupos con links
• /soporte - Esta información de ayuda

**Preguntas frecuentes:**

❓ *¿Cómo me uno a un grupo?*
Usa /menu para ver las especialidades y haz clic en la que te interese. El bot te enviará el link de invitación.

❓ *¿Puedo unirme a varios grupos?*
¡Claro! Puedes unirte a todos los grupos que quieras. Usa la opción "Carpeta" para verlos todos organizados.

❓ *¿Los grupos son gratuitos?*
Sí, todos los grupos de Red Judicial son completamente gratuitos.

❓ *¿Quién puede unirse?*
La comunidad está abierta a todos los abogados de Chile que quieran compartir conocimiento y aprender.

¿Necesitas más ayuda? Contáctanos por los medios indicados arriba. 👆
`;

    await ctx.reply(supportMessage, {
      parse_mode: 'Markdown',
    });

  } catch (error) {
    console.error('Error en handleSoporte:', error);
    await ctx.reply(
      '❌ Hubo un error al mostrar la información de soporte. Por favor intenta nuevamente.'
    );
  }
}

