import { Heart } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-background/95 px-4 py-3.5 text-xs text-muted-foreground backdrop-blur-sm supports-backdrop-filter:bg-background/80 sm:px-6 lg:px-8">
      <span className="font-medium text-foreground">Demo Mode 2026</span>
      <span className="inline-flex items-center gap-1">
        made with <Heart className="size-3 fill-current text-destructive" /> by{" "}
        <a
          href="https://github.com/Fabrizzio20k/Fabrizzio20k"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:underline"
        >
          Fabrizzio20k
        </a>
      </span>
    </footer>
  );
}
