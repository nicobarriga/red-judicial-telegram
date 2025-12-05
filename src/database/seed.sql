-- Datos iniciales para el grupo principal
-- ✅ CONFIGURADO: Grupo principal @somosredjudicial

INSERT INTO telegram_group (nombre, invite_link, descripcion, activo) VALUES
('Red Judicial', 'https://t.me/somosredjudicial', 'Comunidad de abogados de Chile con temas organizados por especialidad', true)
ON CONFLICT DO NOTHING;

-- Datos iniciales para los temas dentro del grupo
-- ✅ ACTUALIZADO: 15 temas sin "General" (eliminado)

INSERT INTO telegram_topics (slug, titulo, descripcion, orden, activo) VALUES
('civil', 'Derecho Civil', 'Discusiones sobre derecho civil, contratos, responsabilidad civil, sucesiones y más', 1, true),
('penal', 'Derecho Penal', 'Temas de derecho penal, delitos, procedimiento penal y jurisprudencia criminal', 2, true),
('familia', 'Derecho de Familia', 'Derecho de familia: divorcio, pensiones alimenticias, cuidado personal, adopción', 3, true),
('laboral', 'Derecho Laboral', 'Derecho laboral, despidos, finiquitos, acoso laboral y relaciones individuales/colectivas', 4, true),
('tributario', 'Derecho Tributario', 'Derecho tributario, impuestos, fiscalización del SII y procedimientos tributarios', 5, true),
('constitucional', 'Derecho Constitucional', 'Derecho constitucional, acciones de protección, inaplicabilidad y recursos de amparo', 6, true),
('administrativo', 'Derecho Administrativo', 'Derecho administrativo, contratos públicos, responsabilidad del Estado y procedimientos', 7, true),
('inmobiliario', 'Derecho Inmobiliario', 'Derecho inmobiliario, compraventas, arrendamientos, propiedad horizontal y regularización', 8, true),
('jpl', 'JPL', 'Juzgados de Policía Local: infracciones de tránsito, contravenciones y procedimientos', 9, true),
('propiedad_intelectual', 'Propiedad Intelectual', 'Patentes, marcas, derechos de autor, propiedad industrial y competencia desleal', 10, true),
('comercial', 'Derecho Comercial', 'Derecho comercial, sociedades, mercado de valores y operaciones mercantiles', 11, true),
('insolvencia', 'Insolvencia y Reemprendimiento', 'Quiebras, reorganización empresarial, ley de insolvencia y reemprendimiento', 12, true),
('ambiental', 'Derecho Ambiental y Minero', 'Derecho ambiental, evaluación de impacto, recursos naturales, minería y sanciones ambientales', 13, true),
('legal_tech', 'Legal Tech', 'Tecnología aplicada al derecho, automatización, IA legal, herramientas y transformación digital', 14, true),
('oportunidades', 'Oportunidades Laborales', 'Ofertas de trabajo, pasantías, colaboraciones profesionales y networking laboral', 15, true)
ON CONFLICT (slug) DO NOTHING;

