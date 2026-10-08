"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppFooter } from "@/components/app-footer";
import { ThemeToggle } from "@/components/theme-toggle";

type Step = "email" | "password" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  async function request(url: string, body: unknown) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "No se pudo continuar.");
    return data;
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await request("/api/auth/check-email", { email });

      if (data.firstLogin) {
        router.push("/set-password");
        return;
      }

      setStep("password");
      requestAnimationFrame(() => passwordInputRef.current?.focus());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Ocurrió un error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await request("/api/auth/login", { email, password });

      router.push(data.jurado.role === "ADMIN" ? "/admin" : "/proyectos");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Ocurrió un error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await request("/api/auth/request-password-reset", { email });
      const data = await request("/api/auth/set-password", { password: newPassword, confirmPassword });
      router.push(data.jurado.role === "ADMIN" ? "/admin" : "/proyectos");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Ocurrió un error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function changeStep(nextStep: Step) {
    setStep(nextStep);
    setPassword("");
    setError(null);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel izquierdo con imagen (oculto en mobile) */}
      <div className="relative hidden lg:block">
        <Image
          src="/utec.webp"
          alt="UTEC"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 p-10 text-white">
          <p className="text-sm font-medium tracking-wide text-white/80 uppercase">
            Demo Mode 2026
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Evaluación de jurados</h2>
        </div>
      </div>

      {/* Panel derecho con el formulario */}
      <div className="flex flex-col">
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>

        <main className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                Demo Mode 2026
              </p>
            </div>

            <h1 className="text-2xl font-semibold">{step === "reset" ? "Restablecer contraseña" : "Ingreso"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{step === "reset" ? "Confirma tu correo y define una nueva contraseña." : "Ingresa tu correo registrado para continuar."}</p>
            <div className="mt-8 overflow-hidden"><AnimatePresence mode="wait" initial={false}>
              {step === "email" && <motion.form key="email" onSubmit={handleEmailSubmit} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.28, ease: "easeInOut" }} className="flex flex-col gap-4"><label className="flex flex-col gap-1.5"><Label htmlFor="email">Correo</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={loading}>{loading ? "Cargando…" : "Continuar"}</Button></motion.form>}
              {step === "password" && <motion.form key="password" onSubmit={handlePasswordSubmit} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.28, ease: "easeInOut" }} className="flex flex-col gap-4"><label className="flex flex-col gap-1.5"><Label htmlFor="current-email">Correo</Label><Input id="current-email" type="email" value={email} disabled /></label><label className="flex flex-col gap-1.5"><Label htmlFor="password">Contraseña</Label><Input ref={passwordInputRef} id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={loading}>{loading ? "Ingresando…" : "Ingresar"}</Button><div className="flex justify-between gap-3 text-sm"><button type="button" onClick={() => changeStep("email")} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Usar otro correo</button><button type="button" onClick={() => changeStep("reset")} className="text-primary underline-offset-4 hover:underline">Olvidé mi contraseña</button></div></motion.form>}
              {step === "reset" && <motion.form key="reset" onSubmit={handleResetSubmit} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.28, ease: "easeInOut" }} className="flex flex-col gap-4"><label className="flex flex-col gap-1.5"><Label htmlFor="reset-email">Correo</Label><Input id="reset-email" type="email" value={email} disabled /></label><label className="flex flex-col gap-1.5"><Label htmlFor="new-password">Nueva contraseña</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label><label className="flex flex-col gap-1.5"><Label htmlFor="confirm-password">Repetir contraseña</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={loading}>{loading ? "Actualizando…" : "Restablecer contraseña"}</Button><button type="button" onClick={() => changeStep("password")} className="w-fit text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Volver al ingreso</button></motion.form>}
            </AnimatePresence></div>
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
