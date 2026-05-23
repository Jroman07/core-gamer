"use client";

import { ExternalLinkIcon } from "lucide-react";
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
  url?: string;
  badges: BadgeItem[];
  compat: { label: string; type: "green" | "yellow" | "red" };
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

export default function GameCard({
  name,
  genre,
  description,
  url,
  badges,
  compat,
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

  return (
    <a
      href={url || "#"}
      target={url ? "_blank" : "_self"}
      rel="noreferrer"
      onClick={handleTrackClick}
      className="block h-full"
    >
      <Card className="group flex h-full flex-col transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(0,229,255,0.08)]">
      <CardHeader className="gap-3">
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
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>

      <CardFooter className="mt-auto flex-col items-start gap-3 border-t border-border/60 bg-muted/20">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <span
            className={cn("size-2 rounded-full", compatColor[compat.type])}
          />
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
