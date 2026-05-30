"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChartProps {
  totalClicks: number;
  gameData: { name: string; clicks: number }[];
  genreData: { name: string; value: number }[];
  timeData: { day: string; clicks: number }[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function DashboardCharts({
  totalClicks,
  gameData,
  genreData,
  timeData,
}: ChartProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-5 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Estadísticas de Recomendaciones
        </h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">
          Total de interacciones registradas:{" "}
          <strong className="text-primary">{totalClicks}</strong>
        </p>
      </div>

      {totalClicks === 0 ? (
        <Card variant="glass">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Todavía no hay datos. Haz clic en algunas tarjetas de juegos para
              generar estadísticas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="font-display">
                Juegos Más Populares (Top 5)
              </CardTitle>
              <CardDescription>Clics por título recomendado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={gameData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(132,147,150,0.1)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0, 229, 255, 0.1)" }}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid rgba(0, 229, 255, 0.3)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                      itemStyle={{ color: "var(--primary)", fontWeight: 700 }}
                    />
                    <Bar
                      dataKey="clicks"
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="font-display">
                Distribución por Géneros
              </CardTitle>
              <CardDescription>Preferencias de los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
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
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid rgba(0, 229, 255, 0.3)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        color: "var(--muted-foreground)",
                        fontSize: 14,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display">
                Actividad en el Tiempo
              </CardTitle>
              <CardDescription>Clics registrados por día</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(132,147,150,0.1)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid rgba(0, 229, 255, 0.3)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                      itemStyle={{ color: "var(--primary)", fontWeight: 700 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#fillClicks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
