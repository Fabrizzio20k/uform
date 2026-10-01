import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/proyectos/[id]">) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const { id } = await ctx.params;
  const existing = await prisma.proyecto.findUnique({ where: { id }, select: { categoriaId: true, _count: { select: { evaluaciones: true } } } });
  if (!existing) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const data = body as Record<string, unknown>;
  const nombre = typeof data?.nombre === "string" ? data.nombre.trim() : "";
  const categoriaId = typeof data?.categoriaId === "string" ? data.categoriaId : "";
  if (!nombre || nombre.length > 300 || !categoriaId) {
    return NextResponse.json({ error: "Nombre o categoría inválidos." }, { status: 400 });
  }
  if (categoriaId !== existing.categoriaId && existing._count.evaluaciones > 0) {
    return NextResponse.json({ error: "No se puede cambiar la categoría de un proyecto ya evaluado." }, { status: 409 });
  }
  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId }, select: { id: true } });
  if (!categoria) return NextResponse.json({ error: "Categoría no encontrada." }, { status: 400 });
  const optional = (field: string, max = 5000) => {
    const value = data[field];
    if (value === undefined || value === null || value === "") return null;
    if (typeof value !== "string" || value.trim().length > max) throw new Error("Datos inválidos.");
    return value.trim();
  };
  let area: string | null, descripcion: string | null, integrantesRaw: string | null, dimensiones: string | null, requerimientoTecnico: string | null;
  try {
    area = optional("area", 200);
    descripcion = optional("descripcion");
    integrantesRaw = optional("integrantesRaw");
    dimensiones = optional("dimensiones", 500);
    requerimientoTecnico = optional("requerimientoTecnico", 1000);
  } catch {
    return NextResponse.json({ error: "Los datos del proyecto no son válidos." }, { status: 400 });
  }
  const numeroIntegrantes = data.numeroIntegrantes === null || data.numeroIntegrantes === "" ? null : data.numeroIntegrantes;
  if (numeroIntegrantes !== null && (!Number.isInteger(numeroIntegrantes) || (numeroIntegrantes as number) < 0 || (numeroIntegrantes as number) > 10000)) {
    return NextResponse.json({ error: "Número de integrantes inválido." }, { status: 400 });
  }
  await prisma.proyecto.update({
    where: { id },
    data: { nombre, categoriaId, area, descripcion, integrantesRaw, numeroIntegrantes: numeroIntegrantes as number | null, dimensiones, requerimientoTecnico },
  });
  return NextResponse.json({ ok: true });
}
