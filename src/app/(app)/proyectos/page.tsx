"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown } from "lucide-react";
import { AppFooter } from "@/components/app-footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Proyecto = {
  id: string;
  nombre: string;
  area: string | null;
  categoria: { id: string; nombre: string };
  yaEvaluado: boolean;
};

type Estado = "todos" | "evaluados" | "pendientes";
type Orden = "nombre" | "categoria" | "estado";

export default function ProyectosPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<Proyecto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<Estado>("todos");
  const [orden, setOrden] = useState<Orden>("nombre");

  useEffect(() => {
    async function load() {
      const proyectosRes = await fetch("/api/proyectos");
      if (!proyectosRes.ok) {
        if (proyectosRes.status === 401) {
          router.push("/login");
          return;
        }
        setError("No se pudieron cargar los proyectos.");
        return;
      }
      const proyectosData = await proyectosRes.json();
      setProyectos(proyectosData.proyectos);
    }
    load();
  }, [router]);

  const categorias = useMemo(() => {
    if (!proyectos) return [];
    const nombres = new Set(proyectos.map((p) => p.categoria.nombre));
    return [...nombres].sort((a, b) => a.localeCompare(b));
  }, [proyectos]);

  const proyectosFiltrados = useMemo(() => {
    if (!proyectos) return [];
    let resultado = proyectos;

    if (categoriaActiva) {
      resultado = resultado.filter((p) => p.categoria.nombre === categoriaActiva);
    }
    if (estado === "evaluados") {
      resultado = resultado.filter((p) => p.yaEvaluado);
    } else if (estado === "pendientes") {
      resultado = resultado.filter((p) => !p.yaEvaluado);
    }
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      resultado = resultado.filter((p) => p.nombre.toLowerCase().includes(q));
    }

    resultado = [...resultado].sort((a, b) => {
      if (orden === "nombre") return a.nombre.localeCompare(b.nombre);
      if (orden === "categoria") return a.categoria.nombre.localeCompare(b.categoria.nombre);
      // estado: pendientes primero
      return Number(a.yaEvaluado) - Number(b.yaEvaluado);
    });

    return resultado;
  }, [proyectos, categoriaActiva, estado, busqueda, orden]);

  const totalEvaluados = proyectos?.filter((p) => p.yaEvaluado).length ?? 0;

  return (
    <>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h1 className="text-lg font-medium">Proyectos</h1>
          {proyectos && (
            <p className="text-sm text-muted-foreground">
              {totalEvaluados} de {proyectos.length} evaluados
            </p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {!proyectos && !error && (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        )}

        {proyectos && (
          <>
            {/* Buscador + ordenamiento + estado */}
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as Estado)}
                  className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground shadow-xs [color-scheme:light] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:[color-scheme:dark]"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendientes">Pendientes</option>
                  <option value="evaluados">Evaluados</option>
                </select>

                <div className="relative">
                  <ArrowUpDown className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={orden}
                    onChange={(e) => setOrden(e.target.value as Orden)}
                    className="h-9 rounded-md border border-input bg-background pl-8 pr-2.5 text-sm text-foreground shadow-xs [color-scheme:light] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:[color-scheme:dark]"
                  >
                    <option value="nombre">Nombre</option>
                    <option value="categoria">Categoría</option>
                    <option value="estado">Estado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filtro por categoría */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoriaActiva(null)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  categoriaActiva === null
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                Todas ({proyectos.length})
              </button>
              {categorias.map((cat) => {
                const count = proyectos.filter((p) => p.categoria.nombre === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoriaActiva(cat)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      categoriaActiva === cat
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proyecto</TableHead>
                    <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                    <TableHead className="hidden md:table-cell">Área</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proyectosFiltrados.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/proyectos/${p.id}`)}
                    >
                      <TableCell className="max-w-[220px] truncate font-medium">
                        {p.nombre}
                        <span className="block truncate text-xs text-muted-foreground sm:hidden">
                          {p.categoria.nombre}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {p.categoria.nombre}
                      </TableCell>
                      <TableCell className="hidden max-w-[180px] truncate text-muted-foreground md:table-cell">
                        {p.area ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.yaEvaluado ? (
                          <Badge variant="secondary">Evaluado</Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {proyectosFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No hay proyectos que coincidan con los filtros.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </main>
      <AppFooter />
    </>
  );
}
