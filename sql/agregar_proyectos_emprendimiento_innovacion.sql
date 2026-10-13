-- DEMO MODE 2026 - Emprendimiento e Innovación
-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Solo agrega estos proyectos; no borra ni modifica los ya cargados.
-- Si se ejecuta otra vez, omite los proyectos cuyo nombre ya exista.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "categorias"
    WHERE "nombre" = 'Emprendimiento e Innovación'
  ) THEN
    RAISE EXCEPTION 'No existe la categoria requerida: Emprendimiento e Innovación';
  END IF;
END $$;

WITH categoria AS (
  SELECT "id"
  FROM "categorias"
  WHERE "nombre" = 'Emprendimiento e Innovación'
), nuevos_proyectos ("area", "nombre", "descripcion", "integrantesRaw", "numeroIntegrantes") AS (
  VALUES
    (
      'UTEC Ventures',
      'Viringo AI',
      'Cumplimiento tributario ante SUNAT operado por IA para pymes peruanas. Tu contador AI que te avisa antes de que preguntes, 24/7.',
      E'Ronaldo David Díaz Panduro',
      1
    ),
    (
      'UTEC Ventures',
      'Bildin',
      'Plataforma basada en la nube e inteligencia artificial para la gestión de recursos, control de mano de obra y medición de productividad en proyectos de construcción.',
      E'Alejandro Goicochea Hoefken',
      1
    ),
    (
      'UTEC Ventures',
      'NotaryOS',
      'La notaría entera, en un solo sistema. Sistema operativo notarial con 31 tipos de trámite, consultas automáticas a SUNARP y RENIEC, y documentos generados con las plantillas de su propia notaría.',
      E'Gian Piero Davila Ramos',
      1
    ),
    (
      'UTEC Ventures',
      'NOS',
      'Plataforma financiera digital para organizaciones y asociaciones productivas.',
      E'Gian Franco Davila Ramos',
      1
    ),
    (
      'UTEC Ventures',
      'Proyecto de Monitoreo Inteligente para construcción',
      'Monitoreo inteligente de la producción en construcción: IA y Computer Vision aplicados en obra.',
      E'William Eduardo Yalico Arango',
      1
    ),
    (
      'Posgrado_Tech MBA',
      'CORA',
      'CORA es una Plataforma Financiera Productiva con el propósito de contribuir con el bienestar, crecimiento y prosperidad de las MYPES y las familias que las conforman, a través del financiamiento, desarrollo de capacidades, formación de buenos hábitos para la salud financiera, escalamiento de operaciones e inclusión financiera.',
      E'Miguel Vargas Ascenzo\nAndrea Daniela Castro Robles\nAna Luisa Johnson López',
      3
    ),
    (
      'Posgrado_Tech MBA',
      'ELADIA',
      'Eladia es un asistente virtual con inteligencia artificial para optimizar la gestión de proyectos en el sector inmobiliario, con un enfoque inicial en el rubro de la construcción y el diseño arquitectónico. Integrado en WhatsApp, se conecta con herramientas como Excel, mejorando la coordinación, seguimiento de tareas y comunicación en tiempo real.',
      E'Jose Nikolas Carpio Comitre\nElizabeth María Gayoso Velásquez\nYeni Rocio Villanueva Paredes',
      3
    ),
    (
      'Posgrado_Tech MBA',
      'Elige +',
      'ELIGE+ es una solución tecnológica orientada a mejorar la forma en que actualmente se realiza la compra de deuda vehicular en el sistema financiero peruano.',
      E'Ayrton André Mercado Davila\nAlejandro Mateo Ruiz Torres\nMarcela Juana Aparicio Molero',
      3
    ),
    (
      'Posgrado_Tech MBA',
      'Mi Voz',
      'Plataforma digital que conecta el hogar con la terapia para niños con autismo en tiempo real, automatizando rutinas visuales en 34 segundos y transformando el comportamiento diario en data clínica accionable mediante IA multimodal.',
      E'Maria Andrea De Vinatea Muñoz-Najar\nMirelli Pajares Rodriguez\nVictor Manuel Amaya Portocarrero',
      3
    )
)
INSERT INTO "proyectos" (
  "nombre",
  "area",
  "descripcion",
  "integrantesRaw",
  "numeroIntegrantes",
  "categoriaId",
  "createdAt",
  "updatedAt"
)
SELECT
  nuevos_proyectos."nombre",
  nuevos_proyectos."area",
  nuevos_proyectos."descripcion",
  nuevos_proyectos."integrantesRaw",
  nuevos_proyectos."numeroIntegrantes",
  categoria."id",
  NOW(),
  NOW()
FROM nuevos_proyectos
CROSS JOIN categoria
WHERE NOT EXISTS (
  SELECT 1
  FROM "proyectos" existente
  WHERE existente."nombre" = nuevos_proyectos."nombre"
);

COMMIT;
