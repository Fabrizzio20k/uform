-- DEMO MODE 2026 - Proyectos finales de carrera
-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Solo agrega estos proyectos; no borra ni modifica los ya cargados.
-- Si se ejecuta otra vez, omite los proyectos cuyo nombre ya exista.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "categorias"
    WHERE "nombre" = 'Proyectos finales de carrera'
  ) THEN
    RAISE EXCEPTION 'No existe la categoria requerida: Proyectos finales de carrera';
  END IF;
END $$;

WITH categoria AS (
  SELECT "id"
  FROM "categorias"
  WHERE "nombre" = 'Proyectos finales de carrera'
), nuevos_proyectos ("area", "nombre", "descripcion", "integrantesRaw", "numeroIntegrantes") AS (
  VALUES
    (
      'Administración y Negocios Digitales',
      'Predictable.ai',
      'Predictable.ai: Es el primer Revenue OS de LATAM. Es una plataforma AI-Native para generar leads B2B con intervención humana estratégica, no operativa. Da inteligencia de mercado, la traduce en un plan de prospección y el AI recuerda toda la información para darte asesoría en vivo durante las llamadas de venta; dejando un reporte con métricas clave para el monitoreo y seguimiento.',
      E'Van Oordt Arbulu Aaron Carlo\nDel Negro Yabar Giuseppe Antonio',
      2
    ),
    (
      'Ingeniería Industrial',
      'Decisiones secuenciales para la asignación comercial de productos frescos en exportación: un sistema de apoyo a la toma de decisiones en la ejecución de la campaña de cosecha',
      'Sistema de apoyo a decisiones que integra modelos de optimización para replanificar la asignación comercial y ejecutar diariamente el plan de exportación de productos frescos, adaptándose a cambios en disponibilidad, demanda y condiciones operativas para mejorar el cumplimiento del plan comercial y la rentabilidad.',
      E'Imanol Felix Supo Mamani\nAbel Jaime Rivera Olaza',
      2
    ),
    (
      'Ciencia de Datos e Inteligencia Artificial',
      'Topology-Aware Spatiotemporal Crime Hotspot Detection on Street Networks',
      'Pipeline reproducible que proyecta cada crimen a los nodos de la red vial, calcula un campo de densidad gaussiano geodésico por mes y extrae los top-K subgrafos mediante join tree y persistencia topológica. Construye embeddings de cada subgrafo y los proyecta con UMAP para agruparlos por similitud, permitiendo contrastar la composición de POIs de zonas similares frente a su intensidad delictiva.',
      E'César Eduardo Pajuelo Reyes',
      1
    ),
    (
      'Ciencia de la Computación',
      'Moving Gaussians',
      'Siempre vemos al video como una secuencia de imágenes. Y si lo imagináramos como algo continuo? Esta representación permite eso. Permite "predecir" algunos segundos de video, permite restaurar videos rotos, y abre la puerta para explorar técnicas de compresión de video.',
      E'Jose Leandro Machaca Soloaga\nMauro Bobadilla C.',
      2
    ),
    (
      'Sistemas de Información',
      'App para planificación inteligente de eventos, gestión en tiempo real y preservación digital de recuerdos audiovisuales, integrada con IA predictiva y enfoque de interacción social',
      'Se diseñó e implementó un recomendador conversacional basado en LLM para facilitar la búsqueda de proveedores en un marketplace de servicios para eventos. El sistema recopila las necesidades del usuario, mantiene un plan persistente y genera recomendaciones fundamentadas en datos reales mediante APIs e índices semánticos. Su evaluación en 150 conversaciones alcanzó un 88,67 % de finalización técnica, 98,15 % de extracción de necesidades y 100 % de consistencia en las categorías recomendadas. Los resultados validan la arquitectura propuesta e identifican la calidad de recuperación y la integridad de los datos de proveedores como principales oportunidades de mejora.',
      E'Leonardo Matias Candio Ormeño',
      1
    ),
    (
      'Bioingeniería',
      'Diseño computacional de un constructo vacunal multiepítopo contra Helicobacter pylori desarrollada en el contexto peruano',
      'Desarrollo computacional de un candidato vacunal multiepítopo contra Helicobacter pylori, adaptado al contexto genético de la población peruana. Se analizaron 27 cepas peruanas y 51 cepas de referencia globales para caracterizar la variabilidad genética de ocho factores de virulencia y generar secuencias consenso. Mediante herramientas de inmunoinformática, se identificaron y seleccionaron 16 epítopos con características favorables de antigenicidad, conservación, seguridad y cobertura poblacional, alcanzando una cobertura estimada de 99,93 % para Perú. Finalmente, se construyó y validó computacionalmente el candidato vacunal, que mostró adecuada solubilidad y estabilidad estructural, además de una alta afinidad de interacción con TLR4.',
      E'Aixa Ximena Torres Fuertes\nFiorella Falcón Paredes\nRodrigo Romero Tello',
      3
    ),
    (
      'Ingeniería Química',
      'Diseño de una planta de producción de polietileno verde de alta densidad a partir de bioetanol en el Perú',
      'El proyecto aborda la necesidad de desarrollar alternativas más sostenibles frente a la producción convencional de polietileno, altamente dependiente de materias primas fósiles y asociada a elevadas emisiones de gases de efecto invernadero. En este contexto, se propone el diseño de una planta de producción de polietileno verde de alta densidad a partir de bioetanol en el Perú. Para ello, se integra la producción de bioetileno mediante deshidratación catalítica de bioetanol y su posterior polimerización para obtener diferentes grados de HDPE, evaluando su viabilidad técnica, económica, ambiental y de seguridad.',
      E'Adriana Castilla Aguirre\nAndre Rodrigo Aldasabal Arias\nFabiana Carmen Strobbe Vargas',
      3
    ),
    (
      'Ingeniería Civil',
      'Diseño y caracterización de concretos de ultra alto desempeño para la construcción y reparación de infraestructuras',
      'El proyecto consiste en el diseño y la caracterización de un concreto especial de alto desempeño, conocido como concreto de ultra alto desempeño (UHPC, por sus siglas en inglés), fabricado a partir de materiales disponibles localmente. Este material se distingue por presentar una resistencia a la compresión hasta seis veces superior a la de un concreto convencional, además de una elevada fluidez en estado fresco que le confiere excelente trabajabilidad y capacidad de autocompactación, propiedades que permiten su aplicación en elementos estructurales esbeltos, en refuerzos y reparaciones de infraestructuras existentes, y en construcciones expuestas a condiciones ambientales severas o cargas elevadas, donde se requiere mayor durabilidad y una reducción significativa de las dimensiones de los elementos estructurales. Para el diseño de las mezclas se desarrolló una aplicación computacional en lenguaje Python, basada en el modelo teórico de empaquetamiento de partículas de Andreasen y Andersen modificado, la cual permite optimizar la proporción de los materiales granulares (cemento, humo de sílice, arena de sílice y carbonato de calcio) con el fin de minimizar la porosidad de la matriz y maximizar la compacidad del sistema, agilizando el proceso iterativo de dosificación y facilitando el ajuste de las curvas granulométricas al modelo teórico de referencia. Este enfoque, complementado con el uso de aditivos superplastificantes de última generación, posibilita la obtención de mezclas con muy baja relación agua/cemento y alta densidad, lo que se traduce en una microestructura más compacta y en las elevadas prestaciones mecánicas características del UHPC.',
      E'Wilder David Salvador Tanta\nKevin Heymer Núñez Flores',
      2
    ),
    (
      'Ingeniería de la Energía',
      'Diseño de un sistema de control y supervisión basando en la tecnología T500 para la automatización de una subestación',
      'Configuración de la plataforma de Hardward y Software de la tecnología T500 para la automatización de los dispositivos de una subestación eléctrica. Con la asesoría de la empresa Schneider Electric.',
      E'Evelyn Clara Sarmiento Zubilete\nAndrés Ricasca Jara\nPiero Peña Flores',
      3
    ),
    (
      'Ingeniería de la Mecánica',
      'Diseño y desarrollo de un prototipo funcional de un mecanismo robótico para asistir a la terapia de estimulación táctil en neonatos.',
      'El proyecto consiste en el desarrollo de un mecanismo robótico compacto destinado a reproducir de manera controlada los movimientos requeridos durante la terapia de estimulación táctil neonatal. El prototipo integra un mecanismo de desplazamiento longitudinal de doble paralelogramo, un mecanismo radial basado en un Centro Remoto de Movimiento (RCM) con eslabones tipo tijera y un efector final blando para la interacción con el paciente. El sistema busca generar trayectorias repetibles sobre el torso neonatal manteniendo condiciones seguras de movimiento y contacto.',
      E'Parwa Alexandra Alagon Aguilar\nEnzo Coronado Salcedo',
      2
    ),
    (
      'Ingeniería de la Electrónica',
      'Desarrollo de un Sistema de Detección de Anomalías en Procesos Industriales de Formado de Alimentos en Edge Computing',
      'El sistema monitorea un proceso secuencial de formado de alimentos controlado por un PLC Siemens S7-1200, adquiriendo de forma no intrusiva 26 señales del proceso. Un modelo de aprendizaje no supervisado, embebido en un FPGA sobre plataforma Zynq-7000, procesa las señales localmente y detecta desviaciones respecto al comportamiento normal sin necesidad de enviar datos a la nube. Cuando se detecta una anomalía, el sistema la identifica así como la señal más afectada y la reporta en un dashboard web.',
      E'Sebastian Tabraj Morales\nVíctor Agustín Huanca Salcedo\nYulinio Zavala Mariño',
      3
    ),
    (
      'Ingeniería de la Mecatrónica',
      'Diseño e implementación de un vehículo submarino operado remotamente (ROV) para la detección de botellas plásticas y monitoreo en un entorno acuático',
      'Es un Vehículo Submarino Operado Remotamente (ROV) de clase observación diseñado para el monitoreo de ecosistemas acuáticos. El sistema integra procesamiento en el borde (Edge AI) mediante una Raspberry Pi 5 y un controlador Pixhawk, permitiendo la detección autónoma de plásticos submarinos en tiempo real mediante visión computacional.',
      E'Diago Jhosua Tucto Enriquez\nDiego Raul Lopez Marino\nYerson Andre Ramos Padin',
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
