import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/admin/evaluaciones/[id]">) {
  const { admin, error } = await requireAdmin(request);
  if (error || !admin) return error;
  const { id } = await ctx.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const motivo = typeof (body as { motivo?: unknown })?.motivo === "string" ? (body as { motivo: string }).motivo.trim() : "";
  if (motivo.length < 10 || motivo.length > 500) {
    return NextResponse.json({ error: "Indica un motivo de 10 a 500 caracteres." }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const ev = await tx.evaluacion.findUnique({
      where: { id },
      include: { jurado: true, proyecto: true, puntajes: { include: { criterio: true } } },
    });
    if (!ev) return false;
    await tx.evaluacionAnulada.create({
      data: {
        evaluacionId: ev.id,
        juradoEmail: ev.jurado.email,
        juradoNombre: ev.jurado.fullName,
        proyectoId: ev.proyectoId,
        proyectoNombre: ev.proyecto.nombre,
        adminEmail: admin.email,
        motivo,
        scoreTotal: ev.scoreTotal,
        puntajes: ev.puntajes.map((p) => ({ criterioId: p.criterioId, criterio: p.criterio.nombre, puntaje: p.puntaje })),
        creadaAt: ev.createdAt,
      },
    });
    await tx.evaluacion.delete({ where: { id: ev.id } });
    return true;
  });
  if (!result) return NextResponse.json({ error: "Evaluación no encontrada." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
