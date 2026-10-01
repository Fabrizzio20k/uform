import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Lista todos los proyectos con su categoría. Cualquier jurado autenticado
// puede ver y evaluar todos los proyectos (ver PENDIENTES.md punto 2: no
// hay todavía una asignación fina jurado-proyecto).
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const proyectos = await prisma.proyecto.findMany({
    include: { categoria: true },
    orderBy: [{ categoria: { nombre: "asc" } }, { nombre: "asc" }],
  });

  // Incluye si el jurado actual ya evaluó cada proyecto, para que el
  // frontend pueda distinguir pendientes vs completados.
  const evaluados = await prisma.evaluacion.findMany({
    where: { juradoId: session.sub },
    select: { proyectoId: true },
  });
  const evaluadosSet = new Set(evaluados.map((e) => e.proyectoId));

  return NextResponse.json({
    proyectos: proyectos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      area: p.area,
      descripcion: p.descripcion,
      integrantesRaw: p.integrantesRaw,
      numeroIntegrantes: p.numeroIntegrantes,
      dimensiones: p.dimensiones,
      requerimientoTecnico: p.requerimientoTecnico,
      categoria: { id: p.categoria.id, nombre: p.categoria.nombre },
      yaEvaluado: evaluadosSet.has(p.id),
    })),
  });
}
