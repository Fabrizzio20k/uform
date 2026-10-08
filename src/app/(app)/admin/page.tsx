import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveJurado } from "@/lib/resolve-jurado";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { AppFooter } from "@/components/app-footer";
import { AdminDashboard } from "@/components/admin-dashboard";
import { ADMIN_VIEW_COOKIE_NAME, adminViewFromCookie } from "@/lib/admin-view";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const admin = await resolveJurado(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!admin) redirect("/login");
  if (admin.role !== "ADMIN") redirect("/proyectos");
  if (adminViewFromCookie(cookieStore.get(ADMIN_VIEW_COOKIE_NAME)?.value) === "jurado") redirect("/proyectos");

  const [jurados, proyectos, categorias, evaluaciones, anuladas] = await Promise.all([
    prisma.jurado.findMany({
      where: { role: "JURADO" },
      select: { id: true, fullName: true, email: true, phone: true, position: true, faculty: true, active: true, passwordSetAt: true, asignaciones: { select: { proyectoId: true } }, _count: { select: { evaluaciones: true } } },
      orderBy: { fullName: "asc" },
    }),
    prisma.proyecto.findMany({
      select: { id: true, nombre: true, area: true, descripcion: true, integrantesRaw: true, numeroIntegrantes: true, dimensiones: true, requerimientoTecnico: true, categoriaId: true, categoria: { select: { nombre: true } }, _count: { select: { evaluaciones: true } } },
      orderBy: { nombre: "asc" },
    }),
    prisma.categoria.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: "asc" } }),
    prisma.evaluacion.findMany({
      select: { id: true, scoreTotal: true, createdAt: true, jurado: { select: { fullName: true, email: true } }, proyecto: { select: { nombre: true, categoria: { select: { nombre: true } } } }, puntajes: { select: { puntaje: true, criterio: { select: { nombre: true } } }, orderBy: { criterio: { orden: "asc" } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.evaluacionAnulada.findMany({ orderBy: { anuladaAt: "desc" }, take: 50, select: { id: true, juradoNombre: true, proyectoNombre: true, adminEmail: true, motivo: true, anuladaAt: true } }),
  ]);

  return (
    <>
      <AdminDashboard
        jurados={jurados.map((j) => ({ id: j.id, fullName: j.fullName, email: j.email, phone: j.phone, position: j.position, faculty: j.faculty, active: j.active, passwordSetAt: j.passwordSetAt?.toISOString() ?? null, assignedProjectIds: j.asignaciones.map((asignacion) => asignacion.proyectoId), evaluaciones: j._count.evaluaciones }))}
        proyectos={proyectos.map((p) => ({ id: p.id, nombre: p.nombre, area: p.area, descripcion: p.descripcion, integrantesRaw: p.integrantesRaw, numeroIntegrantes: p.numeroIntegrantes, dimensiones: p.dimensiones, requerimientoTecnico: p.requerimientoTecnico, categoriaId: p.categoriaId, categoria: p.categoria.nombre, evaluaciones: p._count.evaluaciones }))}
        categorias={categorias}
        evaluaciones={evaluaciones.map((ev) => ({ id: ev.id, scoreTotal: Number(ev.scoreTotal), createdAt: ev.createdAt.toISOString(), jurado: ev.jurado, proyecto: { nombre: ev.proyecto.nombre, categoria: ev.proyecto.categoria.nombre }, puntajes: ev.puntajes }))}
        anuladas={anuladas.map((item) => ({ ...item, anuladaAt: item.anuladaAt.toISOString() }))}
      />
      <AppFooter />
    </>
  );
}
