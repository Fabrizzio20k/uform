import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Perfil del jurado autenticado, con el resumen de sus evaluaciones ya
// realizadas (solo lectura: no se puede modificar nada desde aquí, según lo
// pedido — los datos del jurado se sedean y no son editables).
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const jurado = await prisma.jurado.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      position: true,
      faculty: true,
      passwordSetAt: true,
    },
  });

  if (!jurado) {
    return NextResponse.json({ error: "Jurado no encontrado." }, { status: 404 });
  }

  const evaluaciones = await prisma.evaluacion.findMany({
    where: { juradoId: session.sub },
    include: { proyecto: { include: { categoria: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    jurado,
    evaluaciones: evaluaciones.map((ev) => ({
      id: ev.id,
      scoreTotal: ev.scoreTotal,
      proyecto: {
        id: ev.proyecto.id,
        nombre: ev.proyecto.nombre,
        categoria: ev.proyecto.categoria.nombre,
      },
    })),
  });
}
