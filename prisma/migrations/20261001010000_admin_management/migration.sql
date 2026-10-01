ALTER TABLE "jurados" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "evaluaciones_anuladas" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
  "evaluacionId" UUID NOT NULL,
  "juradoEmail" TEXT NOT NULL,
  "juradoNombre" TEXT NOT NULL,
  "proyectoId" UUID NOT NULL,
  "proyectoNombre" TEXT NOT NULL,
  "adminEmail" TEXT NOT NULL,
  "motivo" VARCHAR(500) NOT NULL,
  "scoreTotal" DECIMAL(6,3) NOT NULL,
  "puntajes" JSONB NOT NULL,
  "creadaAt" TIMESTAMP(3) NOT NULL,
  "anuladaAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "evaluaciones_anuladas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "evaluaciones_anuladas_evaluacionId_key" ON "evaluaciones_anuladas"("evaluacionId");
CREATE INDEX "evaluaciones_anuladas_proyectoId_idx" ON "evaluaciones_anuladas"("proyectoId");
