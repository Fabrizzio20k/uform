import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { rubricDraft } from "../route";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/rubricas/[id]">) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const { id } = await ctx.params;
  const existing = await prisma.rubrica.findUnique({ where: { id }, select: { categorias: { select: { id: true, _count: { select: { proyectos: true } } } }, criterios: { select: { _count: { select: { puntajeCriterio: true } } } } } });
  if (!existing) return NextResponse.json({ error: "Rúbrica no encontrada." }, { status: 404 });
  if (existing.criterios.some((criterion) => criterion._count.puntajeCriterio > 0)) return NextResponse.json({ error: "Esta rúbrica ya tiene puntajes registrados y quedó bloqueada para proteger el historial." }, { status: 409 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  let draft;
  try { draft = rubricDraft(body); } catch (cause) { return NextResponse.json({ error: cause instanceof Error ? cause.message : "Datos inválidos." }, { status: 400 }); }
  const existingIds = new Set(existing.categorias.map((category) => category.id));
  if (draft.categorias.some((category) => !existingIds.has(category.key) && !category.key.startsWith("new-"))) return NextResponse.json({ error: "La categoría indicada no es válida." }, { status: 400 });
  const incomingExistingIds = draft.categorias.map((category) => category.key).filter((key) => existingIds.has(key));
  const removed = existing.categorias.filter((category) => !incomingExistingIds.includes(category.id));
  if (removed.some((category) => category._count.proyectos > 0)) return NextResponse.json({ error: "No se puede quitar una categoría que aún tiene proyectos." }, { status: 409 });
  try {
    await prisma.$transaction(async (tx) => {
      await tx.rubrica.update({ where: { id }, data: { nombre: draft.nombre, tipo: draft.tipo } });
      await tx.pesoCriterioCategoria.deleteMany({ where: { categoria: { rubricaId: id } } });
      await tx.criterio.deleteMany({ where: { rubricaId: id } });
      if (removed.length) await tx.categoria.deleteMany({ where: { id: { in: removed.map((category) => category.id) } } });
      for (const category of draft.categorias) if (existingIds.has(category.key)) await tx.categoria.update({ where: { id: category.key }, data: { nombre: category.nombre } });
      for (const category of draft.categorias) if (!existingIds.has(category.key)) await tx.categoria.create({ data: { nombre: category.nombre, rubricaId: id } });
      const categories = await tx.categoria.findMany({ where: { rubricaId: id }, select: { id: true, nombre: true } });
      const categoryByName = new Map(categories.map((category) => [category.nombre, category.id]));
      for (const [orden, criterion] of draft.criterios.entries()) {
        const createdCriterion = await tx.criterio.create({ data: { rubricaId: id, nombre: criterion.nombre, descripcion: criterion.descripcion, orden } });
        await tx.pesoCriterioCategoria.createMany({ data: draft.categorias.map((category) => ({ categoriaId: categoryByName.get(category.nombre)!, criterioId: createdCriterion.id, peso: criterion.pesos[category.key] })) });
      }
    });
    return NextResponse.json({ ok: true });
  } catch (cause) {
    const message = cause instanceof Error && cause.message.includes("Unique constraint") ? "Ya existe una rúbrica o categoría con ese nombre." : "No se pudo actualizar la rúbrica.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/admin/rubricas/[id]">) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const { id } = await ctx.params;
  const rubrica = await prisma.rubrica.findUnique({ where: { id }, select: { categorias: { select: { _count: { select: { proyectos: true } } } } } });
  if (!rubrica) return NextResponse.json({ error: "Rúbrica no encontrada." }, { status: 404 });
  if (rubrica.categorias.some((category) => category._count.proyectos > 0)) return NextResponse.json({ error: "No se puede eliminar una rúbrica que todavía tiene proyectos." }, { status: 409 });
  await prisma.$transaction(async (tx) => {
    await tx.pesoCriterioCategoria.deleteMany({ where: { categoria: { rubricaId: id } } });
    await tx.criterio.deleteMany({ where: { rubricaId: id } });
    await tx.categoria.deleteMany({ where: { rubricaId: id } });
    await tx.rubrica.delete({ where: { id } });
  });
  return NextResponse.json({ ok: true });
}
