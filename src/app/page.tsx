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
import { getNews } from "@/lib/api/news";

// Componentes
import SearchCity from "@/components/ui/SearchCity";
import WeatherChat from "@/components/ui/WeatherChat";
import MainWeatherCard from "@/components/ui/MainWeatherCard";
import ForecastCard from "@/components/ui/ForecastCard";
import WeatherStats from "@/components/ui/WeatherStats";
import WeatherNews from "@/components/ui/WeatherNews";

// ─── FOOTER COMPONENT ────────────────────────────────────────────────────────
function WeatherFooter({ isHot = false }: { isHot?: boolean }) {
  const [birdOffset, setBirdOffset] = useState(0);
  const [birdOffset2, setBirdOffset2] = useState(200);
  const [wingAngle, setWingAngle] = useState(0);

  useEffect(() => {
    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.012;
      setBirdOffset((t * 60) % 1500);
      setBirdOffset2((t * 60 + 180) % 1500);
      setWingAngle(Math.sin(t * 8) * 12);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const grassLight = isHot ? "#4ade80" : "#22c55e";
  const grassDark = isHot ? "#166534" : "#14532d";
  const mountainFar = isHot ? "#a3e635" : "#6b7280";
  const mountainNear = isHot ? "#65a30d" : "#4b5563";
  const treeMain = isHot ? "#16a34a" : "#15803d";
  const treeShadow = isHot ? "#14532d" : "#052e16";
  const treeTrunk = isHot ? "#713f12" : "#431407";
  const lakeColor = isHot ? "#7dd3fc" : "#93c5fd";
  const lakeDark = isHot ? "#0284c7" : "#1d4ed8";
  const birdColor = isHot ? "#78350f" : "#1e1b4b";

  return (
    <footer className="mt-auto relative z-20">
      <div
        className="w-full relative overflow-hidden"
        style={{ height: "180px" }}
      >
        <svg
          viewBox="0 0 1440 180"
          className="absolute bottom-0 left-0 w-full h-full"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={grassLight} />
              <stop offset="100%" stopColor={grassDark} />
            </linearGradient>
            <linearGradient id="lakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={lakeColor} stopOpacity="0.85" />
              <stop offset="100%" stopColor={lakeDark} stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="mtnFarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={mountainFar} stopOpacity="0.5" />
              <stop offset="100%" stopColor={mountainFar} stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="mtnNearGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={mountainNear} stopOpacity="0.7" />
              <stop offset="100%" stopColor={mountainNear} stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="treeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={treeMain} />
              <stop offset="100%" stopColor={treeShadow} />
            </linearGradient>
          </defs>

          {/* Montañas lejanas */}
          <polygon points="60,130 160,60 260,130" fill="url(#mtnFarGrad)" />
          <polygon points="1180,130 1300,50 1420,130" fill="url(#mtnFarGrad)" />
          {/* Montañas cercanas */}
          <polygon points="0,130 120,70 240,130" fill="url(#mtnNearGrad)" />
          <polygon
            points="1200,130 1340,65 1440,130"
            fill="url(#mtnNearGrad)"
          />
          {/* Nieve */}
          <polygon points="160,62 145,85 175,85" fill="white" opacity="0.5" />
          <polygon
            points="1300,52 1283,78 1317,78"
            fill="white"
            opacity="0.5"
          />

          {/* Lago */}
          <ellipse cx="320" cy="148" rx="110" ry="14" fill="url(#lakeGrad)" />
          <line
            x1="250"
            y1="146"
            x2="290"
            y2="146"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <line
            x1="310"
            y1="150"
            x2="360"
            y2="150"
            stroke="white"
            strokeWidth="0.8"
            strokeOpacity="0.25"
          />
          <ellipse
            cx="320"
            cy="162"
            rx="110"
            ry="5"
            fill={grassDark}
            opacity="0.4"
          />

          {/* Césped fondo */}
          <path
            d="M0,180 L0,110 C100,90 200,130 300,110 C400,90 500,130 600,110 C700,90 800,130 900,110 C1000,90 1100,130 1200,110 C1300,90 1400,130 1440,110 L1440,180 Z"
            fill="url(#grassGrad)"
            opacity="0.5"
          />

          {/* Árboles */}
          <rect x="128" y="128" width="5" height="22" fill={treeTrunk} />
          <polygon points="130,78 115,130 145,130" fill="url(#treeGrad)" />
          <polygon
            points="130,90 112,136 148,136"
            fill={treeShadow}
            opacity="0.3"
          />
          <polygon points="130,100 118,125 142,125" fill={treeMain} />

          <rect x="100" y="134" width="4" height="16" fill={treeTrunk} />
          <polygon points="102,98 90,136 114,136" fill="url(#treeGrad)" />
          <polygon points="102,108 91,132 113,132" fill={treeMain} />

          <rect x="58" y="136" width="3" height="14" fill={treeTrunk} />
          <polygon points="60,106 50,138 70,138" fill="url(#treeGrad)" />

          <rect x="1280" y="126" width="6" height="24" fill={treeTrunk} />
          <polygon points="1283,72 1264,130 1302,130" fill="url(#treeGrad)" />
          <polygon points="1283,88 1266,128 1300,128" fill={treeMain} />
          <polygon
            points="1283,82 1262,132 1304,132"
            fill={treeShadow}
            opacity="0.25"
          />

          <rect x="1310" y="132" width="4" height="18" fill={treeTrunk} />
          <polygon points="1312,100 1298,134 1326,134" fill="url(#treeGrad)" />
          <polygon points="1312,110 1300,130 1324,130" fill={treeMain} />

          <rect x="1370" y="136" width="3" height="14" fill={treeTrunk} />
          <polygon points="1372,108 1362,138 1382,138" fill="url(#treeGrad)" />

          <rect x="758" y="136" width="5" height="18" fill={treeTrunk} />
          <circle cx="760" cy="122" r="18" fill={treeMain} />
          <circle cx="752" cy="126" r="12" fill={treeMain} />
          <circle cx="768" cy="125" r="13" fill={treeShadow} opacity="0.4" />

          <rect x="458" y="138" width="4" height="16" fill={treeTrunk} />
          <circle cx="460" cy="125" r="15" fill={treeMain} />
          <circle cx="453" cy="128" r="10" fill={treeShadow} opacity="0.35" />

          {/* Césped frente */}
          <path
            d="M0,180 L0,150 C50,140 100,160 150,150 C200,140 250,160 300,150 C350,140 400,160 450,150 C500,140 550,160 600,150 C650,140 700,160 750,150 C800,140 850,160 900,150 C950,140 1000,160 1050,150 C1100,140 1150,160 1200,150 C1250,140 1300,160 1350,150 C1400,140 1440,150 L1440,180 Z"
            fill="url(#grassGrad)"
          />

          {/* Briznas de hierba */}
          {[30, 80, 200, 400, 550, 680, 850, 1000, 1100, 1250, 1380].map(
            (x, i) => (
              <g key={i}>
                <line
                  x1={x}
                  y1="150"
                  x2={x - 3}
                  y2="140"
                  stroke={grassLight}
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                />
                <line
                  x1={x + 5}
                  y1="150"
                  x2={x + 8}
                  y2="139"
                  stroke={grassLight}
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />
                <line
                  x1={x + 10}
                  y1="150"
                  x2={x + 10}
                  y2="141"
                  stroke={grassLight}
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />
              </g>
            ),
          )}

          {/* Pájaro 1 */}
          <g
            transform={`translate(${birdOffset - 100}, ${55 + Math.sin(birdOffset / 80) * 8})`}
          >
            <ellipse
              cx="0"
              cy="0"
              rx="5"
              ry="2.5"
              fill={birdColor}
              opacity="0.85"
            />
            <path
              d={`M-2,0 Q-10,${-wingAngle * 0.7} -14,${-wingAngle}`}
              stroke={birdColor}
              strokeWidth="1.8"
              fill="none"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />
            <path
              d={`M2,0 Q10,${-wingAngle * 0.7} 14,${-wingAngle}`}
              stroke={birdColor}
              strokeWidth="1.8"
              fill="none"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />
            <path
              d="M-5,0 L-9,2 M-5,0 L-9,-1"
              stroke={birdColor}
              strokeWidth="1"
              strokeOpacity="0.6"
            />
          </g>

          {/* Pájaro 2 */}
          <g
            transform={`translate(${birdOffset2 - 100}, ${68 + Math.sin((birdOffset2 + 40) / 80) * 7})`}
            opacity="0.7"
          >
            <ellipse
              cx="0"
              cy="0"
              rx="4"
              ry="2"
              fill={birdColor}
              opacity="0.8"
            />
            <path
              d={`M-2,0 Q-8,${-wingAngle * 0.65} -12,${-wingAngle * 0.9}`}
              stroke={birdColor}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M2,0 Q8,${-wingAngle * 0.65} 12,${-wingAngle * 0.9}`}
              stroke={birdColor}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Pájaro 3 — dirección opuesta */}
          <g
            transform={`translate(${1440 - ((birdOffset * 0.6) % 1500)}, ${48 + Math.sin(birdOffset / 60) * 6})`}
            opacity="0.6"
          >
            <ellipse
              cx="0"
              cy="0"
              rx="3.5"
              ry="1.8"
              fill={birdColor}
              opacity="0.75"
            />
            <path
              d={`M-1.5,0 Q-7,${-wingAngle * 0.6} -10,${-wingAngle * 0.85}`}
              stroke={birdColor}
              strokeWidth="1.3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M1.5,0 Q7,${-wingAngle * 0.6} 10,${-wingAngle * 0.85}`}
              stroke={birdColor}
              strokeWidth="1.3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    </footer>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const {
    coords,
    loading: locLoading,
    refresh,
    error: locError,
  } = useLocation();
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
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

        // Cargar Análisis IA y Noticias en paralelo para mejor performance
        setLoadingAi(true);
        const [analysis, newsData] = await Promise.all([
          getAiWeatherAnalysis(current),
          getNews(current.name),
        ]);

        setAiAnalysis(analysis);
        setNews(newsData);
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
                  : "bg-blue shadow-[0_0_90px_rgba(255,255,255,0.2)]"
              }`}
            >
              <Sun
                size={28}
                className={isSnow ? "text-yellow" : "text-yellow-400"}
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

            {/* --- SECCIÓN DE NOTICIAS --- */}
            <WeatherNews news={news} isSnow={isSnow} />
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

      <WeatherFooter isHot={isHot} />

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
