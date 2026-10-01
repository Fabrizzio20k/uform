-- Función pura en SQL para generar UUID v7 (time-ordered), ya que la
-- extensión uuid-ossp solo soporta v1/v3/v4/v5 y Postgres nativo recién
-- incorpora uuidv7() a partir de la versión 18. Fuente: dverite/postgres-uuidv7-sql
-- (dominio público / licencia MIT), compatible con Postgres 13+.
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
AS $$
  SELECT encode(
    set_bit(
      set_bit(
        overlay(uuid_send(gen_random_uuid()) placing
          substring(int8send(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint) from 3)
          from 1 for 6
        ),
        52, 1
      ),
      53, 1
    ),
    'hex')::uuid;
$$ LANGUAGE sql VOLATILE;


-- CreateEnum
CREATE TYPE "TipoRubrica" AS ENUM ('STAND_POSTER', 'ELEVATOR_PITCH');

-- CreateTable
CREATE TABLE "jurados" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "position" TEXT,
    "faculty" TEXT,
    "passwordHash" VARCHAR(64),
    "passwordSetAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jurados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubricas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "nombre" TEXT NOT NULL,
    "tipo" "TipoRubrica" NOT NULL,

    CONSTRAINT "rubricas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "nombre" TEXT NOT NULL,
    "rubricaId" UUID NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "rubricaId" UUID NOT NULL,

    CONSTRAINT "criterios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesos_criterio_categoria" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "categoriaId" UUID NOT NULL,
    "criterioId" UUID NOT NULL,
    "peso" DECIMAL(4,3) NOT NULL,

    CONSTRAINT "pesos_criterio_categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyectos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "nombre" TEXT NOT NULL,
    "area" TEXT,
    "descripcion" TEXT,
    "integrantesRaw" TEXT,
    "numeroIntegrantes" INTEGER,
    "dimensiones" TEXT,
    "requerimientoTecnico" TEXT,
    "categoriaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "juradoId" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "scoreTotal" DECIMAL(6,3) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntajes_criterio" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "evaluacionId" UUID NOT NULL,
    "criterioId" UUID NOT NULL,
    "puntaje" INTEGER NOT NULL,

    CONSTRAINT "puntajes_criterio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "ip" TEXT NOT NULL,
    "email" TEXT,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jurados_email_key" ON "jurados"("email");

-- CreateIndex
CREATE UNIQUE INDEX "rubricas_nombre_key" ON "rubricas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "rubricas_tipo_key" ON "rubricas"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE INDEX "categorias_rubricaId_idx" ON "categorias"("rubricaId");

-- CreateIndex
CREATE INDEX "criterios_rubricaId_idx" ON "criterios"("rubricaId");

-- CreateIndex
CREATE UNIQUE INDEX "criterios_rubricaId_nombre_key" ON "criterios"("rubricaId", "nombre");

-- CreateIndex
CREATE INDEX "pesos_criterio_categoria_categoriaId_idx" ON "pesos_criterio_categoria"("categoriaId");

-- CreateIndex
CREATE INDEX "pesos_criterio_categoria_criterioId_idx" ON "pesos_criterio_categoria"("criterioId");

-- CreateIndex
CREATE UNIQUE INDEX "pesos_criterio_categoria_categoriaId_criterioId_key" ON "pesos_criterio_categoria"("categoriaId", "criterioId");

-- CreateIndex
CREATE INDEX "proyectos_categoriaId_idx" ON "proyectos"("categoriaId");

-- CreateIndex
CREATE INDEX "evaluaciones_proyectoId_scoreTotal_idx" ON "evaluaciones"("proyectoId", "scoreTotal");

-- CreateIndex
CREATE INDEX "evaluaciones_juradoId_idx" ON "evaluaciones"("juradoId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluaciones_juradoId_proyectoId_key" ON "evaluaciones"("juradoId", "proyectoId");

-- CreateIndex
CREATE INDEX "puntajes_criterio_criterioId_idx" ON "puntajes_criterio"("criterioId");

-- CreateIndex
CREATE UNIQUE INDEX "puntajes_criterio_evaluacionId_criterioId_key" ON "puntajes_criterio"("evaluacionId", "criterioId");

-- CreateIndex
CREATE INDEX "login_attempts_ip_createdAt_idx" ON "login_attempts"("ip", "createdAt");

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_rubricaId_fkey" FOREIGN KEY ("rubricaId") REFERENCES "rubricas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterios" ADD CONSTRAINT "criterios_rubricaId_fkey" FOREIGN KEY ("rubricaId") REFERENCES "rubricas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesos_criterio_categoria" ADD CONSTRAINT "pesos_criterio_categoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesos_criterio_categoria" ADD CONSTRAINT "pesos_criterio_categoria_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "criterios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_juradoId_fkey" FOREIGN KEY ("juradoId") REFERENCES "jurados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntajes_criterio" ADD CONSTRAINT "puntajes_criterio_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "evaluaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntajes_criterio" ADD CONSTRAINT "puntajes_criterio_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "criterios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
