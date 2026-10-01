import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Devuelve un proyecto junto con los criterios de evaluación aplicables
// (según su categoría) y sus pesos, para que el frontend renderice el
// formulario de evaluación correcto (Stand+Póster o Elevator Pitch).
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/proyectos/[id]">
) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { id } = await ctx.params;

  const proyecto = await prisma.proyecto.findUnique({
    where: { id },
    include: {
      categoria: {
        include: {
          rubrica: true,
          pesos: {
            include: { criterio: true },
            orderBy: { criterio: { orden: "asc" } },
          },
        },
      },
    },
  });

  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  const evaluacionExistente = await prisma.evaluacion.findUnique({
    where: { juradoId_proyectoId: { juradoId: session.sub, proyectoId: proyecto.id } },
    include: { puntajes: true },
  });

  return NextResponse.json({
    proyecto: {
      id: proyecto.id,
      nombre: proyecto.nombre,
      area: proyecto.area,
      descripcion: proyecto.descripcion,
      integrantesRaw: proyecto.integrantesRaw,
      numeroIntegrantes: proyecto.numeroIntegrantes,
      dimensiones: proyecto.dimensiones,
      requerimientoTecnico: proyecto.requerimientoTecnico,
      categoria: { id: proyecto.categoria.id, nombre: proyecto.categoria.nombre },
    },
    rubrica: {
      id: proyecto.categoria.rubrica.id,
      nombre: proyecto.categoria.rubrica.nombre,
      tipo: proyecto.categoria.rubrica.tipo,
      criterios: proyecto.categoria.pesos.map((p) => ({
        id: p.criterio.id,
        nombre: p.criterio.nombre,
        descripcion: p.criterio.descripcion,
        peso: p.peso,
      })),
    },
    evaluacionExistente: evaluacionExistente
      ? {
          id: evaluacionExistente.id,
          scoreTotal: evaluacionExistente.scoreTotal,
          puntajes: evaluacionExistente.puntajes.map((pc) => ({
            criterioId: pc.criterioId,
            puntaje: pc.puntaje,
          })),
        }
      : null,
  });
}
