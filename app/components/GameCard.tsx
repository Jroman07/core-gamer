"use client";

import { ExternalLinkIcon, StarIcon, GaugeIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BadgeItem {
  label: string;
  type: "ia" | "pct" | "dest";
}

interface GameCardProps {
  name: string;
  genre: string;
  description: string;
  reason?: string;
  url?: string;
  badges: BadgeItem[];
  compat: { label: string; type: "green" | "yellow" | "red" };
  image?: string | null;
  rating?: number | null;
  released?: string | null;
  estimatedFps?: number;
}

const badgeVariant = {
  ia: "default" as const,
  pct: "secondary" as const,
  dest: "outline" as const,
};

const compatColor = {
  green: "bg-primary",
  yellow: "bg-gold",
  red: "bg-destructive",
};

const compatText = {
  green: "text-primary",
  yellow: "text-gold",
  red: "text-destructive",
};

export default function GameCard({
  name,
  genre,
  description,
  reason,
  url,
  badges,
  compat,
  image,
  rating,
  released,
  estimatedFps,
}: GameCardProps) {
  const handleTrackClick = () => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameName: name, genre, url }),
    }).catch((err) => console.error("Error al registrar click:", err));
  };

  const hostname = (() => {
    if (!url) return null;
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "Sitio Web";
    }
  })();

  const year = released ? released.slice(0, 4) : null;

  return (
    <a
      href={url || "#"}
      target={url ? "_blank" : "_self"}
      rel="noreferrer"
      onClick={handleTrackClick}
      className="block h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden py-0 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(0,229,255,0.08)]">
        {/* Carátula real (RAWG) con fallback elegante */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted to-secondary">
              <span className="font-display text-lg font-bold text-muted-foreground">
                {name}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

          {typeof estimatedFps === "number" && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 backdrop-blur-sm">
              <GaugeIcon className={cn("size-3.5", compatText[compat.type])} />
              <span className="font-display text-xs font-bold text-foreground">
                ~{estimatedFps} FPS
              </span>
            </div>
          )}

          {typeof rating === "number" && rating > 0 && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 backdrop-blur-sm">
              <StarIcon className="size-3.5 fill-gold text-gold" />
              <span className="font-display text-xs font-bold text-foreground">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <CardHeader className="gap-3 pt-4">
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge
                key={badge.label}
                variant={badgeVariant[badge.type]}
                className={cn(
                  badge.type === "pct" && "border-gold/30 bg-gold/20 text-gold",
                  badge.type === "dest" && "border-gold/30 bg-gold/20 text-gold"
                )}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
          <CardTitle className="font-display text-xl">{name}</CardTitle>
          <CardDescription className="text-[11px] font-bold uppercase tracking-widest text-primary">
            {genre}
            {year && <span className="text-muted-foreground"> · {year}</span>}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>

          {reason && (
            <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-2.5">
              <SparklesIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-foreground/90">
                <span className="font-bold text-primary">Por qué para ti: </span>
                {reason}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="mt-auto flex-col items-start gap-3 border-t border-border/60 bg-muted/20 py-4">
          <div
            className={cn(
              "flex items-center gap-2 text-xs font-bold",
              compatText[compat.type]
            )}
          >
            <span className={cn("size-2 rounded-full", compatColor[compat.type])} />
            {compat.label}
          </div>

          {url && hostname && (
            <span className="inline-flex items-center gap-1 text-[11px] tracking-wide text-primary/80 transition-colors group-hover:text-primary">
              {hostname}
              <ExternalLinkIcon className="size-3" />
            </span>
          )}
        </CardFooter>
      </Card>
    </a>
  );
}
