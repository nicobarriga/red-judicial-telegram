export function getRegistroWebAppHtml(params: { botUsername?: string }): string {
  const botUsername = params.botUsername || '';

  // Nota: este HTML se sirve desde Express. No depende de archivos estáticos.
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Registro - Red Judicial</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
      :root {
        --bg: #0f172a;
        --card: rgba(255,255,255,0.06);
        --text: rgba(255,255,255,0.92);
        --muted: rgba(255,255,255,0.72);
        --border: rgba(255,255,255,0.14);
        --danger: #ef4444;
      }
      html, body { height: 100%; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        background: var(--bg);
        color: var(--text);
      }
      .wrap { padding: 16px; max-width: 720px; margin: 0 auto; }
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        backdrop-filter: blur(10px);
      }
      h1 { font-size: 18px; margin: 0 0 6px; }
      p { margin: 0 0 12px; color: var(--muted); line-height: 1.35; }
      .row { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 12px; }
      label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
      input, select, textarea {
        width: 100%;
        box-sizing: border-box;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: rgba(0,0,0,0.2);
        color: var(--text);
        padding: 12px 12px;
        outline: none;
        font-size: 15px;
      }
      input::placeholder { color: rgba(255,255,255,0.4); }
      .hint { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 6px; }
      .error { font-size: 13px; color: var(--danger); margin-top: 10px; display: none; }
      .footer { margin-top: 14px; font-size: 12px; color: rgba(255,255,255,0.65); }
      .pill {
        display: inline-block;
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        margin-bottom: 10px;
      }
      .hidden { display: none; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="pill">Registro (1 minuto)</div>
        <h1>Red Judicial</h1>
        <p>
          Registro para acceso a la comunidad privada. Uso de datos: acceso y soporte. Sin spam.
        </p>

        <div class="row">
          <div>
            <label for="firstName">Nombre</label>
            <input id="firstName" placeholder="Matías" autocomplete="given-name" />
          </div>
          <div>
            <label for="lastName">Apellido(s)</label>
            <input id="lastName" placeholder="Arellano" autocomplete="family-name" />
          </div>
          <div>
            <label for="role">Perfil</label>
            <select id="role">
              <option value="lawyer">Abogado/a</option>
              <option value="student">Estudiante de Derecho</option>
              <option value="related">Otro</option>
            </select>
          </div>
          <div id="professionWrap" class="hidden">
            <label for="professionOrStudy">¿Cuál? (profesión/área)</label>
            <input id="professionOrStudy" placeholder="Ej: Administración pública" />
          </div>
          <div>
            <label for="email">Correo</label>
            <input id="email" placeholder="matias@email.com" autocomplete="email" inputmode="email" />
          </div>
          <div>
            <label for="phone">Teléfono (obligatorio)</label>
            <input id="phone" placeholder="+56 9 1234 5678" autocomplete="tel" inputmode="tel" />
            <div class="hint">Incluye código de país si corresponde (ej: +56).</div>
          </div>
        </div>

        <div id="err" class="error"></div>
        <div class="footer">
          Al enviar, aceptas su uso solo para acceso y soporte de la comunidad.
        </div>
      </div>
    </div>

    <script>
      (function () {
        const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
        if (tg) {
          tg.ready();
          tg.expand();
          tg.MainButton.setText('Enviar registro');
          tg.MainButton.show();
        }

        const $ = (id) => document.getElementById(id);
        const err = $('err');

        const role = $('role');
        const professionWrap = $('professionWrap');
        role.addEventListener('change', () => {
          const v = role.value;
          professionWrap.classList.toggle('hidden', v !== 'related');
        });

        function showError(message) {
          err.textContent = message;
          err.style.display = 'block';
        }
        function clearError() {
          err.textContent = '';
          err.style.display = 'none';
        }

        function isEmail(s) {
          return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(s || '').trim());
        }

        function normalizePhone(s) {
          return String(s || '').trim().replace(/\\s+/g, ' ');
        }

        function buildPayload() {
          const firstName = String($('firstName').value || '').trim();
          const lastName = String($('lastName').value || '').trim();
          const email = String($('email').value || '').trim().toLowerCase();
          const phone = normalizePhone($('phone').value);
          const r = role.value;
          const professionOrStudy = String($('professionOrStudy').value || '').trim();

          if (firstName.length < 2) throw new Error('Ingresa tu nombre completo.');
          if (lastName.length < 2) throw new Error('Ingresa tu(s) apellido(s).');
          if (!isEmail(email)) throw new Error('Ingresa un correo válido.');
          if (phone.length < 6) throw new Error('Ingresa un teléfono válido.');
          if (r === 'related' && professionOrStudy.length < 2) throw new Error('Indica tu profesión/área.');

          return { firstName, lastName, role: r, email, phoneNumber: phone, professionOrStudy: professionOrStudy || null };
        }

        function send() {
          clearError();
          if (!tg) {
            showError('Este formulario debe abrirse desde Telegram.');
            return;
          }
          let payload;
          try {
            payload = buildPayload();
          } catch (e) {
            showError(e.message || 'Revisa los datos e intenta nuevamente.');
            return;
          }

          const data = {
            initData: tg.initData || '',
            payload: payload,
            bot: ${JSON.stringify(botUsername)}
          };

          try {
            // 1) Intento estándar: sendData al bot (puede fallar/silenciarse en algunos clientes)
            try { tg.sendData(JSON.stringify(data)); } catch (_) {}

            // 2) Fallback robusto: POST al backend (mismo dominio) para persistir sí o sí
            fetch('/webapp/registro/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData: data.initData, payload: data.payload }),
            })
              .then(r => r.json().catch(() => ({})))
              .then((j) => {
                if (j && j.ok) {
                  // En algunos clientes tg.close() puede ser sensible al timing.
                  // Hacemos cierre robusto: alert + doble intento + fallback window.close().
                  if (tg.showAlert) tg.showAlert('✅ Listo. Volviendo al chat…');
                  try { tg.MainButton.hide(); } catch (_) {}
                  setTimeout(() => { try { tg.close(); } catch (_) {} }, 700);
                  setTimeout(() => { try { tg.close(); } catch (_) {} }, 1400);
                  setTimeout(() => { try { window.close(); } catch (_) {} }, 1700);
                } else {
                  showError('No se pudo guardar el registro. Intenta nuevamente.');
                }
              })
              .catch(() => showError('No se pudo guardar el registro. Intenta nuevamente.'));
          } catch (e) {
            showError('No se pudo enviar el registro. Intenta nuevamente.');
          }
        }

        if (tg) {
          tg.MainButton.onClick(send);
        }
      })();
    </script>
  </body>
</html>`;
}


