import { NextRequest, NextResponse } from "next/server";
import type { TipoRubrica } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

type CategoriaInput = { key?: unknown; nombre?: unknown };
type CriterioInput = { nombre?: unknown; descripcion?: unknown; pesos?: unknown };

export function rubricDraft(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Solicitud inválida.");
  const data = body as Record<string, unknown>;
  const nombre = typeof data?.nombre === "string" ? data.nombre.trim() : "";
  const tipo: TipoRubrica | null = data?.tipo === "STAND_POSTER" || data?.tipo === "ELEVATOR_PITCH" ? data.tipo : null;
  if (!nombre || nombre.length > 120 || !tipo) throw new Error("Nombre o tipo de rúbrica inválido.");
  if (!Array.isArray(data.categorias) || data.categorias.length === 0) throw new Error("Agrega al menos una categoría.");
  if (!Array.isArray(data.criterios) || data.criterios.length === 0) throw new Error("Agrega al menos un criterio.");
  const categorias = data.categorias.map((item, index) => {
    const value = item as CategoriaInput;
    const key = typeof value.key === "string" ? value.key : "";
    const categoryName = typeof value.nombre === "string" ? value.nombre.trim() : "";
    if (!key || !categoryName || categoryName.length > 120) throw new Error(`La categoría ${index + 1} no es válida.`);
    return { key, nombre: categoryName };
  });
  if (new Set(categorias.map((item) => item.key)).size !== categorias.length || new Set(categorias.map((item) => item.nombre.toLocaleLowerCase())).size !== categorias.length) throw new Error("Las categorías deben ser únicas.");
  const criterios = data.criterios.map((item, index) => {
    const value = item as CriterioInput;
    const criterionName = typeof value.nombre === "string" ? value.nombre.trim() : "";
    const descripcion = value.descripcion === undefined || value.descripcion === null || value.descripcion === "" ? null : typeof value.descripcion === "string" ? value.descripcion.trim() : null;
    if (!criterionName || criterionName.length > 160 || (descripcion !== null && descripcion.length > 5000) || !value.pesos || typeof value.pesos !== "object" || Array.isArray(value.pesos)) throw new Error(`El criterio ${index + 1} no es válido.`);
    const pesos = Object.fromEntries(categorias.map(({ key }) => {
      const peso = (value.pesos as Record<string, unknown>)[key];
      if (typeof peso !== "number" || !Number.isFinite(peso) || peso < 0 || peso > 1) throw new Error(`Revisa los pesos de «${criterionName}».`);
      return [key, peso];
    }));
    if (Object.keys(value.pesos as Record<string, unknown>).some((key) => !categorias.some((category) => category.key === key))) throw new Error(`Revisa los pesos de «${criterionName}».`);
    return { nombre: criterionName, descripcion, pesos };
  });
  if (new Set(criterios.map((item) => item.nombre.toLocaleLowerCase())).size !== criterios.length) throw new Error("Los criterios deben tener nombres únicos.");
  for (const category of categorias) {
    const total = criterios.reduce((sum, criterion) => sum + criterion.pesos[category.key], 0);
    if (Math.abs(total - 1) > 0.001) throw new Error(`Los pesos de «${category.nombre}» deben sumar 100%.`);
  }
  return { nombre, tipo, categorias, criterios };
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  let draft;
  try { draft = rubricDraft(body); } catch (cause) { return NextResponse.json({ error: cause instanceof Error ? cause.message : "Datos inválidos." }, { status: 400 }); }
  try {
    const rubrica = await prisma.$transaction(async (tx) => {
      const created = await tx.rubrica.create({ data: { nombre: draft.nombre, tipo: draft.tipo } });
      const categories = await Promise.all(draft.categorias.map((category) => tx.categoria.create({ data: { nombre: category.nombre, rubricaId: created.id } }).then((item) => [category.key, item.id] as const)));
      const categoryId = new Map(categories);
      for (const [orden, criterion] of draft.criterios.entries()) {
        const createdCriterion = await tx.criterio.create({ data: { rubricaId: created.id, nombre: criterion.nombre, descripcion: criterion.descripcion, orden } });
        await tx.pesoCriterioCategoria.createMany({ data: draft.categorias.map((category) => ({ categoriaId: categoryId.get(category.key)!, criterioId: createdCriterion.id, peso: criterion.pesos[category.key] })) });
      }
      return created;
    });
    return NextResponse.json({ rubrica: { id: rubrica.id } }, { status: 201 });
  } catch (cause) {
    const message = cause instanceof Error && cause.message.includes("Unique constraint") ? "Ya existe una rúbrica o categoría con ese nombre." : "No se pudo crear la rúbrica.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
