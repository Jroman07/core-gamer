"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  ClockIcon,
  CpuIcon,
  GamepadIcon,
  LayoutGridIcon,
  SmileIcon,
} from "lucide-react";
import { useGameContext } from "../context/GameContext";
import PcScanner from "./PcScanner";
import PcScoreMeter from "./PcScoreMeter";
import { computePcScore } from "@/lib/gpuBenchmarks";
import { guessCpuLabel } from "@/lib/hardware";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const genres = [
  "RPG",
  "Shooter",
  "Strategy",
  "Open World",
  "Indie",
  "Sports",
  "Horror",
  "Puzzle",
];

const playStyles = ["Competitivo", "Casual", "Cooperativo", "Historia", "Sandbox"];
const ramOptions = ["8 GB", "16 GB", "32 GB", "64 GB"];
const storageOptions = ["SSD NVMe", "SSD SATA", "HDD", "SSD + HDD"];
const moods = [
  { value: "none", label: "Sin preferencia", emoji: "🎮" },
  { value: "estresado, quiero relajarme", label: "Estresado / relajar", emoji: "😮‍💨" },
  { value: "con adrenalina, quiero acción", label: "Con adrenalina", emoji: "🔥" },
  { value: "nostálgico, quiero clásicos", label: "Nostálgico", emoji: "🕹️" },
  { value: "social, para jugar con amigos", label: "Social / con amigos", emoji: "🧑‍🤝‍🧑" },
  { value: "concentrado, quiero un reto", label: "Quiero un reto", emoji: "🧠" },
];

function SectionHeading({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: string;
}) {
  return (
    <CardTitle className="mb-6 flex items-center gap-2 font-display text-xl">
      {icon}
      {children}
    </CardTitle>
  );
}

export default function FormSection() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([
    "Shooter",
    "Open World",
  ]);
  const [style, setStyle] = useState("Competitivo");
  const [mood, setMood] = useState("");
  const [cpu, setCpu] = useState("");
  const [gpu, setGpu] = useState("");
  const [ram, setRam] = useState("16 GB");
  const [storage, setStorage] = useState("SSD NVMe");

  const { setGames, loading, setLoading, setPcScore, setLastContext } =
    useGameContext();

  // PC Score en vivo: se recalcula al cambiar cualquier spec.
  const livePcScore = useMemo(
    () => computePcScore({ cpu, gpu, ram }),
    [cpu, gpu, ram]
  );

  // Persistencia del perfil en localStorage. Se carga tras el montaje (no en el
  // initializer) para evitar mismatch de hidratación entre servidor y cliente.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coregamer:profile");
      if (!saved) return;
      const p = JSON.parse(saved);
      if (Array.isArray(p.selectedGenres)) setSelectedGenres(p.selectedGenres);
      if (p.style) setStyle(p.style);
      if (typeof p.mood === "string") setMood(p.mood);
      if (typeof p.cpu === "string") setCpu(p.cpu);
      if (typeof p.gpu === "string") setGpu(p.gpu);
      if (p.ram) setRam(p.ram);
      if (p.storage) setStorage(p.storage);
    } catch {
      /* noop */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    try {
      localStorage.setItem(
        "coregamer:profile",
        JSON.stringify({ selectedGenres, style, mood, cpu, gpu, ram, storage })
      );
    } catch {
      /* noop */
    }
  }, [selectedGenres, style, mood, cpu, gpu, ram, storage]);

  const handleDetected = (hw: {
    gpu: string;
    ram: string | null;
    cores: number;
  }) => {
    if (hw.gpu) setGpu(hw.gpu);
    // RAM NO se autocompleta: el navegador no puede leer la real (cap 8GB).
    // El usuario la ajusta a mano; mantenemos su valor guardado.
    if (hw.cores && !cpu) setCpu(guessCpuLabel(hw.cores));
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((item) => item !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 0);

    const formData = { selectedGenres, style, mood, cpu, gpu, ram, storage };
    // Guardamos el contexto para que el chat de seguimiento pueda afinar.
    setLastContext(formData);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.games) {
        setGames(data.games);
        if (data.pcScore) setPcScore(data.pcScore);
      } else {
        toast.error(data.error || "Ocurrió un error al conectar con la IA.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al generar recomendaciones.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="form" className="bg-secondary px-4 py-16 md:px-12 md:py-20 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
            Configura tu Perfil de Juego
          </h2>
          <Separator className="w-24 bg-primary" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          <Card variant="glass" className="lg:col-span-8">
            <CardHeader>
              <SectionHeading icon={<LayoutGridIcon className="size-5 text-primary" />}>
                Géneros Favoritos
              </SectionHeading>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {genres.map((genre) => {
                  const active = selectedGenres.includes(genre);
                  return (
                    <Label
                      key={genre}
                      htmlFor={`genre-${genre}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-4 transition-colors",
                        active
                          ? "border-primary bg-accent text-foreground"
                          : "border-border bg-muted/40 hover:border-primary/40"
                      )}
                    >
                      <Checkbox
                        id={`genre-${genre}`}
                        checked={active}
                        onCheckedChange={() => toggleGenre(genre)}
                      />
                      <span className="text-sm font-medium">{genre}</span>
                    </Label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="lg:col-span-4">
            <CardHeader>
              <SectionHeading icon={<ClockIcon className="size-5 text-primary" />}>
                Estilo
              </SectionHeading>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={style}
                onValueChange={(value) => value && setStyle(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Estilo de juego" />
                </SelectTrigger>
                <SelectContent>
                  {playStyles.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <SmileIcon className="size-3.5 text-primary" />
                  ¿Cómo te sientes hoy?
                </Label>
                <Select
                  value={mood === "" ? "none" : mood}
                  onValueChange={(value) =>
                    setMood(value && value !== "none" ? value : "")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Estado de ánimo" />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.emoji} {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="px-1 text-xs text-muted-foreground">
                  La IA ajusta el tono de las recomendaciones a tu ánimo.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="relative overflow-hidden lg:col-span-12">
            <CpuIcon className="pointer-events-none absolute right-0 top-0 size-28 text-primary/10" />
            <CardHeader>
              <SectionHeading icon={<CpuIcon className="size-5 text-primary" />}>
                Especificaciones de PC
              </SectionHeading>
            </CardHeader>
            <CardContent className="space-y-8">
              <PcScanner onDetected={handleDetected} />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="cpu"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Procesador (CPU)
                  </Label>
                  <Input
                    id="cpu"
                    value={cpu}
                    onChange={(e) => setCpu(e.target.value)}
                    placeholder="i7-12700K / Ryzen 7"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="gpu"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Gráficos (GPU)
                  </Label>
                  <Input
                    id="gpu"
                    value={gpu}
                    onChange={(e) => setGpu(e.target.value)}
                    placeholder="RTX 3080 / RX 6800"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Memoria RAM
                  </Label>
                  <Select
                    value={ram}
                    onValueChange={(value) => value && setRam(value)}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ramOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Almacenamiento
                  </Label>
                  <Select
                    value={storage}
                    onValueChange={(value) => value && setStorage(value)}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {storageOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <PcScoreMeter pc={livePcScore} />

              <div className="flex justify-center">
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  disabled={loading}
                  className="min-w-64"
                >
                  {loading ? "Analizando..." : "Generar recomendaciones"}
                  {!loading && <ArrowRightIcon className="size-5" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Acceso a las herramientas extra (página dedicada). */}
        <div className="flex justify-center">
          <Link
            href="/herramientas"
            className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-5 py-3 font-display text-sm font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
          >
            <GamepadIcon className="size-4" />
            Arcade y mejora de PC
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
