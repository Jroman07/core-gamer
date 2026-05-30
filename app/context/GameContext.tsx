"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Game {
  name: string;
  genre: string;
  description: string;
  reason?: string; // "Por qué este juego" personalizado por la IA
  url?: string;
  badges: { label: string; type: "ia" | "dest" | "pct" }[];
  compat: { label: string; type: "green" | "yellow" | "red" };
  // Calculado por nuestro motor (no por la IA):
  demand?: number; // exigencia del juego 0-100
  estimatedFps?: number;
  // Datos reales desde RAWG:
  image?: string | null;
  rating?: number | null; // 0-5
  released?: string | null;
}

/** Perfil enviado en la última recomendación (para afinar con el chat). */
export interface RequestContext {
  selectedGenres: string[];
  style: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  mood: string;
}

export interface PcScoreInfo {
  score: number;
  tier: string;
  cpuScore: number;
  gpuScore: number;
  ramScore: number;
}

interface GameContextType {
  games: Game[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  pcScore: PcScoreInfo | null;
  setPcScore: React.Dispatch<React.SetStateAction<PcScoreInfo | null>>;
  lastContext: RequestContext | null;
  setLastContext: React.Dispatch<React.SetStateAction<RequestContext | null>>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // Inicialmente vacío, o con algunos por defecto si se quiere
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [pcScore, setPcScore] = useState<PcScoreInfo | null>(null);
  const [lastContext, setLastContext] = useState<RequestContext | null>(null);

  return (
    <GameContext.Provider
      value={{
        games,
        setGames,
        loading,
        setLoading,
        pcScore,
        setPcScore,
        lastContext,
        setLastContext,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
