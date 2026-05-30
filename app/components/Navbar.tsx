"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MenuIcon, GamepadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", id: "hero" },
  { label: "Recomendaciones", id: "form" },
  { label: "Explorar", id: "results" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("hero");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setActiveId(id);
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      // Estamos en otra ruta: vamos a la home apuntando a la sección.
      window.location.assign(`/#${id}`);
    }
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {NAV_ITEMS.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          onClick={() => scrollTo(item.id)}
          className={cn(
            "font-display text-sm font-bold uppercase tracking-tight",
            mobile ? "h-11 w-full justify-start text-base" : "h-auto px-0 py-1.5",
            activeId === item.id
              ? "text-primary"
              : "text-foreground hover:text-primary"
          )}
        >
          <span
            className={cn(
              "border-b-2 pb-1",
              activeId === item.id ? "border-primary" : "border-transparent"
            )}
          >
            {item.label}
          </span>
        </Button>
      ))}
      <Link
        href="/herramientas"
        onClick={() => setOpen(false)}
        className={cn(
          "inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-tight text-primary hover:text-primary/80",
          mobile ? "h-11 w-full justify-start text-base" : "py-1.5"
        )}
      >
        <GamepadIcon className="size-4" />
        Herramientas
      </Link>
    </>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors",
        scrolled
          ? "border-primary/10 bg-background/95 shadow-[0_20px_40px_rgba(0,229,255,0.06)]"
          : "border-transparent bg-background/80"
      )}
    >
      <nav className="mx-auto flex max-w-7xl flex-row items-center justify-between gap-4 px-6 py-4 md:px-12">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-primary"
        >
          COREGAMER
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLinks />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Abrir menú"
              />
            }
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xs border-border bg-background">
            <SheetHeader>
              <SheetTitle className="font-display text-left text-primary">
                Menú
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4">
              <NavLinks mobile />
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
