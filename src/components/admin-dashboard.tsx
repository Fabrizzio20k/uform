"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Jurado = { id: string; fullName: string; email: string; phone: string | null; position: string | null; faculty: string | null; active: boolean; passwordSetAt: string | null; assignedProjectIds: string[]; evaluaciones: number };
type Proyecto = { id: string; nombre: string; area: string | null; descripcion: string | null; integrantesRaw: string | null; numeroIntegrantes: number | null; dimensiones: string | null; requerimientoTecnico: string | null; categoriaId: string; categoria: string; evaluaciones: number };
type Evaluacion = { id: string; scoreTotal: number; createdAt: string; jurado: { fullName: string; email: string }; proyecto: { nombre: string; categoria: string }; puntajes: { puntaje: number; criterio: { nombre: string } }[] };
type Anulada = { id: string; juradoNombre: string; proyectoNombre: string; adminEmail: string; motivo: string; anuladaAt: string };
type JuradoDraft = Pick<Jurado, "fullName" | "email" | "active" | "assignedProjectIds"> & { phone: string; position: string; faculty: string };
type ProyectoDraft = { nombre: string; categoriaId: string; area: string; descripcion: string; integrantesRaw: string; numeroIntegrantes: string; dimensiones: string; requerimientoTecnico: string };
type Rubrica = { id: string; nombre: string; tipo: "STAND_POSTER" | "ELEVATOR_PITCH"; categorias: { id: string; nombre: string; proyectos: number }[]; criterios: { id: string; nombre: string; descripcion: string | null; orden: number; pesos: { categoriaId: string; peso: number }[] }[] };
type RubricaDraft = { nombre: string; tipo: "STAND_POSTER" | "ELEVATOR_PITCH"; categorias: { key: string; nombre: string }[]; criterios: { nombre: string; descripcion: string; pesos: Record<string, number> }[] };
type Modal = { kind: "jurado"; id?: string } | { kind: "proyecto"; id?: string } | { kind: "rubrica"; id?: string } | { kind: "evaluacion"; id: string } | null;

const emptyJurado: JuradoDraft = { fullName: "", email: "", phone: "", position: "", faculty: "", active: true, assignedProjectIds: [] };
const date = (value: string) => new Date(value).toLocaleString("es-PE", { timeZone: "America/Lima" });
const fieldClass = "min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const draftKey = () => `new-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function AdminDashboard({ jurados, proyectos, categorias, rubricas, evaluaciones, anuladas }: {
  jurados: Jurado[];
  proyectos: Proyecto[];
  categorias: { id: string; nombre: string }[];
  rubricas: Rubrica[];
  evaluaciones: Evaluacion[];
  anuladas: Anulada[];
}) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [juradoDraft, setJuradoDraft] = useState<JuradoDraft>(emptyJurado);
  const [proyectoDraft, setProyectoDraft] = useState<ProyectoDraft | null>(null);
  const [rubricaDraft, setRubricaDraft] = useState<RubricaDraft | null>(null);
  const [motivo, setMotivo] = useState("");
  const [juradoSearch, setJuradoSearch] = useState("");
  const [juradoAccess, setJuradoAccess] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectCategory, setProjectCategory] = useState("all");
  const [projectEvaluation, setProjectEvaluation] = useState("all");
  const [evaluationSearch, setEvaluationSearch] = useState("");
  const [annulledSearch, setAnnulledSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [juradoToDelete, setJuradoToDelete] = useState<Jurado | null>(null);
  const [proyectoToDelete, setProyectoToDelete] = useState<Proyecto | null>(null);
  const [rubricaToDelete, setRubricaToDelete] = useState<Rubrica | null>(null);
  const [deletedJuradoIds, setDeletedJuradoIds] = useState<Set<string>>(() => new Set());
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentCategory, setAssignmentCategory] = useState("all");

  const match = (text: string, query: string) => text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  const currentJurados = jurados.filter((j) => !deletedJuradoIds.has(j.id));
  const visibleJurados = currentJurados.filter((j) => match(`${j.fullName} ${j.email} ${j.position ?? ""} ${j.faculty ?? ""}`, juradoSearch) && (juradoAccess === "all" || juradoAccess === "enabled" && j.active && Boolean(j.passwordSetAt) || juradoAccess === "pending" && j.active && !j.passwordSetAt || juradoAccess === "blocked" && !j.active));
  const visibleProyectos = proyectos.filter((p) => match(`${p.nombre} ${p.categoria} ${p.area ?? ""}`, projectSearch) && (projectCategory === "all" || p.categoriaId === projectCategory) && (projectEvaluation === "all" || projectEvaluation === "evaluated" && p.evaluaciones > 0 || projectEvaluation === "pending" && p.evaluaciones === 0));
  const visibleEvaluaciones = evaluaciones.filter((e) => match(`${e.jurado.fullName} ${e.jurado.email} ${e.proyecto.nombre} ${e.proyecto.categoria}`, evaluationSearch));
  const visibleAnuladas = anuladas.filter((item) => match(`${item.juradoNombre} ${item.proyectoNombre} ${item.adminEmail} ${item.motivo}`, annulledSearch));
  const selectedEvaluacion = modal?.kind === "evaluacion" ? evaluaciones.find((item) => item.id === modal.id) : undefined;
  const activeJurados = currentJurados.filter((j) => j.active).length;
  const evaluatedProjects = proyectos.filter((p) => p.evaluaciones > 0).length;
  const assignmentCategories = [...new Set(proyectos.map((project) => project.categoria))].sort((a, b) => a.localeCompare(b));
  const visibleAssignmentProjects = proyectos.filter((project) => {
    const search = assignmentSearch.trim().toLocaleLowerCase();
    return (assignmentCategory === "all" || project.categoria === assignmentCategory) && (!search || `${project.nombre} ${project.area ?? ""}`.toLocaleLowerCase().includes(search));
  });

  function openJurado(jurado?: Jurado) {
    setJuradoDraft(jurado ? { fullName: jurado.fullName, email: jurado.email, phone: jurado.phone ?? "", position: jurado.position ?? "", faculty: jurado.faculty ?? "", active: jurado.active, assignedProjectIds: jurado.assignedProjectIds } : emptyJurado);
    setError("");
    setAssignmentSearch("");
    setAssignmentCategory("all");
    setModal({ kind: "jurado", id: jurado?.id });
  }
  function openProyecto(proyecto?: Proyecto) {
    setProyectoDraft(proyecto ? { nombre: proyecto.nombre, categoriaId: proyecto.categoriaId, area: proyecto.area ?? "", descripcion: proyecto.descripcion ?? "", integrantesRaw: proyecto.integrantesRaw ?? "", numeroIntegrantes: proyecto.numeroIntegrantes?.toString() ?? "", dimensiones: proyecto.dimensiones ?? "", requerimientoTecnico: proyecto.requerimientoTecnico ?? "" } : { nombre: "", categoriaId: categorias[0]?.id ?? "", area: "", descripcion: "", integrantesRaw: "", numeroIntegrantes: "", dimensiones: "", requerimientoTecnico: "" });
    setError("");
    setModal({ kind: "proyecto", id: proyecto?.id });
  }
  function openRubrica(rubrica?: Rubrica) {
    if (rubrica) {
      const categories = rubrica.categorias.map((category) => ({ key: category.id, nombre: category.nombre }));
      setRubricaDraft({ nombre: rubrica.nombre, tipo: rubrica.tipo, categorias: categories, criterios: rubrica.criterios.map((criterion) => ({ nombre: criterion.nombre, descripcion: criterion.descripcion ?? "", pesos: Object.fromEntries(categories.map((category) => [category.key, criterion.pesos.find((weight) => weight.categoriaId === category.key)?.peso ?? 0])) })) });
    } else {
      const key = draftKey();
      setRubricaDraft({ nombre: "", tipo: "STAND_POSTER", categorias: [{ key, nombre: "" }], criterios: [{ nombre: "", descripcion: "", pesos: { [key]: 1 } }] });
    }
    setError("");
    setModal({ kind: "rubrica", id: rubrica?.id });
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
        const message = result.error ?? "No se pudo guardar.";
        setError(message);
        toast.error(message);
        return;
      }
      setModal(null);
      toast.success(method === "DELETE" ? "Evaluación anulada." : "Cambios guardados correctamente.");
      router.refresh();
    } catch {
      const message = "Error de conexión. Inténtalo de nuevo.";
      setError(message);
      toast.error(message);
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
    void send(modal.id ? `/api/admin/proyectos/${modal.id}` : "/api/admin/proyectos", modal.id ? "PATCH" : "POST", { ...proyectoDraft, numeroIntegrantes: proyectoDraft.numeroIntegrantes === "" ? null : Number(proyectoDraft.numeroIntegrantes) });
  }
  function saveRubrica(event: FormEvent) {
    event.preventDefault();
    if (modal?.kind !== "rubrica" || !rubricaDraft) return;
    void send(modal.id ? `/api/admin/rubricas/${modal.id}` : "/api/admin/rubricas", modal.id ? "PATCH" : "POST", rubricaDraft);
  }
  function anularEvaluacion() {
    if (modal?.kind !== "evaluacion") return;
    void send(`/api/admin/evaluaciones/${modal.id}`, "DELETE", { motivo });
  }
  function toggleProjectAssignment(projectId: string) {
    setJuradoDraft((current) => ({
      ...current,
      assignedProjectIds: current.assignedProjectIds.includes(projectId)
        ? current.assignedProjectIds.filter((id) => id !== projectId)
        : [...current.assignedProjectIds, projectId],
    }));
  }
  function deleteJurado(jurado: Jurado) {
    if (jurado.evaluaciones > 0) {
      setError("No se puede eliminar un jurado con evaluaciones registradas.");
      return;
    }
    setError("");
    setJuradoToDelete(jurado);
  }
  async function confirmDeleteJurado() {
    if (!juradoToDelete) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/jurados/${juradoToDelete.id}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json();
        const message = result.error ?? "No se pudo eliminar el jurado.";
        setError(message);
        toast.error(message);
        return;
      }
      setDeletedJuradoIds((current) => new Set([...current, juradoToDelete.id]));
      setJuradoToDelete(null);
      toast.success("Jurado eliminado correctamente.");
      router.refresh();
    } catch {
      const message = "Error de conexión. Inténtalo de nuevo.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }
  async function confirmDeleteProject() {
    if (!proyectoToDelete) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/admin/proyectos/${proyectoToDelete.id}`, { method: "DELETE" });
      if (!response.ok) { const result = await response.json(); throw new Error(result.error ?? "No se pudo eliminar el proyecto."); }
      setProyectoToDelete(null); toast.success("Proyecto eliminado correctamente."); router.refresh();
    } catch (cause) { const message = cause instanceof Error ? cause.message : "Error de conexión. Inténtalo de nuevo."; setError(message); toast.error(message); } finally { setSaving(false); }
  }
  async function confirmDeleteRubrica() {
    if (!rubricaToDelete) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/admin/rubricas/${rubricaToDelete.id}`, { method: "DELETE" });
      if (!response.ok) { const result = await response.json(); throw new Error(result.error ?? "No se pudo eliminar la rúbrica."); }
      setRubricaToDelete(null); toast.success("Rúbrica eliminada correctamente."); router.refresh();
    } catch (cause) { const message = cause instanceof Error ? cause.message : "Error de conexión. Inténtalo de nuevo."; setError(message); toast.error(message); } finally { setSaving(false); }
  }
  function addRubricCategory() {
    if (!rubricaDraft) return;
    const key = draftKey();
    setRubricaDraft({ ...rubricaDraft, categorias: [...rubricaDraft.categorias, { key, nombre: "" }], criterios: rubricaDraft.criterios.map((criterion) => ({ ...criterion, pesos: { ...criterion.pesos, [key]: 0 } })) });
  }
  function removeRubricCategory(key: string) {
    if (!rubricaDraft || rubricaDraft.categorias.length === 1) return;
    setRubricaDraft({ ...rubricaDraft, categorias: rubricaDraft.categorias.filter((category) => category.key !== key), criterios: rubricaDraft.criterios.map((criterion) => { const { [key]: _, ...pesos } = criterion.pesos; return { ...criterion, pesos }; }) });
  }
  function addRubricCriterion() {
    if (!rubricaDraft) return;
    setRubricaDraft({ ...rubricaDraft, criterios: [...rubricaDraft.criterios, { nombre: "", descripcion: "", pesos: Object.fromEntries(rubricaDraft.categorias.map((category) => [category.key, 0])) }] });
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
      toast.success("Evaluaciones exportadas correctamente.");
    } catch {
      const message = "No se pudo exportar el CSV.";
      setError(message);
      toast.error(message);
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

      <div className="flex justify-end"><Button variant="outline" disabled={exporting} onClick={exportCsv}>{exporting ? "Exportando…" : "Exportar evaluaciones CSV"}</Button></div>
      {error && !modal && !juradoToDelete && !proyectoToDelete && !rubricaToDelete && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <section id="jurados" className="space-y-3">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Jurados</h2><p className="text-sm text-muted-foreground">Los nuevos jurados establecen su contraseña en el primer ingreso.</p></div><Button onClick={() => openJurado()}>Agregar jurado</Button></div><div className="grid gap-2 sm:grid-cols-[1fr_auto]"><Input aria-label="Buscar jurado" placeholder="Buscar por nombre, correo, cargo o facultad" value={juradoSearch} onChange={(event) => setJuradoSearch(event.target.value)} /><select aria-label="Filtrar jurados por acceso" value={juradoAccess} onChange={(event) => setJuradoAccess(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="all">Todos los accesos</option><option value="enabled">Puede iniciar sesión</option><option value="pending">Debe crear contraseña</option><option value="blocked">Acceso bloqueado</option></select></div>
        <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Jurado</TableHead><TableHead className="hidden sm:table-cell">Correo</TableHead><TableHead>Acceso</TableHead><TableHead className="text-right">Evaluaciones</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader><TableBody>
          {visibleJurados.map((j) => <TableRow key={j.id}><TableCell className="max-w-52 whitespace-normal font-medium">{j.fullName}<span className="block text-xs font-normal text-muted-foreground sm:hidden">{j.email}</span></TableCell><TableCell className="hidden sm:table-cell">{j.email}</TableCell><TableCell>{j.active ? j.passwordSetAt ? "Puede iniciar sesión" : "Debe crear su contraseña" : "Acceso bloqueado"}</TableCell><TableCell className="text-right">{j.evaluaciones}</TableCell><TableCell className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => openJurado(j)}>Gestionar</Button><Button variant="destructive" size="sm" onClick={() => deleteJurado(j)}>Eliminar</Button></TableCell></TableRow>)}
          {visibleJurados.length === 0 && <TableRow><TableCell colSpan={5}>Sin resultados.</TableCell></TableRow>}
        </TableBody></Table></div>
      </section>

      <section id="proyectos" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Proyectos</h2><p className="text-sm text-muted-foreground">Crea, corrige o retira proyectos pendientes. La categoría queda fija después de la primera evaluación.</p></div><Button onClick={() => openProyecto()}>Agregar proyecto</Button></div><div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]"><Input aria-label="Buscar proyecto" placeholder="Buscar por proyecto, categoría o área" value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} /><select aria-label="Filtrar proyectos por categoría" value={projectCategory} onChange={(event) => setProjectCategory(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="all">Todas las categorías</option>{categorias.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}</select><select aria-label="Filtrar proyectos por evaluación" value={projectEvaluation} onChange={(event) => setProjectEvaluation(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="all">Todos los estados</option><option value="pending">Sin evaluar</option><option value="evaluated">Con evaluaciones</option></select></div>
        <div className="max-h-[34rem] overflow-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Proyecto</TableHead><TableHead className="hidden sm:table-cell">Categoría</TableHead><TableHead className="text-right">Evaluaciones</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader><TableBody>
          {visibleProyectos.map((p) => <TableRow key={p.id}><TableCell className="max-w-sm whitespace-normal font-medium">{p.nombre}<span className="block text-xs font-normal text-muted-foreground sm:hidden">{p.categoria}</span></TableCell><TableCell className="hidden sm:table-cell">{p.categoria}</TableCell><TableCell className="text-right">{p.evaluaciones}</TableCell><TableCell className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => openProyecto(p)}>Editar</Button><Button variant="destructive" size="sm" disabled={p.evaluaciones > 0} title={p.evaluaciones > 0 ? "Anula las evaluaciones antes de eliminar este proyecto" : undefined} onClick={() => { setError(""); setProyectoToDelete(p); }}>Eliminar</Button></TableCell></TableRow>)}
          {visibleProyectos.length === 0 && <TableRow><TableCell colSpan={4}>Sin resultados.</TableCell></TableRow>}
        </TableBody></Table></div>
      </section>

      <section id="rubricas" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Rúbricas y criterios</h2><p className="text-sm text-muted-foreground">Cada categoría debe sumar 100%. Una rúbrica con puntajes se bloquea para preservar el historial.</p></div><Button onClick={() => openRubrica()}>Agregar rúbrica</Button></div>
        <div className="grid gap-3 lg:grid-cols-2">{rubricas.map((rubrica) => <Card key={rubrica.id} size="sm"><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{rubrica.nombre}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{rubrica.tipo === "STAND_POSTER" ? "Stand + póster" : "Elevator pitch"} · {rubrica.categorias.length} categorías · {rubrica.criterios.length} criterios</p></div></div></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap gap-1">{rubrica.categorias.map((category) => <span key={category.id} className="rounded-full bg-muted px-2 py-1 text-xs">{category.nombre} ({category.proyectos})</span>)}</div><p className="text-sm text-muted-foreground">{rubrica.criterios.map((criterion) => criterion.nombre).join(" · ") || "Sin criterios"}</p><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => openRubrica(rubrica)}>Gestionar</Button><Button variant="destructive" size="sm" disabled={rubrica.categorias.some((category) => category.proyectos > 0)} title={rubrica.categorias.some((category) => category.proyectos > 0) ? "Primero elimina o reasigna los proyectos de esta rúbrica" : undefined} onClick={() => { setError(""); setRubricaToDelete(rubrica); }}>Eliminar</Button></div></CardContent></Card>)}{rubricas.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay rúbricas configuradas.</p>}</div>
      </section>

      <section id="evaluaciones" className="space-y-3">
        <div><h2 className="text-lg font-semibold">Evaluaciones vigentes</h2><p className="text-sm text-muted-foreground">Revisa puntajes y anula una evaluación errónea para permitir un nuevo envío.</p></div><Input aria-label="Buscar evaluación" placeholder="Buscar por jurado, correo, proyecto o categoría" value={evaluationSearch} onChange={(event) => setEvaluationSearch(event.target.value)} />
        <div className="max-h-[34rem] overflow-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Jurado</TableHead><TableHead>Proyecto</TableHead><TableHead className="hidden sm:table-cell">Fecha</TableHead><TableHead className="text-right">Puntaje</TableHead><TableHead className="text-right">Acción</TableHead></TableRow></TableHeader><TableBody>
          {visibleEvaluaciones.map((ev) => <TableRow key={ev.id}><TableCell className="max-w-44 whitespace-normal">{ev.jurado.fullName}</TableCell><TableCell className="max-w-56 whitespace-normal">{ev.proyecto.nombre}</TableCell><TableCell className="hidden sm:table-cell">{date(ev.createdAt)}</TableCell><TableCell className="text-right">{ev.scoreTotal.toFixed(2)}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openEvaluacion(ev)}>Ver</Button></TableCell></TableRow>)}
          {visibleEvaluaciones.length === 0 && <TableRow><TableCell colSpan={5}>Aún no hay evaluaciones.</TableCell></TableRow>}
        </TableBody></Table></div>
      </section>

      <section className="space-y-3"><h2 className="text-lg font-semibold">Anulaciones recientes</h2><Input aria-label="Buscar anulación" placeholder="Buscar por jurado, proyecto, administrador o motivo" value={annulledSearch} onChange={(event) => setAnnulledSearch(event.target.value)} /><div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Evaluación</TableHead><TableHead>Motivo</TableHead><TableHead className="hidden sm:table-cell">Administrador</TableHead><TableHead className="hidden md:table-cell">Fecha</TableHead></TableRow></TableHeader><TableBody>
        {visibleAnuladas.map((item) => <TableRow key={item.id}><TableCell className="max-w-64 whitespace-normal">{item.juradoNombre} · {item.proyectoNombre}</TableCell><TableCell className="max-w-sm whitespace-normal">{item.motivo}</TableCell><TableCell className="hidden sm:table-cell">{item.adminEmail}</TableCell><TableCell className="hidden md:table-cell">{date(item.anuladaAt)}</TableCell></TableRow>)}
        {visibleAnuladas.length === 0 && <TableRow><TableCell colSpan={4}>{annulledSearch ? "No hay anulaciones que coincidan con la búsqueda." : "No hay anulaciones."}</TableCell></TableRow>}
      </TableBody></Table></div></section>

      <Dialog open={modal !== null} onOpenChange={(open) => { if (!open && !saving) setModal(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {modal?.kind === "jurado" && <form onSubmit={saveJurado} className="space-y-4"><DialogHeader><DialogTitle>{modal.id ? "Gestionar jurado" : "Agregar jurado"}</DialogTitle><DialogDescription>El correo se usa para el primer ingreso y no se puede cambiar después del registro.</DialogDescription></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Nombre completo" required value={juradoDraft.fullName} onChange={(value) => setJuradoDraft({ ...juradoDraft, fullName: value })} /><Field label="Correo" type="email" required disabled={Boolean(modal.id)} value={juradoDraft.email} onChange={(value) => setJuradoDraft({ ...juradoDraft, email: value })} /><Field label="Teléfono" value={juradoDraft.phone} onChange={(value) => setJuradoDraft({ ...juradoDraft, phone: value })} /><Field label="Cargo" value={juradoDraft.position} onChange={(value) => setJuradoDraft({ ...juradoDraft, position: value })} /><Field label="Facultad" value={juradoDraft.faculty} onChange={(value) => setJuradoDraft({ ...juradoDraft, faculty: value })} /></div>
            {modal.id && <label className="flex items-start gap-2 rounded-md border p-3 text-sm"><input className="mt-0.5" type="checkbox" checked={juradoDraft.active} onChange={(e) => setJuradoDraft({ ...juradoDraft, active: e.target.checked })} /><span><span className="block font-medium">Permitir que este jurado inicie sesión</span><span className="block text-xs text-muted-foreground">Al desactivarlo, no podrá ingresar ni evaluar proyectos.</span></span></label>}<fieldset className="space-y-3"><div className="flex flex-wrap items-baseline justify-between gap-2"><legend className="text-sm font-medium">Proyectos asignados</legend><span className="text-xs text-muted-foreground">{juradoDraft.assignedProjectIds.length} seleccionados</span></div><div className="grid gap-2 sm:grid-cols-[1fr_auto]"><Input aria-label="Buscar proyecto para asignar" placeholder="Buscar proyecto o área" value={assignmentSearch} onChange={(event) => setAssignmentSearch(event.target.value)} /><select aria-label="Filtrar proyectos por categoría" value={assignmentCategory} onChange={(event) => setAssignmentCategory(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="all">Todas las categorías</option>{assignmentCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></div><div className="grid max-h-48 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">{visibleAssignmentProjects.map((project) => <label key={project.id} className="flex items-start gap-2 rounded-sm p-1 text-sm hover:bg-muted"><input className="mt-0.5" type="checkbox" checked={juradoDraft.assignedProjectIds.includes(project.id)} onChange={() => toggleProjectAssignment(project.id)} /><span>{project.nombre}<span className="block text-xs text-muted-foreground">{project.categoria}{project.area ? ` · ${project.area}` : ""}</span></span></label>)}{visibleAssignmentProjects.length === 0 && <p className="col-span-full text-sm text-muted-foreground">No hay proyectos con esos filtros.</p>}</div></fieldset>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => setModal(null)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button></DialogFooter>
          </form>}
          {modal?.kind === "proyecto" && proyectoDraft && <form onSubmit={saveProyecto} className="space-y-4"><DialogHeader><DialogTitle>{modal.id ? "Editar proyecto" : "Agregar proyecto"}</DialogTitle><DialogDescription>La categoría no puede cambiar si el proyecto ya recibió evaluaciones.</DialogDescription></DialogHeader>
            <Field label="Nombre" required value={proyectoDraft.nombre} onChange={(value) => setProyectoDraft({ ...proyectoDraft, nombre: value })} />
            <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm"><span>Categoría</span><select className="h-9 w-full rounded-md border border-input bg-background px-3" value={proyectoDraft.categoriaId} onChange={(e) => setProyectoDraft({ ...proyectoDraft, categoriaId: e.target.value })} disabled={(proyectos.find((p) => p.id === modal.id)?.evaluaciones ?? 0) > 0}>{categorias.map((c) => <option value={c.id} key={c.id}>{c.nombre}</option>)}</select></label><Field label="Área" value={proyectoDraft.area} onChange={(value) => setProyectoDraft({ ...proyectoDraft, area: value })} /><Field label="Número de integrantes" type="number" value={proyectoDraft.numeroIntegrantes} onChange={(value) => setProyectoDraft({ ...proyectoDraft, numeroIntegrantes: value })} /><Field label="Dimensiones" value={proyectoDraft.dimensiones} onChange={(value) => setProyectoDraft({ ...proyectoDraft, dimensiones: value })} /></div>
            <Area label="Descripción" value={proyectoDraft.descripcion} onChange={(value) => setProyectoDraft({ ...proyectoDraft, descripcion: value })} /><Area label="Integrantes (uno por línea)" value={proyectoDraft.integrantesRaw} onChange={(value) => setProyectoDraft({ ...proyectoDraft, integrantesRaw: value })} /><Area label="Requerimiento técnico" value={proyectoDraft.requerimientoTecnico} onChange={(value) => setProyectoDraft({ ...proyectoDraft, requerimientoTecnico: value })} />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => setModal(null)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button></DialogFooter>
          </form>}
          {modal?.kind === "rubrica" && rubricaDraft && <form onSubmit={saveRubrica} className="space-y-5"><DialogHeader><DialogTitle>{modal.id ? "Gestionar rúbrica" : "Agregar rúbrica"}</DialogTitle><DialogDescription>Configura categorías, criterios y sus pesos. Cada columna de categoría debe sumar exactamente 100%.</DialogDescription></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Nombre" required value={rubricaDraft.nombre} onChange={(value) => setRubricaDraft({ ...rubricaDraft, nombre: value })} /><label className="space-y-1.5 text-sm"><span>Modalidad</span><select className="h-9 w-full rounded-md border border-input bg-background px-3" value={rubricaDraft.tipo} onChange={(event) => setRubricaDraft({ ...rubricaDraft, tipo: event.target.value as RubricaDraft["tipo"] })}><option value="STAND_POSTER">Stand + póster</option><option value="ELEVATOR_PITCH">Elevator pitch</option></select></label></div>
            <fieldset className="space-y-2 rounded-lg border p-3"><div className="flex items-center justify-between gap-3"><legend className="text-sm font-medium">Categorías</legend><Button type="button" size="sm" variant="outline" onClick={addRubricCategory}>Agregar categoría</Button></div>{rubricaDraft.categorias.map((category, index) => <div key={category.key} className="flex gap-2"><Input aria-label={`Categoría ${index + 1}`} placeholder="Nombre de categoría" value={category.nombre} onChange={(event) => setRubricaDraft({ ...rubricaDraft, categorias: rubricaDraft.categorias.map((item) => item.key === category.key ? { ...item, nombre: event.target.value } : item) })} required /><Button type="button" variant="outline" size="sm" disabled={rubricaDraft.categorias.length === 1} onClick={() => removeRubricCategory(category.key)}>Quitar</Button></div>)}</fieldset>
            <fieldset className="space-y-3"><div className="flex items-center justify-between gap-3"><legend className="text-sm font-medium">Criterios y pesos</legend><Button type="button" size="sm" variant="outline" onClick={addRubricCriterion}>Agregar criterio</Button></div>{rubricaDraft.criterios.map((criterion, criterionIndex) => <div key={criterionIndex} className="space-y-3 rounded-lg border p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">Criterio {criterionIndex + 1}</p><Button type="button" variant="outline" size="sm" disabled={rubricaDraft.criterios.length === 1} onClick={() => setRubricaDraft({ ...rubricaDraft, criterios: rubricaDraft.criterios.filter((_, index) => index !== criterionIndex) })}>Quitar</Button></div><Field label="Nombre" required value={criterion.nombre} onChange={(value) => setRubricaDraft({ ...rubricaDraft, criterios: rubricaDraft.criterios.map((item, index) => index === criterionIndex ? { ...item, nombre: value } : item) })} /><Area label="Descripción" value={criterion.descripcion} onChange={(value) => setRubricaDraft({ ...rubricaDraft, criterios: rubricaDraft.criterios.map((item, index) => index === criterionIndex ? { ...item, descripcion: value } : item) })} /><div className="grid gap-2 sm:grid-cols-2">{rubricaDraft.categorias.map((category) => <label key={category.key} className="space-y-1 text-xs"><span>{category.nombre || "Categoría sin nombre"} (%)</span><Input aria-label={`Peso de ${criterion.nombre || `criterio ${criterionIndex + 1}`} para ${category.nombre || "categoría"}`} type="number" min="0" max="100" step="0.1" value={Number.isFinite(criterion.pesos[category.key]) ? criterion.pesos[category.key] * 100 : 0} onChange={(event) => { const numeric = event.target.value === "" ? 0 : Number(event.target.value); setRubricaDraft({ ...rubricaDraft, criterios: rubricaDraft.criterios.map((item, index) => index === criterionIndex ? { ...item, pesos: { ...item.pesos, [category.key]: numeric / 100 } } : item) }); }} /></label>)}</div></div>)}</fieldset>
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">{rubricaDraft.categorias.map((category) => <p key={category.key}>{category.nombre || "Categoría"}: {(rubricaDraft.criterios.reduce((sum, criterion) => sum + (criterion.pesos[category.key] ?? 0), 0) * 100).toFixed(1)}%</p>)}</div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setModal(null)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar rúbrica"}</Button></DialogFooter>
          </form>}
          {modal?.kind === "evaluacion" && selectedEvaluacion && <div className="space-y-4"><DialogHeader><DialogTitle>Evaluación</DialogTitle><DialogDescription>{selectedEvaluacion.jurado.fullName} · {selectedEvaluacion.proyecto.nombre} · {date(selectedEvaluacion.createdAt)}</DialogDescription></DialogHeader>
            <div className="space-y-2 rounded-lg border p-3">{selectedEvaluacion.puntajes.map((p) => <div key={p.criterio.nombre} className="flex justify-between gap-3 text-sm"><span>{p.criterio.nombre}</span><strong>{p.puntaje} / 4</strong></div>)}<div className="flex justify-between border-t pt-2 font-semibold"><span>Puntaje total</span><span>{selectedEvaluacion.scoreTotal.toFixed(2)}</span></div></div>
            <div className="space-y-1.5"><Label htmlFor="motivo-anulacion">Motivo de anulación</Label><textarea id="motivo-anulacion" className={fieldClass} maxLength={500} minLength={10} value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Explica el error para dejar un registro de auditoría." /><p className="text-xs text-muted-foreground">Al anularla se retira del ranking y el jurado puede evaluar de nuevo.</p></div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button variant="outline" onClick={() => setModal(null)}>Cerrar</Button><Button variant="destructive" disabled={saving || motivo.trim().length < 10} onClick={anularEvaluacion}>{saving ? "Anulando…" : "Anular evaluación"}</Button></DialogFooter>
          </div>}
        </DialogContent>
      </Dialog>
      <Dialog open={juradoToDelete !== null} onOpenChange={(open) => { if (!open && !saving) setJuradoToDelete(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Eliminar jurado</DialogTitle><DialogDescription>Eliminarás a {juradoToDelete?.fullName}. Esta acción no se puede deshacer.</DialogDescription></DialogHeader>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setJuradoToDelete(null)}>Cancelar</Button><Button type="button" variant="destructive" disabled={saving} onClick={confirmDeleteJurado}>{saving ? "Eliminando…" : "Eliminar jurado"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={proyectoToDelete !== null} onOpenChange={(open) => { if (!open && !saving) setProyectoToDelete(null); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Eliminar proyecto</DialogTitle><DialogDescription>Eliminarás «{proyectoToDelete?.nombre}». Sus asignaciones también se retirarán. Esta acción no se puede deshacer.</DialogDescription></DialogHeader>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setProyectoToDelete(null)}>Cancelar</Button><Button type="button" variant="destructive" disabled={saving} onClick={confirmDeleteProject}>{saving ? "Eliminando…" : "Eliminar proyecto"}</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={rubricaToDelete !== null} onOpenChange={(open) => { if (!open && !saving) setRubricaToDelete(null); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Eliminar rúbrica</DialogTitle><DialogDescription>Eliminarás «{rubricaToDelete?.nombre}», sus categorías y criterios. Esta acción no se puede deshacer.</DialogDescription></DialogHeader>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setRubricaToDelete(null)}>Cancelar</Button><Button type="button" variant="destructive" disabled={saving} onClick={confirmDeleteRubrica}>{saving ? "Eliminando…" : "Eliminar rúbrica"}</Button></DialogFooter></DialogContent></Dialog>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", required = false, disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; disabled?: boolean }) {
  return <label className="space-y-1.5 text-sm"><span>{label}</span><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} disabled={disabled} /></label>;
}
function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block space-y-1.5 text-sm"><span>{label}</span><textarea className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
