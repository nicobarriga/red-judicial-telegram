-- Migración: agregar campos de onboarding y perfil a telegram_users
-- Ejecutar en Supabase SQL Editor (una sola vez).

ALTER TABLE telegram_users
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_lawyer BOOLEAN,
  ADD COLUMN IF NOT EXISTS profession_or_study TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_phone_number ON telegram_users(phone_number);


