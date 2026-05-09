"use client";
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface ChartProps {
  totalClicks: number;
  gameData: { name: string; clicks: number }[];
  genreData: { name: string; value: number }[];
}

const COLORS = ['#00e5ff', '#849396', '#00b3cc', '#ff4d4d', '#e9c349'];

export default function DashboardCharts({ totalClicks, gameData, genreData }: ChartProps) {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--text-primary)', marginBottom: '8px' }}>
        Estadísticas de Recomendaciones
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '18px' }}>
        Total de interacciones registradas: <strong style={{ color: 'var(--accent)' }}>{totalClicks}</strong>
      </p>

      {totalClicks === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid rgba(132,147,150,0.15)' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '16px' }}>Todavía no hay datos. Haz clic en algunas tarjetas de juegos para generar estadísticas.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          {/* Gráfico de Barras: Top Juegos */}
          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(132,147,150,0.15)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Juegos Más Populares (Top 5)
            </h2>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gameData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,147,150,0.1)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 229, 255, 0.1)' }}
                    contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--accent)', fontWeight: 700 }}
                  />
                  <Bar dataKey="clicks" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico Circular: Distribución de Géneros */}
          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(132,147,150,0.15)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Distribución por Géneros
            </h2>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend wrapperStyle={{ color: 'var(--text-dim)', fontSize: 14 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
