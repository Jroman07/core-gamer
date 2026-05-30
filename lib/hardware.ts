/**
 * Deteccion de hardware del navegador (client-side). No es 100% precisa por las
 * restricciones de privacidad del navegador, pero permite autocompletar el
 * formulario en 1 clic, que es el "wow" de la demo.
 *
 * LIMITACION IMPORTANTE — RAM: no existe ninguna API web que devuelva la RAM
 * instalada real. `navigator.deviceMemory` solo existe en Chromium y la spec lo
 * limita (cap) a 8 GB por privacidad: una maquina con 16/32/64/128 GB SIEMPRE
 * reporta 8. En Safari/Firefox ni siquiera existe. Por eso la RAM se trata como
 * un "minimo estimado" y el usuario puede corregirla a mano.
 */

export interface DetectedHardware {
  gpu: string;
  cpuCores: number;
  /** deviceMemory crudo (Chromium, cap 8GB). null si el navegador no lo expone. */
  ramGb: number | null;
  /** true si el valor de RAM puede estar topado/subreportado (casi siempre). */
  ramCapped: boolean;
  os: { name: string; version: string };
  /** Plataforma desde User-Agent Client Hints de alta entropia (Chromium). */
  platform: string;
  /** Arquitectura: "arm" | "x86" | "". */
  arch: string;
  /** Bits: "64" | "32" | "". */
  bitness: string;
  /** Modelo del dispositivo (movil sobre todo). */
  deviceModel: string;
  /** Chip inferido del renderer GPU, ej "Apple M2". */
  chip: string;
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

/** Extrae el chip Apple Silicon ("Apple M2 Pro") del renderer de WebGL. */
export function detectChip(renderer: string | null): string {
  if (!renderer) return "";
  const m = renderer.match(/Apple\s*M\d+(\s*(Pro|Max|Ultra))?/i);
  return m ? m[0].replace(/\s+/g, " ").trim() : "";
}

/**
 * Detecta SO y version desde el User-Agent (sincrono, funciona en todos los
 * navegadores). En Mac la version queda "congelada" por Apple (10.15.7).
 */
export function detectOs(): { name: string; version: string } {
  if (typeof navigator === "undefined") return { name: "", version: "" };
  const ua = navigator.userAgent;

  // Windows
  const win = ua.match(/Windows NT ([\d.]+)/);
  if (win) {
    const map: Record<string, string> = {
      "10.0": "10/11",
      "6.3": "8.1",
      "6.2": "8",
      "6.1": "7",
    };
    return { name: "Windows", version: map[win[1]] || win[1] };
  }
  // iOS / iPadOS (antes que macOS por el UA de iPad)
  const ios = ua.match(/OS (\d+[_.]\d+([_.]\d+)?) like Mac OS X/);
  if (/iPhone|iPad|iPod/.test(ua) || ios) {
    return { name: "iOS / iPadOS", version: ios ? ios[1].replace(/_/g, ".") : "" };
  }
  // macOS
  const mac = ua.match(/Mac OS X (\d+[_.]\d+([_.]\d+)?)/);
  if (/Macintosh|Mac OS X/.test(ua)) {
    return { name: "macOS", version: mac ? mac[1].replace(/_/g, ".") : "" };
  }
  // Android
  const android = ua.match(/Android (\d+(\.\d+)?)/);
  if (android) return { name: "Android", version: android[1] };
  // Linux (despues de Android, que tambien lleva "Linux")
  if (/Linux/.test(ua)) return { name: "Linux", version: "" };

  return { name: "Desconocido", version: "" };
}

interface UaHighEntropy {
  platform?: string;
  platformVersion?: string;
  architecture?: string;
  bitness?: string;
  model?: string;
}

interface NavigatorUAData {
  getHighEntropyValues?: (hints: string[]) => Promise<UaHighEntropy>;
}

/**
 * User-Agent Client Hints de alta entropia (solo Chromium). Da plataforma,
 * arquitectura (arm/x86), bits y modelo con mas fiabilidad que el UA clasico.
 */
async function detectHighEntropy(): Promise<UaHighEntropy> {
  if (typeof navigator === "undefined") return {};
  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData })
    .userAgentData;
  if (!uaData?.getHighEntropyValues) return {};
  try {
    return await uaData.getHighEntropyValues([
      "platform",
      "platformVersion",
      "architecture",
      "bitness",
      "model",
    ]);
  } catch {
    return {};
  }
}

function readDeviceMemory(): number | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & { deviceMemory?: number };
  return typeof nav.deviceMemory === "number" ? nav.deviceMemory : null;
}

/** Deteccion completa (async para poder leer los Client Hints de alta entropia). */
export async function detectHardware(): Promise<DetectedHardware> {
  const raw = detectGpu();
  const cpuCores =
    typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 0 : 0;
  const ramGb = readDeviceMemory();
  const highEntropy = await detectHighEntropy();

  return {
    gpu: cleanGpuName(raw.renderer),
    cpuCores,
    ramGb,
    // deviceMemory esta topado a 8GB por spec; cualquier valor es un piso.
    ramCapped: ramGb === null || ramGb >= 8,
    os: detectOs(),
    platform: highEntropy.platform || "",
    arch: highEntropy.architecture || "",
    bitness: highEntropy.bitness || "",
    deviceModel: highEntropy.model || "",
    chip: detectChip(raw.renderer),
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

/**
 * Aproxima la opcion de RAM mas cercana a partir de deviceMemory.
 *
 * OJO: deviceMemory llega topado a 8GB. NO inflamos el valor (antes 8 -> "16 GB",
 * lo que mentia en Macs de 32GB). Devolvemos el piso real que el navegador
 * permite ver; el usuario corrige a mano si tiene mas.
 */
export function guessRamOption(ramGb: number | null): string | null {
  if (!ramGb) return null;
  if (ramGb >= 8) return "8 GB"; // piso: el navegador no puede ver mas
  if (ramGb >= 4) return "8 GB";
  return "8 GB";
}
