"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sun,
  MapPin,
  Settings2,
  RefreshCw,
  LocateFixed,
  Search,
} from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import {
  getCurrentWeather,
  getWeatherByCity,
  getWeatherForecast,
} from "@/lib/api/weather";
import { getAiWeatherAnalysis } from "@/lib/api/mistral";

// Componentes
import SearchCity from "@/components/ui/SearchCity";
import WeatherChat from "@/components/ui/WeatherChat";
import MainWeatherCard from "@/components/ui/MainWeatherCard";
import ForecastCard from "@/components/ui/ForecastCard";
import WeatherStats from "@/components/ui/WeatherStats";

export default function Home() {
  const {
    coords,
    loading: locLoading,
    refresh,
    error: locError,
  } = useLocation();
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [localTime, setLocalTime] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [minimumLoading, setMinimumLoading] = useState(true);

  // Forzar 4 segundos de carga mínima
  useEffect(() => {
    const timer = setTimeout(() => setMinimumLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = useCallback(async (lat: number, lon: number) => {
    setIsInitialLoading(true);
    try {
      const [current, hourly] = await Promise.all([
        getCurrentWeather(lat, lon),
        getWeatherForecast(lat, lon),
      ]);
      if (current) {
        setWeather(current);
        setLoadingAi(true);
        const analysis = await getAiWeatherAnalysis(current);
        setAiAnalysis(analysis);
        setLoadingAi(false);
      }
      if (hourly) setForecast(hourly.slice(0, 8));
      setIsInitialLoading(false);
    } catch (err) {
      console.error(err);
      setIsInitialLoading(false);
    }
  }, []);

  const handleSearch = async (city: string) => {
    try {
      const data = await getWeatherByCity(city);
      if (data?.coord) await fetchData(data.coord.lat, data.coord.lon);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (coords) fetchData(coords.lat, coords.lon);
  }, [coords, fetchData]);

  useEffect(() => {
    if (!weather) return;
    const timer = setInterval(() => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const cityTime = new Date(utc + 1000 * weather.timezone);
      setLocalTime(
        cityTime.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [weather]);

  const getWeatherType = () => {
    if (!weather) return "default";
    const main = weather.weather[0].main.toLowerCase();
    const temp = weather.main.temp;

    if (temp > 28) return "hot";
    if (temp <= 0 || main.includes("snow")) return "snow";
    if (main.includes("thunderstorm")) return "thunder";
    if (main.includes("rain") || main.includes("drizzle")) return "rain";
    if (main.includes("clear")) return "clear";
    if (main.includes("clouds")) return "clouds";

    return "default";
  };

  const weatherType = getWeatherType();
  const isSnow = weatherType === "snow";
  const isHot = weatherType === "hot";

  // --- PANTALLA DE CARGA ---
  if (minimumLoading || (isInitialLoading && !weather)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-500 to-blue-700 flex flex-col items-center justify-center text-white relative overflow-hidden z-[1000]">
        <div className="absolute top-20 right-[-5%] w-64 h-64 bg-yellow-300 blur-[80px] opacity-40 animate-pulse" />
        <div className="z-10 flex flex-col items-center max-w-md w-full text-center space-y-8 p-6">
          {locError ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-700 bg-white/10 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/20 shadow-2xl w-full text-white">
              <div className="relative mx-auto w-fit">
                <MapPin size={56} className="text-red-400" />
                <Settings2
                  size={24}
                  className="absolute -top-2 -right-2 text-white animate-spin-slow"
                />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase">
                Ubicación Necesaria
              </h2>
              <div className="text-sm space-y-4">
                <p className="opacity-90">
                  Necesitamos tu ubicación para el clima exacto.
                </p>
                <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-yellow-300 mb-1">
                    Permitir acceso:
                  </p>
                  <p className="text-xs leading-relaxed">
                    Pulsá el <strong>candado</strong> cerca de la dirección
                    (URL) y seleccioná <strong>"Permitir"</strong> acceso a la
                    ubicación.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => refresh()}
                  className="flex items-center justify-center gap-2 bg-white text-blue-600 font-bold py-4 px-6 rounded-2xl hover:bg-blue-50 transition-all shadow-lg active:scale-95"
                >
                  <RefreshCw
                    size={20}
                    className={locLoading ? "animate-spin" : ""}
                  />
                  {locLoading ? "PROCESANDO..." : "REINTENTAR UBICACIÓN"}
                </button>
                <SearchCity
                  onSearch={handleSearch}
                  onGPS={refresh}
                  isSearchingGPS={locLoading}
                  isSnow={false}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-1000">
              <Sun
                size={100}
                className="text-yellow-300 animate-spin-slow relative z-10"
                fill="currentColor"
              />
              <div className="space-y-2">
                <h2 className="text-5xl font-black italic tracking-tighter drop-shadow-lg">
                  SKYCAST IA
                </h2>
                <p className="text-[10px] uppercase tracking-[0.8em] text-sky-200 font-black">
                  Sincronizando Atmósfera
                </p>
              </div>
              <div className="w-48 h-[6px] bg-black/20 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-white animate-loading-bar" />
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 w-full h-32">
          <svg
            viewBox="0 0 1440 120"
            className="absolute bottom-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,120 L0,60 C150,40 300,80 450,60 C600,40 750,80 900,60 C1050,40 1200,80 1440,60 L1440,120 Z"
              fill="#22c55e"
            />
            <path
              d="M0,120 L0,90 C200,70 400,110 600,90 C800,70 1000,110 1200,90 C1400,70 1440,90 L1440,120 Z"
              fill="#16a34a"
            />
          </svg>
        </div>
      </div>
    );
  }

  const getBackgroundStyle = () => {
    const styles: Record<string, string> = {
      thunder: "bg-gradient-to-br from-gray-950 via-purple-950 to-slate-900",
      rain: "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900",
      snow: "bg-[#cbd5e1]",
      hot: "bg-gradient-to-br from-orange-600 via-red-500 to-amber-500",
      clear: "bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400",
      clouds: "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900",
      default: "bg-slate-950",
    };
    return styles[weatherType] || styles.default;
  };

  return (
    <main
      className={`flex min-h-screen flex-col transition-all duration-1000 relative ${getBackgroundStyle()} ${isSnow ? "text-slate-950" : "text-white"}`}
    >
      {isSnow && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="snow-effect opacity-50"></div>
        </div>
      )}
      {weatherType === "rain" && (
        <div className="absolute inset-0 pointer-events-none z-0 rain-container"></div>
      )}

      {/* ===== HEADER ===== */}
      <header
        className={`w-full sticky top-0 z-50 transition-all duration-300 border-b backdrop-blur-xl ${
          isSnow
            ? "bg-white/90 border-slate-200 shadow-sm text-slate-900"
            : "bg-[#0A0A0A]/40 border-white/5 shadow-2xl text-white"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 h-16 md:h-[72px] flex items-center justify-between gap-3">
          {/* IZQUIERDA: MARCA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className={`w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center transition-transform hover:rotate-12 ${
                isSnow
                  ? "bg-slate-900 shadow-lg"
                  : "bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              }`}
            >
              <Sun
                size={20}
                className={isSnow ? "text-white" : "text-black"}
                fill="currentColor"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-[1000] uppercase tracking-tighter leading-none">
                SkyCast
              </h1>
              <span className="text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase opacity-40">
                AI Weather
              </span>
            </div>
          </div>

          {/* DERECHA: ACCIONES — sin overflow */}
          <div className="flex items-center gap-2 min-w-0">
            {/* BOTÓN GPS — sólo icono en mobile, texto en md+ */}
            <button
              onClick={refresh}
              disabled={locLoading}
              title="Mi ubicación"
              className={`flex items-center justify-center gap-2 h-10 md:h-11 px-3 md:px-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all active:scale-90 disabled:opacity-50 shrink-0 ${
                isSnow
                  ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
              }`}
            >
              {locLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <>
                  <LocateFixed size={17} />
                  <span className="hidden md:inline">Mi Ubicación</span>
                </>
              )}
            </button>

            {/* BUSCADOR */}
            <SearchCity
              onSearch={handleSearch}
              onGPS={refresh}
              isSearchingGPS={locLoading}
              isSnow={isSnow}
            />
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <div
        className={`w-full max-w-[1400px] mx-auto p-4 md:p-10 space-y-8 z-10 relative flex-1 ${isSnow ? "[&_*]:text-slate-950" : ""}`}
      >
        {weather && (
          <div className="space-y-6 animate-in fade-in duration-1000">
            <MainWeatherCard
              weather={weather}
              localTime={localTime}
              loadingAi={loadingAi}
              aiAnalysis={aiAnalysis}
              getTempColor={(t: number) =>
                isSnow ? "text-slate-950" : "text-white"
              }
            />
            <WeatherStats weather={weather} variant="horizontal" />
            <ForecastCard forecast={forecast || []} />
          </div>
        )}
      </div>

      {weather && (
        <WeatherChat
          city={weather.name}
          temp={Math.round(weather.main.temp)}
          weatherType={weatherType}
          humidity={weather.main.humidity}
          feels_like={Math.round(weather.main.feels_like)}
          wind_speed={weather.wind.speed}
          description={weather.weather[0].description}
          pressure={weather.main.pressure}
          pop={forecast[0]?.pop || 0}
        />
      )}

      <footer className="mt-auto relative z-20">
        <div className="w-full h-24 relative overflow-hidden">
          <svg
            viewBox="0 0 1440 120"
            className="absolute bottom-0 left-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isHot ? "#4ade80" : "#22c55e"} />
                <stop offset="100%" stopColor={isHot ? "#166534" : "#14532d"} />
              </linearGradient>
            </defs>
            <path
              d="M0,120 L0,80 C100,60 200,100 300,80 C400,60 500,100 600,80 C700,60 800,100 900,80 C1000,60 1100,100 1200,80 C1300,60 1400,100 1440,80 L1440,120 Z"
              fill="url(#grassGrad)"
              opacity="0.6"
            />
            <path
              d="M0,120 L0,100 C50,90 100,110 150,100 C200,90 250,110 300,100 C350,90 400,110 450,100 C500,90 550,110 600,100 C650,90 700,110 750,100 C800,90 850,110 900,100 C950,90 1000,110 1050,100 C1100,90 1150,110 1200,100 C1250,90 1300,110 1350,100 C1400,90 1440,100 L1440,120 Z"
              fill="url(#grassGrad)"
            />
          </svg>
        </div>
      </footer>

      <style jsx>{`
        .animate-spin-slow {
          animation: spinSlow 20s linear infinite;
        }
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-loading-bar {
          width: 0%;
          animation: loadingBar 4s ease-in-out infinite;
        }
        @keyframes loadingBar {
          0% {
            width: 0%;
            transform: translateX(-100%);
          }
          50% {
            width: 100%;
            transform: translateX(0);
          }
          100% {
            width: 0%;
            transform: translateX(100%);
          }
        }
        .rain-container {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: url("https://www.transparenttextures.com/patterns/stardust.png");
          animation: rain 0.3s linear infinite;
          opacity: 0.3;
        }
        @keyframes rain {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 20px 100px;
          }
        }
        .snow-effect {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image:
            radial-gradient(circle at 50% 50%, #f8fafc 2px, transparent 2px),
            radial-gradient(circle at 20% 80%, #f8fafc 3px, transparent 3px);
          background-size:
            200px 200px,
            300px 300px;
          animation: snowMove 12s linear infinite;
        }
        @keyframes snowMove {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 150px 600px;
          }
        }
      `}</style>
    </main>
  );
}
