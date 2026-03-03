'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sun, AlertCircle } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { getCurrentWeather, getWeatherByCity, getWeatherForecast } from '@/lib/api/weather';
import { getAiWeatherAnalysis } from '@/lib/api/mistral'; 

// Componentes Refactorizados
import SearchCity from '@/components/ui/SearchCity';
import WeatherChat from '@/components/ui/WeatherChat';
import MainWeatherCard from '@/components/ui/MainWeatherCard';
import ForecastCard from '@/components/ui/ForecastCard'; 
import WeatherStats from '@/components/ui/WeatherStats';
import WeatherAlerts from '@/components/ui/WeatherAlerts';

export default function Home() {
  const { coords, error: locError, loading: locLoading, refresh } = useLocation();
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localTime, setLocalTime] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // 1. CARGA DE DATOS (Centralizada)
  const fetchData = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const [current, hourly] = await Promise.all([
        getCurrentWeather(lat, lon),
        getWeatherForecast(lat, lon)
      ]);
      
      if (current) {
        setWeather(current);
        setLoadingAi(true);
        const analysis = await getAiWeatherAnalysis(current);
        setAiAnalysis(analysis);
        setLoadingAi(false);
      }
      if (hourly) setForecast(hourly.slice(0, 8));
    } catch (err) {
      setError("Error de conexión con el servicio meteorológico");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. BUSCADOR MANUAL
  const handleSearch = async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeatherByCity(city);
      if (data && data.coord) {
        await fetchData(data.coord.lat, data.coord.lon);
      } else {
        setError("Ciudad no encontrada");
      }
    } catch (err) {
      setError("Error al buscar la ciudad");
    } finally {
      setLoading(false);
    }
  };

  // 3. DISPARADOR DE GPS (Para móviles)
  const handleGPSClick = () => {
    refresh(); // Llama a la función del hook con timeout y alta precisión
  };

  // Efecto cuando el hook detecta coordenadas (automático o manual)
  useEffect(() => {
    if (coords) fetchData(coords.lat, coords.lon);
  }, [coords, fetchData]);

  // 4. RELOJ EN TIEMPO REAL
  useEffect(() => {
    if (!weather) return;
    const timer = setInterval(() => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const cityTime = new Date(utc + (1000 * weather.timezone));
      setLocalTime(cityTime.toLocaleTimeString('es-AR', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [weather]);

  const getTempColor = (temp: number) => {
    if (temp <= 15) return "text-cyan-400";
    if (temp > 27) return "text-orange-500";
    return "text-white";
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      
      {/* HEADER NAVBAR */}
      <header className="w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2 shrink-0 group cursor-default">
            <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Sun size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter hidden md:block">
              SkyCast <span className="text-blue-500 font-bold not-italic">IA</span>
            </h1>
          </div>
          <div className="flex-1 max-w-2xl">
            <SearchCity 
              onSearch={handleSearch} 
              onGPS={handleGPSClick} 
              isSearchingGPS={locLoading} 
            />
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="w-full max-w-[1400px] mx-auto p-4 md:p-10 space-y-6 animate-in fade-in duration-700">
        
        {/* Banner de Alertas */}
        {weather && <WeatherAlerts weather={weather} />}

        {/* Grid: Card Principal + Estadísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <MainWeatherCard 
              weather={weather} 
              localTime={localTime} 
              loadingAi={loadingAi} 
              aiAnalysis={aiAnalysis} 
              getTempColor={getTempColor}
            />
          </div>
          <div className="lg:col-span-1">
            <WeatherStats weather={weather} />
          </div>
        </div>

        {/* Pronóstico */}
        <ForecastCard forecast={forecast} />

        {/* BLOQUE DE ERROR Y RESCATE DE GPS */}
        {(error || locError) && (
          <div className="flex flex-col items-center justify-center gap-6 bg-red-500/5 border border-red-500/20 p-8 md:p-12 rounded-[3rem] text-center animate-in zoom-in-95 duration-500">
            <div className="bg-red-500/20 p-5 rounded-full ring-8 ring-red-500/5">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-black uppercase tracking-tight text-red-400">
                {locError?.includes("denegado") ? "Permiso de Ubicación Necesario" : "Ubicación no disponible"}
              </h3>
              <p className="text-sm text-red-200/50 max-w-md mx-auto leading-relaxed italic">
                "Activa tu ubicación real en el dispositivo para detectar tu ciudad automáticamente y ofrecerte una exactitud del 100% en el pronóstico."
              </p>
            </div>

            <button
              onClick={handleGPSClick}
              disabled={locLoading}
              className="group flex items-center gap-3 bg-red-500 hover:bg-red-600 disabled:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 shadow-2xl shadow-red-500/20"
            >
              {locLoading ? "Buscando satélites..." : "Permitir Activar Ubicación"}
            </button>

            {locError?.includes("denegado") && (
              <div className="pt-2">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-loose">
                  Si el navegador no lanza el aviso: <br />
                  Haz clic en el <span className="text-slate-300">ícono del candado (🔒)</span> en la barra de direcciones <br />
                  y cambia Ubicación a <span className="text-blue-500 font-bold">"Permitir"</span>.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-auto p-12 text-[10px] uppercase tracking-[0.8em] text-slate-700 font-black text-center opacity-50">
        Sistema Meteorológico • SkyCast-IA Realtime • 2026
      </footer>

      {weather && (
        <WeatherChat 
          city={weather.name} 
          temp={Math.round(weather.main.temp)} 
        />
      )}
    </main>
  );
}