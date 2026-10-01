"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Trophy, LogOut, LogIn, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/proyectos", label: "Proyectos", icon: LayoutGrid },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/perfil", label: "Perfil", icon: User },
] as const;

export function AppHeader({ juradoName }: { juradoName?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-background/95 px-4 py-3.5 backdrop-blur-sm supports-backdrop-filter:bg-background/80 sm:px-6 lg:px-8">
      <div aria-hidden />

      <nav className="flex items-center gap-1 rounded-full border bg-muted/40 p-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
        <ThemeToggle className="ml-1 rounded-full border-none shadow-none" />
        {juradoName && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={handleLogout}
            aria-label="Salir"
          >
            <LogOut className="size-4" />
          </Button>
        )}
      </nav>

      <div className="flex items-center justify-end gap-2 text-sm">
        {!juradoName && (
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <LogIn className="size-4" />
            <span className="hidden sm:inline">Ingresar</span>
          </Link>
        )}
      </div>
    </header>
  );
}
