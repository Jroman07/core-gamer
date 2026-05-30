import { prisma } from '../../lib/prisma';
import DashboardCharts from './DashboardCharts';

// Forzar renderizado dinámico para ver estadísticas actualizadas siempre
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Obtener todos los clics de la base de datos
  const clicks = await prisma.gameClick.findMany();
  
  // 2. Procesar los datos
  const totalClicks = clicks.length;

  // Agrupar por juego
  const gameCounts: Record<string, number> = {};
  clicks.forEach(c => {
    gameCounts[c.gameName] = (gameCounts[c.gameName] || 0) + 1;
  });

  // Convertir a array y ordenar para el Top 5
  const gameData = Object.entries(gameCounts)
    .map(([name, clicks]) => ({ name, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  // Agrupar por género
  const genreCounts: Record<string, number> = {};
  clicks.forEach(c => {
    // Si viene como "Open World / RPG", tomamos solo "Open World" para no hacer el gráfico ilegible
    const mainGenre = c.genre.split('/')[0].split(',')[0].trim();
    genreCounts[mainGenre] = (genreCounts[mainGenre] || 0) + 1;
  });

  // Convertir a array y ordenar
  const genreData = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Agrupar clics por día (línea temporal)
  const dayCounts: Record<string, number> = {};
  clicks.forEach((c) => {
    const day = new Date(c.createdAt).toISOString().slice(0, 10);
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const timeData = Object.entries(dayCounts)
    .map(([day, clicks]) => ({
      day: day.slice(5), // MM-DD
      clicks,
    }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <DashboardCharts 
        totalClicks={totalClicks}
        gameData={gameData}
        genreData={genreData}
        timeData={timeData}
      />
    </div>
  );
}
