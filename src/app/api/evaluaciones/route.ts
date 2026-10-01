import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const MIN_PUNTAJE = 1;
const MAX_PUNTAJE = 4;

type PuntajeInput = { criterioId: string; puntaje: number };

// Crea o actualiza (upsert) la evaluación de un jurado sobre un proyecto.
// Recibe el listado de puntajes (1-4) por criterio y calcula scoreTotal =
// sum(puntaje * peso_del_criterio_en_la_categoria_del_proyecto).
export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { proyectoId, puntajes } = (body ?? {}) as {
    proyectoId?: string;
    puntajes?: PuntajeInput[];
  };

  if (!proyectoId || typeof proyectoId !== "string" || !Array.isArray(puntajes)) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  for (const p of puntajes) {
    if (
      !p ||
      typeof p.criterioId !== "string" ||
      typeof p.puntaje !== "number" ||
      !Number.isInteger(p.puntaje) ||
      p.puntaje < MIN_PUNTAJE ||
      p.puntaje > MAX_PUNTAJE
    ) {
      return NextResponse.json(
        { error: `Cada puntaje debe ser un entero entre ${MIN_PUNTAJE} y ${MAX_PUNTAJE}.` },
        { status: 400 }
      );
    }
  }

  const proyecto = await prisma.proyecto.findUnique({
    where: { id: proyectoId },
    include: {
      categoria: { include: { pesos: true } },
    },
  });

  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  // Una evaluación es definitiva: si el jurado ya evaluó este proyecto, no
  // se permite modificarla (se hace cumplir en el servidor, no solo en la UI).
  const evaluacionExistente = await prisma.evaluacion.findUnique({
    where: { juradoId_proyectoId: { juradoId: session.sub, proyectoId } },
  });
  if (evaluacionExistente) {
    return NextResponse.json(
      { error: "Ya evaluaste este proyecto. La evaluación no puede modificarse." },
      { status: 409 }
    );
  }

  const pesoPorCriterio = new Map(
    proyecto.categoria.pesos.map((p) => [p.criterioId, Number(p.peso)])
  );

  // Todos los criterios de la rúbrica de esa categoría deben venir puntuados.
  const criteriosEsperados = new Set(pesoPorCriterio.keys());
  const criteriosRecibidos = new Set(puntajes.map((p) => p.criterioId));
  const faltantes = [...criteriosEsperados].filter((c) => !criteriosRecibidos.has(c));
  const desconocidos = [...criteriosRecibidos].filter((c) => !criteriosEsperados.has(c));

  if (faltantes.length > 0 || desconocidos.length > 0) {
    return NextResponse.json(
      { error: "Los criterios enviados no coinciden con la rúbrica del proyecto." },
      { status: 400 }
    );
  }

  let scoreTotal = 0;
  for (const p of puntajes) {
    const peso = pesoPorCriterio.get(p.criterioId) ?? 0;
    scoreTotal += p.puntaje * peso;
  }

  try {
    const evaluacion = await prisma.$transaction(async (tx) => {
      const ev = await tx.evaluacion.create({
        data: { juradoId: session.sub, proyectoId, scoreTotal },
      });

      await tx.puntajeCriterio.createMany({
        data: puntajes.map((p) => ({
          evaluacionId: ev.id,
          criterioId: p.criterioId,
          puntaje: p.puntaje,
        })),
      });

      return ev;
    });

    return NextResponse.json({
      evaluacion: { id: evaluacion.id, scoreTotal: evaluacion.scoreTotal },
    });
  } catch {
    // Cubre la rara condición de carrera de dos guardados casi simultáneos
    // del mismo jurado sobre el mismo proyecto (el unique constraint de la
    // base de datos es la garantía final, el check de arriba es solo la
    // respuesta rápida en el caso común).
    return NextResponse.json(
      { error: "Ya evaluaste este proyecto. La evaluación no puede modificarse." },
      { status: 409 }
    );
  }
}
