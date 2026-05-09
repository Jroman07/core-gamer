"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Game {
  name: string;
  genre: string;
  description: string;
  url?: string;
  badges: { label: string; type: "ia" | "dest" | "pct" }[];
  compat: { label: string; type: "green" | "yellow" | "red" };
}

interface GameContextType {
  games: Game[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // Inicialmente vacío, o con algunos por defecto si se quiere
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <GameContext.Provider value={{ games, setGames, loading, setLoading }}>
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
