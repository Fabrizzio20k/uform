"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Ruler, Plug, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AppFooter } from "@/components/app-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Criterio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  peso: string;
};

type ProyectoDetalle = {
  proyecto: {
    id: string;
    nombre: string;
    area: string | null;
    descripcion: string | null;
    integrantesRaw: string | null;
    numeroIntegrantes: number | null;
    dimensiones: string | null;
    requerimientoTecnico: string | null;
    categoria: { id: string; nombre: string };
  };
  rubrica: { id: string; nombre: string; tipo: string; criterios: Criterio[] };
  evaluacionExistente: {
    id: string;
    scoreTotal: string;
    puntajes: { criterioId: string; puntaje: number }[];
  } | null;
};

const OPCIONES_PUNTAJE = [1, 2, 3, 4];

export default function ProyectoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ProyectoDetalle | null>(null);
  const [puntajes, setPuntajes] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [yaEvaluado, setYaEvaluado] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/proyectos/${params.id}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setError("No se pudo cargar el proyecto.");
        return;
      }
      const detalle: ProyectoDetalle = await res.json();
      setData(detalle);

      if (detalle.evaluacionExistente) {
        const iniciales: Record<string, number> = {};
        for (const p of detalle.evaluacionExistente.puntajes) {
          iniciales[p.criterioId] = p.puntaje;
        }
        setPuntajes(iniciales);
        setYaEvaluado(true);
      }
    }
    load();
  }, [params.id, router]);

  function setPuntaje(criterioId: string, valor: number) {
    if (yaEvaluado) return;
    setPuntajes((prev) => ({ ...prev, [criterioId]: valor }));
  }

  function handleOpenConfirm() {
    if (!data) return;
    const faltantes = data.rubrica.criterios.filter((c) => !(c.id in puntajes));
    if (faltantes.length > 0) {
      setError("Debes calificar todos los criterios antes de guardar.");
      return;
    }
    setError(null);
    setConfirmOpen(true);
  }

  async function handleConfirmSave() {
    if (!data) return;
    setSaving(true);
    setConfirmOpen(false);

    try {
      const res = await fetch("/api/evaluaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proyectoId: data.proyecto.id,
          puntajes: data.rubrica.criterios.map((c) => ({
            criterioId: c.id,
            puntaje: puntajes[c.id],
          })),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "No se pudo guardar la evaluación.");
        return;
      }
      setYaEvaluado(true);
      toast.success("Evaluación guardada correctamente.", {
        description: `Puntaje total: ${Number(result.evaluacion.scoreTotal).toFixed(2)}`,
      });
    } catch {
      toast.error("Ocurrió un error de conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const integrantes = data?.proyecto.integrantesRaw
    ? data.proyecto.integrantesRaw.split("\n").filter(Boolean)
    : [];

  return (
    <>
      <main className="mx-auto w-full max-w-5xl flex-1 p-4">
        <Link
          href="/proyectos"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a proyectos
        </Link>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {!data && !error && <p className="text-sm text-muted-foreground">Cargando...</p>}

        {data && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Formulario de evaluación / vista de solo lectura */}
            <Card className="order-2 lg:order-1">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>Evaluación — {data.rubrica.nombre}</CardTitle>
                  {yaEvaluado && (
                    <Badge variant="secondary" className="gap-1">
                      <Eye className="size-3" />
                      Evaluado
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {yaEvaluado
                    ? "Ya evaluaste este proyecto. Estos son los puntajes que registraste."
                    : "Califica cada criterio del 1 al 4."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {data.rubrica.criterios.map((criterio) => (
                  <div key={criterio.id} className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <Label>{criterio.nombre}</Label>
                      <span className="text-xs text-muted-foreground">
                        peso {Number(criterio.peso) * 100}%
                      </span>
                    </div>
                    {criterio.descripcion && (
                      <p className="text-xs text-muted-foreground">{criterio.descripcion}</p>
                    )}
                    <div className="flex gap-2">
                      {OPCIONES_PUNTAJE.map((valor) => (
                        <button
                          key={valor}
                          type="button"
                          disabled={yaEvaluado}
                          onClick={() => setPuntaje(criterio.id, valor)}
                          className={cn(
                            "h-9 w-9 rounded-md border text-sm font-medium transition-colors",
                            puntajes[criterio.id] === valor
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input hover:bg-muted",
                            yaEvaluado && "cursor-not-allowed opacity-70 hover:bg-transparent"
                          )}
                        >
                          {valor}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {!yaEvaluado && (
                  <Button onClick={handleOpenConfirm} disabled={saving} className="mt-2">
                    {saving ? "Guardando..." : "Guardar evaluación"}
                  </Button>
                )}

                {yaEvaluado && data.evaluacionExistente && (
                  <p className="text-sm text-muted-foreground">
                    Puntaje total registrado:{" "}
                    <strong className="text-foreground">
                      {Number(data.evaluacionExistente.scoreTotal).toFixed(2)}
                    </strong>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Ficha informativa del proyecto */}
            <Card className="order-1 h-fit lg:order-2 lg:sticky lg:top-20">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{data.proyecto.nombre}</CardTitle>
                  <Badge variant="outline" className="shrink-0">
                    {data.proyecto.categoria.nombre}
                  </Badge>
                </div>
                {data.proyecto.area && (
                  <CardDescription>{data.proyecto.area}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm">
                {data.proyecto.descripcion && (
                  <p className="text-muted-foreground">{data.proyecto.descripcion}</p>
                )}

                {integrantes.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Users className="size-3.5" />
                      Integrantes
                      {data.proyecto.numeroIntegrantes && (
                        <span className="text-muted-foreground">
                          ({data.proyecto.numeroIntegrantes})
                        </span>
                      )}
                    </div>
                    <ul className="flex flex-col gap-0.5 text-muted-foreground">
                      {integrantes.map((nombre, i) => (
                        <li key={i}>{nombre}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.proyecto.dimensiones && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Ruler className="size-3.5" />
                      Dimensiones
                    </div>
                    <p className="text-muted-foreground">{data.proyecto.dimensiones}</p>
                  </div>
                )}

                {data.proyecto.requerimientoTecnico && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Plug className="size-3.5" />
                      Requerimiento técnico
                    </div>
                    <p className="text-muted-foreground">
                      {data.proyecto.requerimientoTecnico}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <AppFooter />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Guardar evaluación?</DialogTitle>
            <DialogDescription>
              Una vez guardada, no podrás modificar los puntajes de este proyecto. Verifica
              que todo esté correcto antes de continuar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button onClick={handleConfirmSave} disabled={saving}>
              {saving ? "Guardando..." : "Sí, guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
