-- Red Judicial Telegram Bot - Esquema de Base de Datos

-- Tabla del grupo principal de Telegram
CREATE TABLE IF NOT EXISTS telegram_group (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL DEFAULT 'Red Judicial',
  invite_link TEXT NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de temas dentro del grupo principal
CREATE TABLE IF NOT EXISTS telegram_topics (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  orden INTEGER NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de usuarios de Telegram
CREATE TABLE IF NOT EXISTS telegram_users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  joined_at TIMESTAMP DEFAULT NOW(),
  origen TEXT NOT NULL DEFAULT 'direct_bot'
);

-- Tabla de intereses en temas (métricas)
CREATE TABLE IF NOT EXISTS user_topic_interest (
  id SERIAL PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL REFERENCES telegram_users(telegram_id),
  topic_slug TEXT NOT NULL,
  clicked_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_user_topic_interest 
ON user_topic_interest(telegram_user_id, topic_slug);

-- Índice para búsquedas por slug
CREATE INDEX IF NOT EXISTS idx_topic_slug 
ON telegram_topics(slug);

-- Índice para usuarios por telegram_id
CREATE INDEX IF NOT EXISTS idx_telegram_id 
ON telegram_users(telegram_id);

-- Comentarios para documentación
COMMENT ON TABLE telegram_group IS 'Grupo principal de Red Judicial con temas organizados';
COMMENT ON TABLE telegram_topics IS 'Temas/especialidades dentro del grupo principal';
COMMENT ON TABLE telegram_users IS 'Usuarios que han interactuado con el bot';
COMMENT ON TABLE user_topic_interest IS 'Registro de intereses en temas para métricas';

