-- CreateTable
CREATE TABLE "asignaciones_proyecto" (
    "juradoId" UUID NOT NULL,
    "proyectoId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignaciones_proyecto_pkey" PRIMARY KEY ("juradoId","proyectoId")
);

-- CreateIndex
CREATE INDEX "asignaciones_proyecto_proyectoId_idx" ON "asignaciones_proyecto"("proyectoId");

-- AddForeignKey
ALTER TABLE "asignaciones_proyecto" ADD CONSTRAINT "asignaciones_proyecto_juradoId_fkey" FOREIGN KEY ("juradoId") REFERENCES "jurados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_proyecto" ADD CONSTRAINT "asignaciones_proyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
