"use client";

/**
 * Chat de seguimiento: tras una recomendación, el usuario afina sin rehacer el
 * formulario ("más baratos", "menos violentos", "multijugador"...). Reusa el
 * contexto guardado (lastContext) y los juegos actuales para que /api/refine
 * devuelva 4 nuevos que cumplan la petición.
 */

import { useState } from "react";
import { SendIcon, SparklesIcon } from "lucide-react";
import { useGameContext } from "../context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const QUICK = [
  "Más baratos",
  "Menos violentos",
  "Más cortos",
  "Multijugador",
  "Que pesen menos en mi PC",
  "Más recientes",
];

export default function RefineChat() {
  const { games, setGames, setPcScore, lastContext, loading, setLoading } =
    useGameContext();
  const [message, setMessage] = useState("");

  if (!lastContext || games.length === 0) return null;

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: lastContext,
          previousGames: games.map((g) => g.name),
          message: msg,
        }),
      });
      const data = await res.json();
      if (res.ok && data.games) {
        setGames(data.games);
        if (data.pcScore) setPcScore(data.pcScore);
        toast.success("Recomendaciones afinadas.");
        setTimeout(() => {
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
        }, 0);
      } else {
        toast.error(data.error || "No se pudo afinar la búsqueda.");
      }
    } catch {
      toast.error("Error de conexión al afinar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="glass" className="mb-10 flex flex-col gap-4 p-5 md:mb-12">
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-5 text-primary" />
        <p className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
          Afina tus recomendaciones
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => send(q)}
            className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-foreground transition-colors hover:border-primary hover:bg-primary/10 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(message);
        }}
        className="flex gap-2"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Pide un ajuste: 'algo como Hollow Knight pero coop'..."
          disabled={loading}
          className="h-11"
          maxLength={300}
        />
        <Button
          type="submit"
          variant="gradient"
          disabled={loading || !message.trim()}
          className="h-11 shrink-0"
        >
          {loading ? "Afinando..." : <SendIcon className="size-4" />}
        </Button>
      </form>
    </Card>
  );
}
