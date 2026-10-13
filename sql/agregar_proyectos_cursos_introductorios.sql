-- DEMO MODE 2026 - Cursos introductorios
-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Solo agrega estos proyectos; no borra ni modifica los ya cargados.
-- Si se ejecuta otra vez, omite los proyectos cuyo nombre ya exista.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "categorias"
    WHERE "nombre" = 'Cursos introductorios'
  ) THEN
    RAISE EXCEPTION 'No existe la categoria requerida: Cursos introductorios';
  END IF;
END $$;

WITH categoria AS (
  SELECT "id"
  FROM "categorias"
  WHERE "nombre" = 'Cursos introductorios'
), nuevos_proyectos ("area", "nombre", "descripcion", "integrantesRaw", "numeroIntegrantes") AS (
  VALUES
    (
      'Administración y Negocios Digitales',
      'Egrescorp',
      'Sistema de gestión de las finanzas para restaurantes de Lima.',
      E'Andrea Ana Morales Moreno\nFabiola Niurka Cornejo Quispe\nKarla Celestina Vite Flores\nRaquel Leticia Bolarte Santos',
      4
    ),
    (
      'Business Analytics',
      'Modelo de predicción para fidelizar clientes en una veterinaria',
      'El proyecto busca desarrollar modelos predictivos que permitan identificar qué clientes tienen mayor probabilidad de suscribirse a los servicios de la veterinaria y cuáles presentan un mayor riesgo de cancelar o abandonar. A partir del análisis de información sobre comportamiento, frecuencia de visitas, servicios utilizados y características de los clientes, se espera generar una herramienta que apoye la toma de decisiones y permita diseñar estrategias de fidelización más efectivas.',
      E'Mariafernanda Giuliana Quiñones Carrillo',
      1
    ),
    (
      'Ingeniería Industrial',
      'Diagnóstico y Propuesta de Mejora Integral para el Restaurante Cevichería "A tu Gusto"',
      'El proyecto analizó el funcionamiento del restaurante-cevichería "A tu Gusto" para identificar sus principales carencias, detectando problemas de atención, comunicación, distribución, delivery e infraestructura. A partir del diagnóstico se proponen mejoras para mejorar la eficiencia de los procesos, reducir errores y mejorar la atención al cliente.',
      E'Fabiola Katterine Torres Mamani\nAlexis Omar Parinango Cordova\nDerosi Steven Silva Chávez',
      3
    ),
    (
      'Ciberseguridad',
      'Campaña de concientización contra el phishing: el caso Distribuidora Andina S.A. C.',
      'Campaña de concientización contra el phishing orientada a fortalecer la prevención frente a fraudes digitales mediante capacitaciones, simulacros y nuevas políticas de verificación. La propuesta busca reducir los riesgos asociados al factor humano y promover buenas prácticas para identificar, verificar y reportar mensajes sospechosos.',
      E'Angel Sebastian Mescua Osorio\nSebastian Alejandro Gonzales Roque\nAngel Sebastian Mescua Osorio\nWesley Rivaldo Laura Choquejahua',
      4
    ),
    (
      'Ciencia de Datos e Inteligencia Artificial',
      'Airline Passenger Satisfaction',
      'Este proyecto analiza y correlaciona los datos de los pasajeros de una aerolínea para que, mediante un modelo de Machine Learning, pueda predecir si clientes nuevos quedarán satisfechos o no.',
      E'Daniel Ken Castagnetto Kawasaki\nPaolo Francisco Solano Chuquillanqui\nMatías Nicolás Chavez Prochazka',
      3
    ),
    (
      'Ciencia de la Computación',
      'Reconocimiento automático de dígitos manuscritos mediante distancias euclidianas y el algoritmos de K-Nearest Neighbors (KNN)',
      'Sistema de Inteligencia Artificial capaz de reconocer dígitos escritos a mano. El proyecto procesa los dibujos realizados por los alumnos y los transforma en imágenes de 8 x 8 píxeles para compararlos con otros 1797 ejemplos de dígitos previamente clasificados. Mediante distancias euclidianas y los 3 ejemplares más similares, el sistema determina qué dígito fue escrito. Su desempeño se valida mediante matrices de confusión e indicadores de clasificación para evaluar sus aciertos y errores en los diez dígitos.',
      E'Pedro Daniel Benites Gonzales\nJuan Diego Butler Seclén\nAdrián Gabriel Alejandro Salazar Lezcano',
      3
    ),
    (
      'Sistemas de Información',
      'Agrolink',
      'AgroLink fue un proyecto introductorio orientado a conectar directamente a pequeños agricultores con potenciales mercados. Se propusieron soluciones a los problemas de intermediación, falta de trazabilidad y brecha digital mediante interfaces centradas en productores y compradores. La propuesta evolucionó desde wireframes de baja fidelidad hasta mockups y un prototipo interactivo de alta fidelidad desarrollado en Figma. Como resultado, se diseñó una experiencia que facilita el comercio directo, el seguimiento de productos y pedidos, y la inclusión digital en contextos rurales.',
      E'Sebastian Fabricio Añanca Esquerre\nFabricio Raul Ricapa Perez Roca\nTiago Jordan Mar\nGabriel Ignacio Vergara Chinchay\nRolando Sebastián Salazar Sánchez',
      5
    ),
    (
      'Ingeniería Ambiental',
      'CLARIVA: Remoción del azul de metileno (C₁₆H₁₈ClN₃S) mediante bioadsorbentes elaborados a partir de cáscara de huevo (Gallus gallus domesticus) y coronta de maíz (Zea mays) en efluentes textiles simulados',
      'Se desarrollaron bioadsorbentes a partir del aprovechamiento de residuos orgánicos como la cáscara de huevo y la coronta de maíz utilizados como materiales adsorbentes para remover colorantes de los efluentes textiles simulados. Para evaluar su funcionamiento se utilizó el azul de metileno (C₁₆H₁₈ClN₃S) como muestra para el experimento ya que es común su uso en la industria textil para teñir fibras naturales como seda, lana o algodón. Finalmente, los resultados preliminares sugieren que la alternativa planteada puede contribuir a reducir la concentración de colorantes presentes en el agua tratada. De este modo, promoviendo una economía circular de bajo costo para el tratamiento de efluentes textiles. Es así, que, como producto entregable, se desarrolló un sistema experimental de filtración basado en bioadsorbentes elaborados a partir de cáscara de huevo y coronta de maíz.',
      E'Almudena Aguado Gallart\nRicardo Raimundo Chirinos Zelada\nKhiara Milagros Gonzales Machco\nSofia Saldarriaga Miranda',
      4
    ),
    (
      'Ingeniería Civil',
      'La Arena (Piura) Sistema de Drenaje pluvial y Resiliencia Hídrica',
      'Reemplazo de tuberías de drenaje deficientes por unos marcos de concreto armado con dimensiones de 1.5 m x 1.5 m. Las estructuras se priorizan en las depresiones topográficas naturales y los cruces de canales de riego para permitir el paso de grandes caudales en época de lluvias y palizada sin tener la preocupación de obstruirse, protegiendo la base de la carretera y las estructuras que la rodean.',
      E'Oscar Fabian Flores Valencia\nGonzalo Zaid Rojas Zaira\nGustavo Edgardo Espinoza Julcapoma',
      3
    ),
    (
      'Ingeniería de la Electrónica',
      'COM-AID: Integración de Control Inalámbrico y Seguridad Autónoma en un Robot Móvil Semiautomático',
      'COM-AID es un robot móvil semiautomático que cuenta con un sistema de detección de obstáculos y control inalámbrico mediante Bluetooth, a través de una aplicación desarrollada en App Inventor. Utiliza un sensor ultrasónico para medir la distancia frontal e implementa un mecanismo de alerta de tres niveles según la proximidad del obstáculo. Además, incorpora una pantalla LCD para mostrar el estado del sistema y un shield PCB diseñado a medida para facilitar y mejorar las conexiones entre los componentes.',
      E'Alexandra Carolina Medina Cevallos\nRosario Mercedes Morales Orvezo\nAriadna Celeste Pillaca Llanos',
      3
    ),
    (
      'Ingeniería de la Mecatrónica',
      'R.A.M: Robot Asistente Móvil',
      'El Robot Asistente Móvil (RAM) es un prototipo de bajo costo para transportar cargas ligeras en interiores, capaz de seguir la palma de la mano mediante visión por computadora. Integra una Raspberry Pi 5, Arduino Uno y sensores ultrasónicos para el control y seguridad, además de un modo manual mediante Bluetooth. Su chasis de MDF cortado por láser lo convierte en una solución accesible para entornos educativos y de laboratorio.',
      E'Paulo Alexis Leon Zelada\nBenjamin Clevys Centeno Espinoza\nKevin Enrique Handa Volkova\nGianmarco Alessandro Mejía Melendez\nLeonardo Meza',
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
