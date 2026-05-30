/**
 * Deteccion de hardware del navegador (client-side). No es 100% precisa por las
 * restricciones de privacidad del navegador, pero permite autocompletar el
 * formulario en 1 clic, que es el "wow" de la demo.
 */

export interface DetectedHardware {
  gpu: string;
  cpuCores: number;
  ramGb: number | null;
  raw: { renderer: string | null; vendor: string | null };
}

/** Lee el nombre real de la GPU usando la extension WEBGL_debug_renderer_info. */
export function detectGpu(): { renderer: string | null; vendor: string | null } {
  if (typeof document === "undefined") return { renderer: null, vendor: null };
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return { renderer: null, vendor: null };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return { renderer: null, vendor: null };
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string;
    return { renderer: renderer || null, vendor: vendor || null };
  } catch {
    return { renderer: null, vendor: null };
  }
}

/**
 * Limpia el string crudo de WebGL ("ANGLE (NVIDIA, NVIDIA GeForce RTX 3060
 * Direct3D11 vs_5_0 ps_5_0)") y extrae algo legible tipo "GeForce RTX 3060".
 */
export function cleanGpuName(raw: string | null): string {
  if (!raw) return "";
  let s = raw;
  // ANGLE wrapper
  const angle = s.match(/ANGLE\s*\(([^)]*)\)/i);
  if (angle) s = angle[1];
  // quitar APIs/sufijos tecnicos
  s = s
    .replace(/Direct3D\d+.*$/i, "")
    .replace(/vs_\d+.*$/i, "")
    .replace(/\(0x[0-9a-f]+\)/gi, "")
    .replace(/OpenGL.*$/i, "")
    .replace(/Metal.*$/i, "");
  // tomar el fragmento que contiene la marca conocida
  const parts = s.split(/,|\//).map((p) => p.trim());
  const brandy = parts.find((p) =>
    /(geforce|rtx|gtx|radeon|\brx\b|arc|apple\s*m|iris|intel)/i.test(p)
  );
  return (brandy || parts[parts.length - 1] || s).trim();
}

export function detectHardware(): DetectedHardware {
  const raw = detectGpu();
  const cpuCores =
    typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 0 : 0;
  // deviceMemory solo existe en Chromium y viene redondeado (capped a 8GB)
  const ramGb =
    typeof navigator !== "undefined" &&
    "deviceMemory" in navigator &&
    typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory ===
      "number"
      ? ((navigator as Navigator & { deviceMemory?: number })
          .deviceMemory as number)
      : null;

  return {
    gpu: cleanGpuName(raw.renderer),
    cpuCores,
    ramGb,
    raw,
  };
}

/** Mapea numero de nucleos a una etiqueta de CPU aproximada para el form. */
export function guessCpuLabel(cores: number): string {
  if (!cores) return "";
  if (cores >= 16) return "CPU de 16+ núcleos (gama alta)";
  if (cores >= 12) return "CPU de 12 núcleos (gama alta)";
  if (cores >= 8) return "CPU de 8 núcleos (gama media-alta)";
  if (cores >= 6) return "CPU de 6 núcleos (gama media)";
  if (cores >= 4) return "CPU de 4 núcleos (gama baja)";
  return `CPU de ${cores} núcleos`;
}

/** Aproxima la opcion de RAM mas cercana a partir de deviceMemory. */
export function guessRamOption(ramGb: number | null): string | null {
  if (!ramGb) return null;
  // deviceMemory llega capped a 8 -> si reporta 8, asumimos "16 GB" como mínimo realista
  if (ramGb >= 8) return "16 GB";
  if (ramGb >= 4) return "8 GB";
  return "8 GB";
}
