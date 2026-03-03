"use client";

import { Clock, Droplets, CloudRain, CloudOff, Snowflake } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  forecast: any[];
}

export default function ForecastCard({ forecast }: Props) {
  if (!forecast || forecast.length === 0) return null;

  const isSnow = forecast[0]?.weather[0]?.main?.toLowerCase() === "snow";

  // Lógica de lluvia y nieve
  const currentStatus = forecast[0];
  const isRainingNow =
    currentStatus.weather[0].main.toLowerCase().includes("rain") ||
    currentStatus.pop > 0.4;
  const isSnowingNow = currentStatus.weather[0].main
    .toLowerCase()
    .includes("snow");

  // Encontrar próxima lluvia si no llueve ahora
  const nextRain = forecast.find((item, i) => i > 0 && item.pop > 0.3);

  // Encontrar cuando para si está lloviendo
  const rainEnds = forecast.find((item, i) => i > 0 && item.pop < 0.2);

  const chartData = forecast.map((item) => ({
    temp: Math.round(item.main.temp),
  }));

  return (
    <div
      className={`backdrop-blur-md rounded-[3rem] border overflow-hidden shadow-2xl relative transition-all duration-1000 
      ${isSnow ? "bg-black/5 border-black/10" : "bg-white/10 border-white/10"}`}
    >
      {/* HEADER DINÁMICO (REEMPLAZA AL TÍTULO) */}
      <div className="p-8 pb-0 flex items-center gap-4">
        <div
          className={`p-3 rounded-2xl transition-all duration-500 ${isRainingNow || isSnowingNow ? "bg-blue-500/20 text-blue-400 animate-pulse" : "bg-white/5 opacity-90"}`}
        >
          {isSnowingNow ? (
            <Snowflake size={25} />
          ) : isRainingNow ? (
            <CloudRain size={25} />
          ) : (
            <CloudOff size={25} />
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSnow ? "text-black/40" : "text-white/90"}`}
            >
              Estado de precipitación
            </span>
          </div>
          <p
            className={`text-sm font-black tracking-tight ${isSnow ? "text-slate-900" : "text-white"}`}
          >
            {isRainingNow || isSnowingNow ? (
              <>
                {isSnowingNow ? "Nevando ahora." : "Lloviendo ahora."}{" "}
                <span className="opacity-50 font-bold">
                  {rainEnds
                    ? `Cesa a las ${new Date(rainEnds.dt * 1000).getHours()}:00`
                    : "Sin cambios próximos"}
                </span>
              </>
            ) : (
              <>
                Sin lluvias.{" "}
                <span className="opacity-70 font-bold">
                  {nextRain
                    ? `Llega a las ${new Date(nextRain.dt * 1000).getHours()}:00 (${Math.round(nextRain.pop * 100)}%)`
                    : "Cielo despejado hoy"}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="relative overflow-x-auto no-scrollbar pb-10 mt-4">
        <div className="min-w-[850px]">
          {/* ITEMS */}
          <div className="flex justify-between px-10 relative z-10 pt-4">
            {forecast.map((item, i) => (
              <div
                key={i}
                className={`flex flex-col items-center w-24 text-center group/item transition-all ${isSnow ? "text-slate-900" : "text-white"}`}
              >
                <span className="text-[12px] font-black opacity-80 mb-3 group-hover/item:opacity-100 transition-opacity">
                  {new Date(item.dt * 1000).getHours()}:00
                </span>

                <div
                  className={`p-2 rounded-2xl mb-2 border transition-all duration-300 
                  ${
                    isSnow
                      ? "bg-black/5 border-black/10 group-hover/item:bg-black/10"
                      : "bg-white/5 border-white/5 group-hover/item:bg-white/10"
                  }`}
                >
                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt="icon"
                    className={`w-12 h-12 ${isSnow ? "brightness-50" : ""}`}
                  />
                </div>

                <span className="text-2xl font-black tracking-tighter">
                  {Math.round(item.main.temp)}°
                </span>

                <div className="flex items-center gap-1 mt-2 font-black opacity-50 group-hover/item:opacity-100 transition-opacity">
                  <Droplets size={15} fill="currentColor" />
                  <span className="text-[13px]">
                    {Math.round(item.pop * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* GRÁFICO */}
          <div className="h-36 w-full absolute bottom-14 left-0 pointer-events-none opacity-30">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 45, right: 45 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isSnow ? "#000000" : "#ffffff"}
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="100%"
                      stopColor={isSnow ? "#000000" : "#ffffff"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <Area
                  type="natural"
                  dataKey="temp"
                  stroke={isSnow ? "#000000" : "#ffffff"}
                  strokeWidth={2.5}
                  fill="url(#chartGrad)"
                  isAnimationActive={true}
                  animationDuration={1200}
                  dot={false}
                  style={{ filter: "url(#glow)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
