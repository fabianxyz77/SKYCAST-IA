"use client";

import {
  MapPin,
  Clock,
  Sparkles,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  CloudLightning,
} from "lucide-react";

interface Props {
  weather: any;
  localTime: string;
  loadingAi: boolean;
  aiAnalysis: string;
  getTempColor: (t: number) => string;
}

export default function MainWeatherCard({
  weather,
  localTime,
  loadingAi,
  aiAnalysis,
  getTempColor,
}: Props) {
  if (!weather) return null;

  // Lógica de iconos y estados
  const mainWeather = weather.weather[0].main.toLowerCase();
  const temp = weather.main.temp;
  const isSnow = temp <= 0 || mainWeather.includes("snow");
  const isHot = temp > 28;

  // Determinar si es de día o de noche (según icono de OpenWeather o la hora local)
  const isDay = weather.weather[0].icon.includes("d");

  // Colores dinámicos
  const textColor = isSnow ? "text-slate-900" : "text-white";
  const subTextColor = isSnow ? "text-slate-700" : "text-white/60";
  const iconColor = isSnow ? "text-slate-800" : "text-white/90";

  // Selector de Icono de Clima Principal
  const getWeatherIcon = () => {
    if (isSnow)
      return (
        <Snowflake
          size={100}
          className="animate-bounce-slow text-blue-400"
          fill="currentColor"
          opacity={0.2}
        />
      );
    if (mainWeather.includes("thunder"))
      return (
        <CloudLightning size={100} className="animate-pulse text-purple-400" />
      );
    if (mainWeather.includes("rain"))
      return (
        <CloudRain size={100} className="animate-bounce-slow text-blue-300" />
      );
    if (mainWeather.includes("cloud"))
      return <Cloud size={100} className="animate-float text-slate-200" />;

    // Sol o Luna según el tiempo
    return isDay ? (
      <Sun
        size={120}
        className={`${isHot ? "text-orange-300" : "text-yellow-300"} animate-spin-slow`}
        fill="currentColor"
      />
    ) : (
      <Moon
        size={100}
        className="text-blue-100 animate-float"
        fill="currentColor"
      />
    );
  };

  return (
    <div
      className={`rounded-[2.5rem] p-10 border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.25)] relative overflow-hidden group w-full transition-all duration-1000 animate-in fade-in zoom-in slide-in-from-bottom-8 ${isSnow ? "bg-black/5" : "bg-white/10"}`}
    >
      <div
        className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] rounded-full transition-colors ${isHot ? "bg-orange-500/20" : "bg-white/10"}`}
      />

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center lg:items-center gap-8">
        {/* IZQUIERDA: CIUDAD Y HORA */}
        <div className="text-center lg:text-left space-y-4 flex-1 min-w-0">
          <div className="space-y-1">
            <div
              className={`flex items-center justify-center lg:justify-start gap-2 ${iconColor} mb-1`}
            >
              <MapPin size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Localización
              </span>
            </div>

            <h2
              className={`text-4xl md:text-6xl font-black italic leading-tight truncate max-w-full ${textColor}`}
            >
              {weather.name},{" "}
              <span
                className={`${subTextColor} not-italic uppercase text-2xl md:text-4xl`}
              >
                {weather.sys?.country}
              </span>
            </h2>
          </div>

          <div
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl border ${isSnow ? "bg-black/10 border-black/10" : "bg-white/10 border-white/10"}`}
          >
            <Clock size={26} className={iconColor} />
            <span
              className={`text-lg font-mono font-bold tracking-widest tabular-nums ${textColor}`}
            >
              {localTime || "00:00:00"}
            </span>
          </div>

          {/* Bloque IA */}
          <div
            className={`mt-4 p-4 rounded-2xl border transition-all duration-500 ${loadingAi ? "bg-black/5 animate-pulse border-transparent" : isSnow ? "bg-black/10 border-black/5" : "bg-white/10 border-white/20"}`}
          >
            <div className={`flex items-center gap-2 mb-1 ${iconColor}`}>
              <Sparkles size={20} className={loadingAi ? "animate-spin" : ""} />
              <span className="text-[11px] font-black uppercase tracking-widest">
                IA WEATHER SYSTEM
              </span>
            </div>
            <p
              className={`text-sm italic leading-snug ${isSnow ? "text-slate-800" : "text-white"}`}
            >
              {loadingAi ? "Analizando..." : aiAnalysis}
            </p>
          </div>
        </div>

        {/* DERECHA: ICONO DINÁMICO + TEMP GIGANTE */}
        <div className="flex flex-col md:flex-row items-center gap-6 shrink-0 lg:px-10">
          {/* ICONO ANIMADO AL LADO DE LA TEMP */}
          <div className="relative flex items-center justify-center drop-shadow-3xl">
            <div
              className={`absolute inset-0 blur-[40px] opacity-30 ${isDay ? "bg-yellow-400" : "bg-blue-400"}`}
            />
            <div className="relative z-10 transition-transform duration-700 hover:scale-110">
              {getWeatherIcon()}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative">
              <span
                className={`text-[10rem] md:text-[12rem] font-black tracking-tighter leading-none drop-shadow-2xl transition-all duration-700 ${textColor}`}
              >
                {Math.round(weather.main.temp)}
              </span>
              <span
                className={`absolute top-8 -right-8 text-4xl font-bold ${subTextColor}`}
              >
                °
              </span>
            </div>
            <p
              className={`text-lg font-bold capitalize -mt-4 italic ${subTextColor}`}
            >
              {weather.weather[0].description}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spinSlow 12s linear infinite;
        }
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-bounce-slow {
          animation: bounceSlow 3s ease-in-out infinite;
        }
        @keyframes bounceSlow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
