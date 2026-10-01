import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Leaderboard público (cualquiera puede verlo, no requiere sesión).
// El puntaje de cada proyecto es la suma de scoreTotal de todas sus
// evaluaciones (scoreTotal ya viene pre-calculado por evaluación como
// sum(puntaje * peso) por criterio, ver /api/evaluaciones).
// La agregación usa groupBy sobre evaluaciones.proyectoId, que está cubierto
// por el índice compuesto (proyectoId, scoreTotal) para que el cálculo sea
// eficiente incluso con muchas evaluaciones.
export async function GET() {
  const agregados = await prisma.evaluacion.groupBy({
    by: ["proyectoId"],
    _sum: { scoreTotal: true },
    _count: { _all: true },
  });

  const proyectoIds = agregados.map((a) => a.proyectoId);
  const proyectos = await prisma.proyecto.findMany({
    where: { id: { in: proyectoIds } },
    include: { categoria: true },
  });
  const proyectoById = new Map(proyectos.map((p) => [p.id, p]));

  const filas = agregados
    .map((a) => {
      const proyecto = proyectoById.get(a.proyectoId);
      if (!proyecto) return null;
      return {
        proyectoId: proyecto.id,
        nombre: proyecto.nombre,
        categoria: { id: proyecto.categoria.id, nombre: proyecto.categoria.nombre },
        puntajeTotal: Number(a._sum.scoreTotal ?? 0),
        numeroEvaluaciones: a._count._all,
      };
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  const rankingGlobal = [...filas].sort((a, b) => b.puntajeTotal - a.puntajeTotal);

  const porCategoria = new Map<string, typeof filas>();
  for (const fila of filas) {
    const key = fila.categoria.nombre;
    if (!porCategoria.has(key)) porCategoria.set(key, []);
    porCategoria.get(key)!.push(fila);
  }
  const rankingPorCategoria = [...porCategoria.entries()]
    .map(([categoria, items]) => ({
      categoria,
      proyectos: items.sort((a, b) => b.puntajeTotal - a.puntajeTotal),
    }))
    .sort((a, b) => a.categoria.localeCompare(b.categoria));

  return NextResponse.json({ rankingGlobal, rankingPorCategoria });
}
