"use client";

import { useState } from "react";
import { ScanLineIcon, CheckCircle2Icon } from "lucide-react";
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
  "Contando núcleos del procesador...",
  "Estimando memoria del sistema...",
  "Calculando potencia gráfica...",
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
      await new Promise((r) => setTimeout(r, 420));
    }

    const hw = detectHardware();
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
              Detecta tu hardware automáticamente desde el navegador.
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
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-primary">
            <CheckCircle2Icon className="size-4" /> Detectado
          </span>
          <span className="text-muted-foreground">
            GPU: <strong className="text-foreground">{result.gpu || "Oculta"}</strong>
          </span>
          <span className="text-muted-foreground">
            Núcleos: <strong className="text-foreground">{result.cpuCores || "?"}</strong>
          </span>
          <span className="text-muted-foreground">
            RAM aprox:{" "}
            <strong className="text-foreground">
              {result.ramGb ? `${result.ramGb}GB+` : "?"}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}
