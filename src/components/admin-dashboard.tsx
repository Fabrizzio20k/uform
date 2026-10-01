"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Jurado = { id: string; fullName: string; email: string; phone: string | null; position: string | null; faculty: string | null; active: boolean; passwordSetAt: string | null; evaluaciones: number };
type Proyecto = { id: string; nombre: string; area: string | null; descripcion: string | null; integrantesRaw: string | null; numeroIntegrantes: number | null; dimensiones: string | null; requerimientoTecnico: string | null; categoriaId: string; categoria: string; evaluaciones: number };
type Evaluacion = { id: string; scoreTotal: number; createdAt: string; jurado: { fullName: string; email: string }; proyecto: { nombre: string; categoria: string }; puntajes: { puntaje: number; criterio: { nombre: string } }[] };
type Anulada = { id: string; juradoNombre: string; proyectoNombre: string; adminEmail: string; motivo: string; anuladaAt: string };
type JuradoDraft = Pick<Jurado, "fullName" | "email" | "active"> & { phone: string; position: string; faculty: string };
type ProyectoDraft = { nombre: string; categoriaId: string; area: string; descripcion: string; integrantesRaw: string; numeroIntegrantes: string; dimensiones: string; requerimientoTecnico: string };
type Modal = { kind: "jurado"; id?: string } | { kind: "proyecto"; id: string } | { kind: "evaluacion"; id: string } | null;

const emptyJurado: JuradoDraft = { fullName: "", email: "", phone: "", position: "", faculty: "", active: true };
const date = (value: string) => new Date(value).toLocaleString("es-PE", { timeZone: "America/Lima" });
const fieldClass = "min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export function AdminDashboard({ jurados, proyectos, categorias, evaluaciones, anuladas }: {
  jurados: Jurado[];
  proyectos: Proyecto[];
  categorias: { id: string; nombre: string }[];
  evaluaciones: Evaluacion[];
  anuladas: Anulada[];
}) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [juradoDraft, setJuradoDraft] = useState<JuradoDraft>(emptyJurado);
  const [proyectoDraft, setProyectoDraft] = useState<ProyectoDraft | null>(null);
  const [motivo, setMotivo] = useState("");
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const match = (text: string) => text.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase());
  const visibleJurados = jurados.filter((j) => match(`${j.fullName} ${j.email}`));
  const visibleProyectos = proyectos.filter((p) => match(`${p.nombre} ${p.categoria}`));
  const visibleEvaluaciones = evaluaciones.filter((e) => match(`${e.jurado.fullName} ${e.jurado.email} ${e.proyecto.nombre}`));
  const selectedEvaluacion = modal?.kind === "evaluacion" ? evaluaciones.find((item) => item.id === modal.id) : undefined;
  const activeJurados = jurados.filter((j) => j.active).length;
  const evaluatedProjects = proyectos.filter((p) => p.evaluaciones > 0).length;

  function openJurado(jurado?: Jurado) {
    setJuradoDraft(jurado ? { fullName: jurado.fullName, email: jurado.email, phone: jurado.phone ?? "", position: jurado.position ?? "", faculty: jurado.faculty ?? "", active: jurado.active } : emptyJurado);
    setError("");
    setModal({ kind: "jurado", id: jurado?.id });
  }
  function openProyecto(proyecto: Proyecto) {
    setProyectoDraft({ nombre: proyecto.nombre, categoriaId: proyecto.categoriaId, area: proyecto.area ?? "", descripcion: proyecto.descripcion ?? "", integrantesRaw: proyecto.integrantesRaw ?? "", numeroIntegrantes: proyecto.numeroIntegrantes?.toString() ?? "", dimensiones: proyecto.dimensiones ?? "", requerimientoTecnico: proyecto.requerimientoTecnico ?? "" });
    setError("");
    setModal({ kind: "proyecto", id: proyecto.id });
  }
  function openEvaluacion(ev: Evaluacion) {
    setMotivo("");
    setError("");
    setModal({ kind: "evaluacion", id: ev.id });
  }
  async function send(url: string, method: string, body: unknown) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) {
        const result = await response.json();
        setError(result.error ?? "No se pudo guardar.");
        return;
      }
      setModal(null);
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }
  function saveJurado(event: FormEvent) {
    event.preventDefault();
    if (modal?.kind !== "jurado") return;
    void send(modal.id ? `/api/admin/jurados/${modal.id}` : "/api/admin/jurados", modal.id ? "PATCH" : "POST", juradoDraft);
  }
  function saveProyecto(event: FormEvent) {
    event.preventDefault();
    if (modal?.kind !== "proyecto" || !proyectoDraft) return;
    void send(`/api/admin/proyectos/${modal.id}`, "PATCH", { ...proyectoDraft, numeroIntegrantes: proyectoDraft.numeroIntegrantes === "" ? null : Number(proyectoDraft.numeroIntegrantes) });
  }
  function anularEvaluacion() {
    if (modal?.kind !== "evaluacion") return;
    void send(`/api/admin/evaluaciones/${modal.id}`, "DELETE", { motivo });
  }
  async function exportCsv() {
    setExporting(true);
    try {
      const response = await fetch("/api/admin/evaluaciones/export");
      if (!response.ok) throw new Error();
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "evaluaciones.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("No se pudo exportar el CSV.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 p-4 pb-12 sm:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Administración</h1>
        <p className="text-sm text-muted-foreground">Gestiona accesos y datos del evento; supervisa cada evaluación registrada.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["Jurados activos", `${activeJurados} / ${jurados.length}`], ["Primer ingreso completo", jurados.filter((j) => j.passwordSetAt).length], ["Proyectos evaluados", `${evaluatedProjects} / ${proyectos.length}`], ["Evaluaciones vigentes", evaluaciones.length]].map(([label, value]) => (
          <Card key={label} size="sm"><CardHeader><CardTitle>{label}</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{value}</p></CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input aria-label="Buscar jurado, proyecto o evaluación" placeholder="Buscar jurado o proyecto…" value={filter} onChange={(event) => setFilter(event.target.value)} className="sm:max-w-sm" />
        <Button variant="outline" disabled={exporting} onClick={exportCsv}>{exporting ? "Exportando…" : "Exportar evaluaciones CSV"}</Button>
      </div>
      {error && !modal && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <section id="jurados" className="space-y-3">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Jurados</h2><p className="text-sm text-muted-foreground">Los nuevos jurados establecen su contraseña en el primer ingreso.</p></div><Button onClick={() => openJurado()}>Agregar jurado</Button></div>
        <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Jurado</TableHead><TableHead className="hidden sm:table-cell">Correo</TableHead><TableHead>Acceso</TableHead><TableHead className="text-right">Evaluaciones</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader><TableBody>
          {visibleJurados.map((j) => <TableRow key={j.id}><TableCell className="max-w-52 whitespace-normal font-medium">{j.fullName}<span className="block text-xs font-normal text-muted-foreground sm:hidden">{j.email}</span></TableCell><TableCell className="hidden sm:table-cell">{j.email}</TableCell><TableCell>{j.active ? j.passwordSetAt ? "Activo" : "Primer ingreso pendiente" : "Desactivado"}</TableCell><TableCell className="text-right">{j.evaluaciones}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openJurado(j)}>Gestionar</Button></TableCell></TableRow>)}
          {visibleJurados.length === 0 && <TableRow><TableCell colSpan={5}>Sin resultados.</TableCell></TableRow>}
        </TableBody></Table></div>
      </section>

      <section id="proyectos" className="space-y-3">
        <div><h2 className="text-lg font-semibold">Proyectos</h2><p className="text-sm text-muted-foreground">Puedes corregir sus datos; la categoría queda fija después de la primera evaluación.</p></div>
        <div className="max-h-[34rem] overflow-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Proyecto</TableHead><TableHead className="hidden sm:table-cell">Categoría</TableHead><TableHead className="text-right">Evaluaciones</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader><TableBody>
          {visibleProyectos.map((p) => <TableRow key={p.id}><TableCell className="max-w-sm whitespace-normal font-medium">{p.nombre}<span className="block text-xs font-normal text-muted-foreground sm:hidden">{p.categoria}</span></TableCell><TableCell className="hidden sm:table-cell">{p.categoria}</TableCell><TableCell className="text-right">{p.evaluaciones}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openProyecto(p)}>Editar</Button></TableCell></TableRow>)}
          {visibleProyectos.length === 0 && <TableRow><TableCell colSpan={4}>Sin resultados.</TableCell></TableRow>}
        </TableBody></Table></div>
      </section>

      <section id="evaluaciones" className="space-y-3">
        <div><h2 className="text-lg font-semibold">Evaluaciones vigentes</h2><p className="text-sm text-muted-foreground">Revisa puntajes y anula una evaluación errónea para permitir un nuevo envío.</p></div>
        <div className="max-h-[34rem] overflow-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Jurado</TableHead><TableHead>Proyecto</TableHead><TableHead className="hidden sm:table-cell">Fecha</TableHead><TableHead className="text-right">Puntaje</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader><TableBody>
          {visibleEvaluaciones.map((ev) => <TableRow key={ev.id}><TableCell className="max-w-44 whitespace-normal">{ev.jurado.fullName}</TableCell><TableCell className="max-w-56 whitespace-normal">{ev.proyecto.nombre}</TableCell><TableCell className="hidden sm:table-cell">{date(ev.createdAt)}</TableCell><TableCell className="text-right">{ev.scoreTotal.toFixed(2)}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openEvaluacion(ev)}>Ver</Button></TableCell></TableRow>)}
          {visibleEvaluaciones.length === 0 && <TableRow><TableCell colSpan={5}>Aún no hay evaluaciones.</TableCell></TableRow>}
        </TableBody></Table></div>
      </section>

      <section className="space-y-3"><h2 className="text-lg font-semibold">Anulaciones recientes</h2><div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Evaluación</TableHead><TableHead>Motivo</TableHead><TableHead className="hidden sm:table-cell">Administrador</TableHead><TableHead className="hidden md:table-cell">Fecha</TableHead></TableRow></TableHeader><TableBody>
        {anuladas.map((item) => <TableRow key={item.id}><TableCell className="max-w-64 whitespace-normal">{item.juradoNombre} · {item.proyectoNombre}</TableCell><TableCell className="max-w-sm whitespace-normal">{item.motivo}</TableCell><TableCell className="hidden sm:table-cell">{item.adminEmail}</TableCell><TableCell className="hidden md:table-cell">{date(item.anuladaAt)}</TableCell></TableRow>)}
        {anuladas.length === 0 && <TableRow><TableCell colSpan={4}>No hay anulaciones.</TableCell></TableRow>}
      </TableBody></Table></div></section>

      <Dialog open={modal !== null} onOpenChange={(open) => { if (!open && !saving) setModal(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {modal?.kind === "jurado" && <form onSubmit={saveJurado} className="space-y-4"><DialogHeader><DialogTitle>{modal.id ? "Gestionar jurado" : "Agregar jurado"}</DialogTitle><DialogDescription>El correo se usa para el primer ingreso y no se puede cambiar después del registro.</DialogDescription></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Nombre completo" required value={juradoDraft.fullName} onChange={(value) => setJuradoDraft({ ...juradoDraft, fullName: value })} /><Field label="Correo" type="email" required disabled={Boolean(modal.id)} value={juradoDraft.email} onChange={(value) => setJuradoDraft({ ...juradoDraft, email: value })} /><Field label="Teléfono" value={juradoDraft.phone} onChange={(value) => setJuradoDraft({ ...juradoDraft, phone: value })} /><Field label="Cargo" value={juradoDraft.position} onChange={(value) => setJuradoDraft({ ...juradoDraft, position: value })} /><Field label="Facultad" value={juradoDraft.faculty} onChange={(value) => setJuradoDraft({ ...juradoDraft, faculty: value })} /></div>
            {modal.id && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={juradoDraft.active} onChange={(e) => setJuradoDraft({ ...juradoDraft, active: e.target.checked })} />Acceso activo</label>}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => setModal(null)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button></DialogFooter>
          </form>}
          {modal?.kind === "proyecto" && proyectoDraft && <form onSubmit={saveProyecto} className="space-y-4"><DialogHeader><DialogTitle>Editar proyecto</DialogTitle><DialogDescription>La categoría no puede cambiar si el proyecto ya recibió evaluaciones.</DialogDescription></DialogHeader>
            <Field label="Nombre" required value={proyectoDraft.nombre} onChange={(value) => setProyectoDraft({ ...proyectoDraft, nombre: value })} />
            <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm"><span>Categoría</span><select className="h-9 w-full rounded-md border border-input bg-background px-3" value={proyectoDraft.categoriaId} onChange={(e) => setProyectoDraft({ ...proyectoDraft, categoriaId: e.target.value })} disabled={proyectos.find((p) => p.id === modal.id)!.evaluaciones > 0}>{categorias.map((c) => <option value={c.id} key={c.id}>{c.nombre}</option>)}</select></label><Field label="Área" value={proyectoDraft.area} onChange={(value) => setProyectoDraft({ ...proyectoDraft, area: value })} /><Field label="Número de integrantes" type="number" value={proyectoDraft.numeroIntegrantes} onChange={(value) => setProyectoDraft({ ...proyectoDraft, numeroIntegrantes: value })} /><Field label="Dimensiones" value={proyectoDraft.dimensiones} onChange={(value) => setProyectoDraft({ ...proyectoDraft, dimensiones: value })} /></div>
            <Area label="Descripción" value={proyectoDraft.descripcion} onChange={(value) => setProyectoDraft({ ...proyectoDraft, descripcion: value })} /><Area label="Integrantes (uno por línea)" value={proyectoDraft.integrantesRaw} onChange={(value) => setProyectoDraft({ ...proyectoDraft, integrantesRaw: value })} /><Area label="Requerimiento técnico" value={proyectoDraft.requerimientoTecnico} onChange={(value) => setProyectoDraft({ ...proyectoDraft, requerimientoTecnico: value })} />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => setModal(null)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button></DialogFooter>
          </form>}
          {modal?.kind === "evaluacion" && selectedEvaluacion && <div className="space-y-4"><DialogHeader><DialogTitle>Evaluación</DialogTitle><DialogDescription>{selectedEvaluacion.jurado.fullName} · {selectedEvaluacion.proyecto.nombre} · {date(selectedEvaluacion.createdAt)}</DialogDescription></DialogHeader>
            <div className="space-y-2 rounded-lg border p-3">{selectedEvaluacion.puntajes.map((p) => <div key={p.criterio.nombre} className="flex justify-between gap-3 text-sm"><span>{p.criterio.nombre}</span><strong>{p.puntaje} / 4</strong></div>)}<div className="flex justify-between border-t pt-2 font-semibold"><span>Puntaje total</span><span>{selectedEvaluacion.scoreTotal.toFixed(2)}</span></div></div>
            <div className="space-y-1.5"><Label htmlFor="motivo-anulacion">Motivo de anulación</Label><textarea id="motivo-anulacion" className={fieldClass} maxLength={500} minLength={10} value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Explica el error para dejar un registro de auditoría." /><p className="text-xs text-muted-foreground">Al anularla se retira del ranking y el jurado puede evaluar de nuevo.</p></div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button variant="outline" onClick={() => setModal(null)}>Cerrar</Button><Button variant="destructive" disabled={saving || motivo.trim().length < 10} onClick={anularEvaluacion}>{saving ? "Anulando…" : "Anular evaluación"}</Button></DialogFooter>
          </div>}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", required = false, disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; disabled?: boolean }) {
  return <label className="space-y-1.5 text-sm"><span>{label}</span><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} disabled={disabled} /></label>;
}
function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block space-y-1.5 text-sm"><span>{label}</span><textarea className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
