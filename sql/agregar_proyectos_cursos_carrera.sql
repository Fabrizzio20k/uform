-- DEMO MODE 2026 - Cursos de carrera
-- Ejecutar manualmente en el SQL Editor de Supabase DESPUES del script de PI.
-- Solo agrega estos proyectos: no borra ni modifica datos existentes.
-- Si se ejecuta otra vez, omite los proyectos cuyo nombre ya exista en la categoria.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "categorias"
    WHERE "nombre" = 'Cursos de carrera'
  ) THEN
    RAISE EXCEPTION 'No existe la categoria requerida: Cursos de carrera';
  END IF;
END $$;

WITH categoria AS (
  SELECT "id"
  FROM "categorias"
  WHERE "nombre" = 'Cursos de carrera'
), nuevos_proyectos ("area", "nombre", "descripcion", "integrantesRaw", "numeroIntegrantes") AS (
  VALUES
    (
      'Administración y Negocios Digitales',
      'DASH',
      'El proyecto resuelve el problema para los universitarios de zonas con alta concentración de universidades en Lima — como los alrededores de la UTEC, San Marcos, UNI o UPC — que no tienen una forma rápida de conectar con negocios locales cercanos (restaurantes, tiendas, eventos, almacenes) que necesitan apoyo laboral puntual de 1 a 2 días, lo que provoca que desperdicien sus días libres sin generar ingresos ni experiencia, mientras esos negocios pierden ventas o productividad por falta de personal temporal.',
      E'Eurymar De Los Angeles Umbria Salas\nDayra Alejandra Barboza Usco',
      2
    ),
    (
      'Ingeniería Industrial',
      'Optimización de la programación de órdenes en un laboratorio geoquímico mediante Iterated Tabu Search.pdf',
      'El proyecto plantea y resuelve una versión formal del problema de programación de órdenes del laboratorio, con el objetivo de minimizar el tiempo promedio de finalización de las órdenes, respetando las rutas de tareas de cada esquema de análisis y las capacidades de los recursos compartidos. Para ello se desarrolló un método metaheurístico llamado Iterated Tabu Search (ITS), que combina: (i) GRASP, para construir soluciones iniciales diversas a partir de distintos criterios de prioridad; (ii) una Búsqueda Tabú (Tabu Search) con una vecindad crítica de movimientos INSERT y SWAP, memoria de corto plazo (lista tabú con tenencia dinámica) y criterio de aspiración; y (iii) un esquema ILS (Iterated Local Search) con diversificación mediante el operador double-bridge, que permite escapar de óptimos locales y explorar regiones distintas del espacio de soluciones.',
      E'Kiara Paola Valencia Trujillo\nCarlos Alberto Ramos Caceres\nAnais Esmeralda Estefania Veliz Quispe',
      3
    ),
    (
      'Ciencia de Datos e Inteligencia Artificial',
      'Dermis - Tu piel, nuestra ciencia',
      'Dermis utiliza algoritmos de Inteligencia Artificial para analizar tu piel y ofrecerte una rutina de cuidado personalizada, basándose en tu tipo de piel y condiciones. Cada producto recomendado contiene ingredientes activos y compatibles con tus necesidades específicas. Cuidar tu piel nunca fue más sencillo, ven y conoce Dermis.',
      E'Camila Pamela Acosta Arostegui\nJimena Adela Gurbillon Santa Cruz\nAndrea Fernanda Coa Cruz',
      3
    ),
    (
      'Ciencia de la Computación',
      'Aurora Climb',
      'Aurora Climb es un simulador de escalada. Es una aplicación de realidad virtual que derriba las barreras geográficas, económicas y físicas para practicar escalada. Su objetivo es ofrecer una experiencia de ascenso inmersiva, segura y físicamente exigente desde cualquier lugar. El usuario escala paredes de montaña con sus propias manos: se sujeta de los agarres con los controladores, coordina el balanceo de su cuerpo y asciende hasta la cima, donde contempla una vista panorámica. Al llegar, recibe estadísticas de su desempeño que lo motivan a conquistar nuevas rutas. Todo en un entorno realista que combina reto, adrenalina y conexión con la naturaleza.',
      E'Jorge Eduardo Melgarejo Castillo\nBrigitte Dayane Rojas Leon\nLaura Gabriela Nagamine Oshiro',
      3
    ),
    (
      'Bioingeniería',
      'Espectrofotómetro casero',
      'El proyecto es un modelo de un espectrofotómetro a pequeña escala para demostrar el funcionamiento del equipo que utilizamos en el laboratorio para la cuantificación de proteínas. Utilizando conceptos de las propiedades de las ondas de luz y la ley de BeerLambert.',
      E'Hannah Andrea López Silva\nMarcelo Daniel Rodríguez Fernández\nPriamo César Rodas Muñoz\nSarahí Juliet Suárez Walttuoni',
      4
    ),
    (
      'Ingeniería Ambiental',
      'Estimación de caudales extremos e inundación mediante SIG, SCS-CN, Random Forest como emulador hidrológico y HAND + Manning en el río Huallaga, tramo San Rafael Huancapata/Ambo, Huánuco',
      'Las inundaciones en la cuenca del río Huallaga, tramo San Rafael - Ambo, representan una amenaza recurrente para la infraestructura, los centros poblados y las actividades ubicadas cerca del cauce. La ausencia de una estación hidrométrica directa en el punto de control Huancapata - Ambo limita la aplicación de modelos calibrados con caudal observado. Por ello, este proyecto propone una metodología integrada que combina Sistemas de Información Geográfica (SIG), análisis estadístico de precipitaciones extremas, el método SCS-CN, un motor de transformación lluvia - escorrentía y Random Forest como emulador hidrológico.',
      E'Maria Alejandra Rojas Matienzo\nPauline Aida Wegner Oliveros',
      2
    ),
    (
      'Ingeniería Civil',
      'Desafío Boorie',
      'Boorie es un proyecto tecnológico que utiliza Inteligencia Artificial Generativa para ayudar a las empresas de agua potable y saneamiento a reducir las pérdidas de agua y mejorar su eficiencia energética. En pocas palabras, es como un "asistente inteligente" para la gestión del agua. Su objetivo principal es atacar el problema del agua no registrada (el agua que se pierde en el proceso, que a nivel mundial es un promedio del 37%), ayudando a las empresas a detectar fugas y optimizar sus operaciones. El proyecto es impulsado por BID Lab (el laboratorio de innovación del Banco Interamericano de Desarrollo) y está diseñado bajo el concepto de Industria 5.0, que busca integrar la tecnología con un enfoque humano y sostenible.',
      E'Rubén Ríos Chipana\nKevin Heymer Núñez Flores',
      2
    ),
    (
      'Ingeniería de la Energía',
      'Diseño de una planta power-to-methanol para la valorización del CO2 de una central termoeléctrica mediante hidrógeno verde y producción de e-metanol',
      'Se evidencia que las centrales termoeléctricas emiten grandes volúmenes de CO2. Este proyecto propone capturar ese CO2 y sintetizarlo en metanol (e-metanol) usando hidrógeno verde (H2 producido por electrólisis con energía eléctrica renovable) como reductor químico. El proceso integra la captura de carbono, síntesis catalítica y aprovechamiento de la energía térmica residual de la planta térmica. El e-metanol producido es un combustible limpio reutilizable en transporte e industria química, y contribuye a cerrar un ciclo de economía circular. La propuesta mejora la rentabilidad de la central térmica al monetizar sus emisiones, simultáneamente reduciendo su huella de carbono.',
      E'Adriana Castilla Aguirre\nAndre Rodrigo Aldasabal Arias\nEpson Jesus Pisfil Cruzado',
      3
    ),
    (
      'Ingeniería de la Mecánica',
      'Desarrollo de un sistema biomecánico inmersivo de rehabilitación del tobillo basado en realidad virtual',
      'Prototipo de un sistema funcional de rehabilitación de tobillo que integra realidad virtual inmersiva, electromiografía de superficie (sEMG) y captura inercial del movimiento mediante Xsens. El sistema está diseñado para demostrar ejercicios terapéuticos y proporcionar biofeedback mediante variables como el %MVC y el rango de movimiento articular (ROM) en tiempo real.',
      E'Ana Cecilia Ordinola Chunga\nMilagros Pozo Inocente\nJhoselin Sarai Ashnati Rosales',
      3
    ),
    (
      'Ingeniería de la Mecatrónica',
      'Brazo Robótico Clasificador de Fruta por Madurez mediante Visión Artificial y Aprendizaje Automático',
      'El proyecto desarrolla un sistema robotizado para la clasificación automática de frutas mediante visión artificial. Una cámara identifica el color y posición de cada fruta, mientras un brazo robótico de 4 grados de libertad utiliza cinemática inversa y control PID para recogerla y depositarla en el contenedor correspondiente. El sistema integra OpenCV, ESP32, ROS 2 y micro-ROS, ofreciendo una solución de bajo costo para tareas repetitivas de clasificación.',
      E'Alessandro Cartagena Estremadoyro\nGabriel Alexander Huamanchumo Urbina\nMarcelo Rodrigo Mariños Herrera\nRoberto Valentino Diaz Ayala\nThomas Matias Flores Baltodano',
      5
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
