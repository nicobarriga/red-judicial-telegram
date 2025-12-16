import crypto from 'crypto';

export type TelegramWebAppUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export type TelegramWebAppInitData = {
  query_id?: string;
  user?: TelegramWebAppUser;
  auth_date?: number;
  hash?: string;
  [key: string]: unknown;
};

function parseInitData(initData: string): Record<string, string> {
  const params = new URLSearchParams(initData);
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

function buildDataCheckString(data: Record<string, string>): string {
  return Object.keys(data)
    .filter((k) => k !== 'hash')
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');
}

/**
 * Verifica initData de Telegram Web Apps (HMAC).
 * Ref: https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function verifyTelegramWebAppInitData(args: {
  initData: string;
  botToken: string;
  maxAgeSeconds?: number;
}): { ok: true; data: TelegramWebAppInitData } | { ok: false; reason: string } {
  const { initData, botToken, maxAgeSeconds = 24 * 60 * 60 } = args;
  if (!initData) return { ok: false, reason: 'initData vacío' };

  const parsed = parseInitData(initData);
  const hash = parsed.hash;
  if (!hash) return { ok: false, reason: 'hash ausente' };

  const dataCheckString = buildDataCheckString(parsed);

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash !== hash) return { ok: false, reason: 'hash inválido' };

  let data: TelegramWebAppInitData = {};
  try {
    if (parsed.user) data.user = JSON.parse(parsed.user);
  } catch {
    return { ok: false, reason: 'user inválido en initData' };
  }

  if (parsed.query_id) data.query_id = parsed.query_id;
  if (parsed.auth_date) data.auth_date = Number(parsed.auth_date);
  data.hash = hash;

  if (data.auth_date && maxAgeSeconds > 0) {
    const now = Math.floor(Date.now() / 1000);
    if (now - data.auth_date > maxAgeSeconds) return { ok: false, reason: 'initData expirado' };
  }

  return { ok: true, data };
}


