-- DEMO MODE 2026 - Innovación Académica e Investigación
-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Solo agrega estos proyectos; no borra ni modifica los ya cargados.
-- Si se ejecuta otra vez, omite los proyectos cuyo nombre ya exista.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "categorias"
    WHERE "nombre" = 'Innovación Académica e Investigación'
  ) THEN
    RAISE EXCEPTION 'No existe la categoria requerida: Innovación Académica e Investigación';
  END IF;
END $$;

WITH categoria AS (
  SELECT "id"
  FROM "categorias"
  WHERE "nombre" = 'Innovación Académica e Investigación'
), nuevos_proyectos ("area", "nombre", "descripcion", "integrantesRaw", "numeroIntegrantes") AS (
  VALUES
    (
      'Dirección de Investigación',
      'Catalogación de obras de arte y adecuación del depósito del Monasterio de Santa Teresa de Ayacucho',
      'Fortalecer la protección, conservación y puesta en valor de la colección mediante su inventario y catalogación, el desarrollo de estrategias de conservación preventiva y gestión de riesgos, y la adecuación de su área de depósito, considerando los riesgos asociados al cambio climático.',
      E'Giancarlo Kaqui Valenzuela\nCarlos Raith Bravo Valdivia\nSergio Ramón Cortez De la Cruz',
      3
    ),
    (
      'Dirección de Investigación',
      'Contrato N° PE501082689-2023PROCIENCIA_AIRE: "ContAmInación atmosféRica en cErros poblados"',
      'Estudiar la relación que existe entre patrones urbanísticos, vegetación, calidad de aire de nivel de peatón y percepción social en 4 cerros poblados en la ciudad de Lima (2) y de Cusco (2) mediante la realización de un estudio paramétrico computacional en el modelo EnviMET, en el cual se modificarán las características topológicas del patrón urbano a simular, altura de edificaciones, tipo de vegetación, tipo de implementación de vegetación y condiciones climáticas, y mediante estudios sociales en campo de la psicología ambiental sobre riesgo social-ambiental en las zonas de estudio y su relación con la vegetación como posible propuesta a la problemática de calidad de aire.',
      E'Marian Montalvo Poblete',
      1
    ),
    (
      'Dirección de Investigación',
      'Exoflex: Exoesqueleto robótico flexible para recién nacidos',
      'El proyecto resuelve la falta de acceso a terapias físicas tempranas para recién nacidos con mielomeningocele en el Perú mediante la automatización de su rehabilitación. Para lograrlo, se desarrolló un exoesqueleto robótico pediátrico con actuadores blandos que ejecuta movimientos terapéuticos seguros en el infante; adaptándose automáticamente al paciente para brindar una terapia suave, libre de tirones y sin requerir recalibraciones manuales, ofreciendo así una solución segura y accesible frente a la escasez de personal médico especializado.',
      E'Gonzalo Alonso Lopez Ttito',
      1
    ),
    (
      'Posgrado',
      'FreeWheels, un sistema modular con inteligencia artificial que permite desplazarse sin usar las manos.',
      'Desarrolla un sistema asistencial para controlar una silla de ruedas eléctrica sin utilizar las manos, mediante la inclinación del tronco y comandos alternativos. La propuesta busca mejorar la autonomía de las personas usuarias y facilitar su participación en actividades deportivas y de movilidad adaptada.',
      E'Carlos Felipe Felix Palomino\nDavid Perceo Caballero Cano',
      2
    ),
    (
      'Posgrado',
      'GeoMinder',
      'Sistema agéntico con filtrado dinámico de metadatos para la recuperación de información técnica en corpus a gran escala en Ingeniería aplicada.',
      E'Sebastian Lopez Medina\nBrajan Esteban Nieto Espinoza\nMateo Tapia Chasquibol',
      3
    ),
    (
      'Posgrado',
      'Activación de Lecciones Aprendidas mediante IA Generativa en Proyectos de Ingeniería',
      'Un ecosistema con inteligencia artificial generativa para recuperar y aplicar lecciones aprendidas en proyectos de ingeniería. La solución busca reducir el tiempo perdido en búsquedas, evitar la repetición de errores y mejorar la toma de decisiones mediante consultas rápidas e integración con Microsoft Teams.',
      E'Antonio Alejandro Cumpa Barreto\nMiguel Angel Chero Huamaní',
      2
    ),
    (
      'Asociaciones Estudiantiles',
      'Prótesis mecánica para amputación transradial basada en sistemas de 4 barras.',
      'Desarrollo de una prótesis Bionica de bajo costo en base a impresión 3D y sistemas de movimiento de barras qué pueda emular los movimientos característicos de la mano y antebrazo para el tratamiento de pacientes con amputación transradial.',
      E'Santiago Alonso González Castillo\nMarcelo Daniel Rodriguez Fernández\nJohan Grober Bravo Sanchez\nRodolfo Guillermo Yauri Condo\nRoger Adilson Pimentel Pedraza\nDominic Estiven Sisaya Sisaya\nAngel Vasquez',
      7
    ),
    (
      'Asociaciones Estudiantiles',
      'OHM Formula Racing',
      'OHM Formula Racing es el equipo estudiantil de Fórmula SAE de UTEC que diseña, fabrica y compite con monoplazas de competencia bajo el reglamento internacional Formula SAE. El equipo articula cinco áreas técnicas —Dinámica Vehicular, Estructura, Potencia, Electrónica y Operaciones— con procesos validados mediante simulación CAD/CFD/FEA y asesoría académica especializada. Como evidencia de avance, en la temporada 2025 diseñamos, fabricamos y validamos nuestro primer prototipo funcional v1, y actualmente estamos enfocados en la construcción de nuestro nuevo vehículo v2 que representará a la UTEC en la Formula SAE Brasil 2027.',
      E'Diego Alonso Munayco Pacheco\nEmilio Pareja Flor\nRaid Alonso Portocarrero Choque\nDavid Perceo Caballero Cano\nMiguel Ángel Aronés Escobar\nJosé Andrés Casas Tarazona',
      6
    ),
    (
      'Asociaciones Estudiantiles',
      'Nazca Racing',
      'Es un equipo estudiantil de Fórmula SAE de UTEC.',
      E'Miguel Antonio Arminta Maza',
      1
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
