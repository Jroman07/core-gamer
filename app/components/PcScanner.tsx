"use client";

import { useState } from "react";
import {
  ScanLineIcon,
  CheckCircle2Icon,
  MonitorIcon,
  CpuIcon,
  MemoryStickIcon,
  GpuIcon,
  InfoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { detectHardware, guessRamOption, type DetectedHardware } from "@/lib/hardware";

interface Props {
  onDetected: (hw: {
    gpu: string;
    ram: string | null;
    cores: number;
  }) => void;
}

const STEPS = [
  "Inicializando contexto WebGL...",
  "Leyendo GPU (WEBGL_debug_renderer_info)...",
  "Detectando sistema operativo...",
  "Contando núcleos del procesador...",
  "Leyendo Client Hints (plataforma/arquitectura)...",
  "Estimando memoria del sistema...",
];

export default function PcScanner({ onDetected }: Props) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [result, setResult] = useState<DetectedHardware | null>(null);

  const runScan = async () => {
    if (scanning) return;
    setScanning(true);
    setResult(null);
    setProgress(0);

    // Animación tipo benchmark mientras "escanea".
    for (let i = 0; i < STEPS.length; i++) {
      setStep(STEPS[i]);
      setProgress(Math.round(((i + 1) / STEPS.length) * 100));
      await new Promise((r) => setTimeout(r, 380));
    }

    const hw = await detectHardware();
    setResult(hw);
    setScanning(false);

    onDetected({
      gpu: hw.gpu,
      ram: guessRamOption(hw.ramGb),
      cores: hw.cpuCores,
    });

    if (hw.gpu) {
      toast.success(`GPU detectada: ${hw.gpu}`);
    } else {
      toast.message("Escaneo completo", {
        description:
          "Tu navegador ocultó la GPU. Completa las specs manualmente para mayor precisión.",
      });
    }
  };

  const os = result?.os.name
    ? `${result.os.name}${result.os.version ? ` ${result.os.version}` : ""}`
    : "Desconocido";
  const cpuLabel =
    result?.chip ||
    (result?.arch
      ? `${result.arch}${result.bitness ? ` ${result.bitness}-bit` : ""}`
      : "");

  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ScanLineIcon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-display text-sm font-bold text-foreground">
              Escáner de PC
            </p>
            <p className="text-xs text-muted-foreground">
              Detecta SO, GPU, CPU y arquitectura desde el navegador.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={runScan}
          disabled={scanning}
          className="shrink-0 border-primary/40 text-primary hover:bg-primary/10"
        >
          {scanning ? "Escaneando..." : "Escanear mi PC"}
        </Button>
      </div>

      {scanning && (
        <div className="mt-4 space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="font-mono text-[11px] text-primary/80">{step}</p>
        </div>
      )}

      {result && !scanning && (
        <div className="mt-4 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
            <CheckCircle2Icon className="size-4" /> Detectado
          </span>

          <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
            <SpecRow
              icon={<MonitorIcon className="size-3.5" />}
              label="Sistema operativo"
              value={os}
            />
            <SpecRow
              icon={<GpuIcon className="size-3.5" />}
              label="GPU"
              value={result.gpu || "Oculta por el navegador"}
            />
            <SpecRow
              icon={<CpuIcon className="size-3.5" />}
              label="CPU"
              value={
                [
                  result.cpuCores ? `${result.cpuCores} núcleos` : null,
                  cpuLabel || null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "?"
              }
            />
            <SpecRow
              icon={<MemoryStickIcon className="size-3.5" />}
              label="RAM (estimada)"
              value={
                result.ramGb
                  ? `${result.ramGb} GB${result.ramCapped ? "+" : ""}`
                  : "No expuesta"
              }
            />
          </div>

          <p className="flex items-start gap-1.5 rounded bg-muted/50 p-2 text-[11px] leading-relaxed text-muted-foreground">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Ningún navegador puede leer la RAM real instalada (
              <code className="font-mono">deviceMemory</code> está topado a 8 GB
              por privacidad y no existe en Safari/Firefox). Si tienes más,
              ajústala a mano en el campo de abajo.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function SpecRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <strong className="truncate text-foreground">{value}</strong>
    </div>
  );
}
