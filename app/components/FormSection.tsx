"use client";

import { useState } from "react";
import {
  ArrowRightIcon,
  ClockIcon,
  CpuIcon,
  LayoutGridIcon,
} from "lucide-react";
import { useGameContext } from "../context/GameContext";
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
  const [cpu, setCpu] = useState("");
  const [gpu, setGpu] = useState("");
  const [ram, setRam] = useState("16 GB");
  const [storage, setStorage] = useState("SSD NVMe");

  const { setGames, loading, setLoading } = useGameContext();

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

    const formData = { selectedGenres, style, cpu, gpu, ram, storage };

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.games) {
        setGames(data.games);
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
              <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                <span className="size-2.5 rounded-full border border-muted-foreground" />
                Ajusta la dificultad sugerida
              </p>
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
      </div>
    </section>
  );
}
