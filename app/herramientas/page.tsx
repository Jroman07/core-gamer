"use client";

/**
 * Página exclusiva para las herramientas extra (Arcade + Asesor de upgrade), así
 * el formulario principal queda limpio. Lee el perfil guardado en localStorage
 * (coregamer:profile) para conocer las specs y calcular el Pc Score con nuestro
 * motor; si no hay perfil aún, usa valores por defecto.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GamepadIcon, WrenchIcon, ArrowLeftIcon, SlidersHorizontalIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PcScoreMeter from "../components/PcScoreMeter";
import UpgradeAdvisor from "../components/UpgradeAdvisor";
import PcArcade from "../components/PcArcade";
import { computePcScore } from "@/lib/gpuBenchmarks";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Specs {
  cpu: string;
  gpu: string;
  ram: string;
}

export default function HerramientasPage() {
  const [specs, setSpecs] = useState<Specs>({ cpu: "", gpu: "", ram: "16 GB" });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coregamer:profile");
      if (!saved) return;
      const p = JSON.parse(saved);
      setSpecs({
        cpu: typeof p.cpu === "string" ? p.cpu : "",
        gpu: typeof p.gpu === "string" ? p.gpu : "",
        ram: typeof p.ram === "string" ? p.ram : "16 GB",
      });
    } catch {
      /* noop */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const pc = useMemo(() => computePcScore(specs), [specs]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-28 md:px-12 md:py-32">
        <div className="mb-10 flex flex-col gap-4">
          <Link
            href="/#form"
            className="inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeftIcon className="size-4" />
            Volver al perfil
          </Link>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
            Herramientas
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Juega en CoreGamer Cloud y descubre cómo mejorar tu PC. Todo se calcula
            con las specs de tu perfil.
          </p>
          <Separator className="w-24 bg-primary" />
        </div>

        {/* Specs actuales */}
        <div className="mb-10 flex flex-col gap-3">
          <PcScoreMeter pc={pc} />
          <Link
            href="/#form"
            className="inline-flex w-fit items-center gap-1.5 text-xs text-primary underline-offset-2 hover:underline"
          >
            <SlidersHorizontalIcon className="size-3.5" />
            Ajustar mis specs en Recomendaciones
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card variant="glass" className="p-6">
            <h2 className="mb-6 flex items-center gap-2 font-display text-xl">
              <WrenchIcon className="size-5 text-gold" />
              Mejora tu PC
            </h2>
            <UpgradeAdvisor cpu={specs.cpu} gpu={specs.gpu} ram={specs.ram} />
          </Card>

          <Card variant="glass" className="p-6">
            <h2 className="mb-6 flex items-center gap-2 font-display text-xl">
              <GamepadIcon className="size-5 text-primary" />
              Arcade
            </h2>
            <PcArcade pcScore={pc.score} />
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
