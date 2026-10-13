-- DEMO MODE 2026 - Lista final de expositores
-- Ejecutar manualmente en el SQL Editor de Supabase.
-- No modifica categorias, rubricas, criterios, jurados ni el seed.
-- Reemplaza todos los proyectos y elimina sus evaluaciones, asignaciones
-- y anulaciones historicas asociadas antes de insertar la lista final.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "categorias"
    WHERE "nombre" = 'Proyectos Interdisciplinarios 3'
  ) THEN
    RAISE EXCEPTION 'No existe la categoria requerida: Proyectos Interdisciplinarios 3';
  END IF;
END $$;

-- Las evaluaciones dependen de los proyectos; sus puntajes se eliminan por cascade.
DELETE FROM "evaluaciones";
DELETE FROM "evaluaciones_anuladas";
DELETE FROM "asignaciones_proyecto";
DELETE FROM "proyectos";

WITH categoria AS (
  SELECT "id"
  FROM "categorias"
  WHERE "nombre" = 'Proyectos Interdisciplinarios 3'
), proyectos ("nombre", "descripcion", "integrantesRaw", "numeroIntegrantes") AS (
  VALUES
    (
      'Optimización de sistema hídrico de las áreas verdes del piso 6 de la UTEC',
      'Orientado a optimizar el riego de las áreas verdes del piso 6 de UTEC mediante un sistema inteligente que integra sensores, datos ambientales y características específicas de cada especie vegetal. La propuesta busca determinar cuándo y cuánto regar en cada zona, reducir el desperdicio de agua y facilitar una gestión más eficiente y sostenible de los jardines.',
      E'Henry Jesua Huaranccay Arias\nCarlos Sebastian Villar Lopez',
      2
    ),
    (
      'EcoVoluntarios del Carmen: Programa de voluntariado ambiental juvenil gamificado',
      'Es una iniciativa de impacto social que promueve la economía circular y la formación de líderes comunitarios, mediante un modelo de voluntariado ambiental juvenil gamificado en El Carmen (Chincha). La propuesta integra retos grupales de recolección de plástico PET, talleres de reutilización práctica y una plataforma web de seguimiento, transformando la gestión de residuos en una experiencia interactiva, colaborativa y sostenible.',
      E'Lia Kim Alcantara Tineo\nCamila Cielo Castro Pinto\nMaryi Tais Franco Lujan\nCielo Angelina Toledo Poves',
      4
    ),
    (
      'HumiSense',
      'Prototipo para el control continuo y confiable de humedad y temperatura. Pensado en la recuperación de suelos y desarrollo agrícola.',
      E'Badi Masud Rodríguez Ramírez\nFelipe Silva Winder\nSebastian David Caceres Muñoz',
      3
    ),
    (
      'Mejora del Sistema de Donaciones para Bomberos del Perú',
      'Proyecto que propone una plataforma web de donaciones trazables para los Bomberos Voluntarios del Perú, donde las personas pueden elegir a qué campaña o compañía apoyar, donar desde su celular y recibir un código para hacer seguimiento al uso de su aporte. La propuesta busca mejorar la transparencia, confianza y facilidad del proceso de donación.',
      E'Alvaro Andre Pichilingue Guardia\nFabian Tadeo Arévalo Castro\nÁlvaro Noriega Lucar',
      3
    ),
    (
      'Yaku-Bio: Monitoreo preventivo del agua almacenada mediante visión por computadora e inteligencia artificial',
      'Proyecto que desarrolla una aplicación móvil para el monitoreo preventivo del agua almacenada, utilizando visión por computadora e inteligencia artificial para detectar posibles larvas de mosquito y analizar visualmente el color o turbidez del agua. La propuesta busca ofrecer una herramienta accesible, portátil y de apoyo preventivo mediante el uso de un smartphone.',
      E'Rodrigo Sebastian Sanchez Mosquera\nGabriel Amaru Chalco Sucasaca',
      2
    ),
    (
      'Maccesible',
      'Proyecto orientado a mejorar la accesibilidad e inclusión de personas con discapacidad visual en el Museo de Arte Contemporáneo de Lima (MAC). La propuesta integra una aplicación móvil con audiodescripciones y un sistema de guiado mediante piso podotáctil y sensores del celular, con el objetivo de facilitar un recorrido más autónomo, comprensible e inclusivo dentro del museo.',
      E'Isabel Sofia Salcedo Jara\nHector Fabian Contreras Sosa\nBruno Sebastian Ramos Cadenillas\nJoaquin Abelardo Landeo Pacifico',
      4
    ),
    (
      'Sistema Digital para la Gestión de Pedidos y Ventas',
      'Muchos pequeños negocios, como bodegas y microempresas, todavía registran pedidos, ventas y pagos de forma manual, en cuadernos, WhatsApp o hojas de cálculo, generando pérdida de tiempo, errores y poca visibilidad del negocio. El proyecto digitaliza este proceso en una sola plataforma, permitiendo registrar y revisar pedidos, controlar pagos e inventario y generar información útil para tomar mejores decisiones y crecer de forma ordenada.',
      E'Alejandro David Rejas Albujar\nTommy Bryan Loo Leon\nAlejandro Favian Sarmiento Villavicencio\nImanol Felix Supo Mamani\nJose Francisco Paca Sotero',
      5
    ),
    (
      'ReProd Labs',
      'Una galleta alta en fibra y proteína vegetal, sustituyendo parte de la harina de trigo por harina de bagazo de cerveza. Pensada para llegar a colegios, kioscos y canales de distribución masiva en el Perú.',
      E'Henry Rutber Quispe Sutta\nBruno William Garcia López\nMaria Karolay Tamayo Hilario\nChars Joaquín Farro Bazán\nNelcy Gimena Alvarado Rodríguez\nDiego Alonso Ballena Pisfil',
      6
    ),
    (
      'RevitApp: Revitalización y Sostenibilidad Industrial',
      'RevitApp es una aplicación predictiva para optimizar mantenimiento industrial sostenible que combina recubrimiento anticorrosivo ecológico y sensores IoT.',
      E'María Alexandra López Chipana\nCesar Gianpiero Fernandez Rivera\nEdmundo Andre Centti Torres',
      3
    ),
    (
      'TANQUEA',
      'Plataforma en línea para personas naturales en Lima Metropolitana permitiéndoles la identificación de grifos de combustible brindando como beneficio el ahorro y optimización de tiempo.',
      E'Violeta de Fatima Figueroa Castañeda\nNicolas Babarczy Ortiz Ugaz\nCarlos Brayan Quispe Marca',
      3
    ),
    (
      'Quimflow: Sistema AGV Autónomo para traslado de químicos',
      'QuimFlow es un AGV autónomo que automatiza el traslado seguro de químicos corrosivos en la planta de Nettalco S.A., eliminando la exposición del operario y validado directamente con la empresa.',
      E'Jorge Piero Matías Leandro Vasquez\nLuis Fabiano Ivor Rivadeneira Fernandez\nKamilo Alfonso Neyra Chipana',
      3
    ),
    (
      'FeBites',
      'Brownies funcionales a base de cascarilla de cacao y sangrecita para crear un alimento accesible que contribuya a combatir la deficiencia de hierro, desarrollado en colaboración con la Cooperativa CECAT, Tocache.',
      E'Erika Fabiana Galarreta Dávila\nValentina Raquel Soukharev Tovar\nKatherine Marie Pizarro Mego\nJuan Marcelo Ferreyra Gonzales',
      4
    ),
    (
      'Réplicas 3D de fardos funerarios – Tume / Silvestre',
      'Propone una estación interactiva con réplicas 3D de fardos funerarios de Huallamarca, diseñada para que los visitantes puedan tocar, escuchar y aprender sin intervenir directamente el patrimonio original. La propuesta combina réplicas físicas, información accesible y recursos digitales mediante códigos QR y audioguías.',
      E'Andre Nicolas Silvestre Tejeda',
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
  proyectos."nombre",
  'Dirección de Proyectos e Infraestructura Académica',
  proyectos."descripcion",
  proyectos."integrantesRaw",
  proyectos."numeroIntegrantes",
  categoria."id",
  NOW(),
  NOW()
FROM proyectos
CROSS JOIN categoria;

COMMIT;
