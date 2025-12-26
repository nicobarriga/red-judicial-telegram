-- Agrega el tema "Derecho Migratorio" si no existe (idempotente)

insert into public.telegram_topics (slug, titulo, descripcion, orden, activo)
values (
  'migratorio',
  'Derecho Migratorio',
  'Residencia, visas, nacionalidad, expulsiones y procedimientos migratorios',
  12,
  true
)
on conflict (slug) do nothing;

-- Reordenar "orden" de temas posteriores si ya existían con 12+
-- (Opcional) Solo ajusta si el orden actual choca; no cambia slugs ni títulos.
update public.telegram_topics
set orden = orden + 1
where slug in ('insolvencia','ambiental','legal_tech','oportunidades','jurisprudencia','estudiantes')
  and orden >= 12
  and slug <> 'migratorio';


