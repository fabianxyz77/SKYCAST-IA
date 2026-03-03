'use client';

import { useState, useEffect } from 'react';
import { 
  Sun, MapPin, AlertCircle, Thermometer, Clock, 
  Droplets, Wind, Sparkles 
} from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { getCurrentWeather, getWeatherByCity, getWeatherForecast } from '@/lib/api/weather';
import { getAiWeatherAnalysis } from '@/lib/api/mistral'; 
import SearchCity from '@/components/ui/SearchCity';
import WeatherChat from '@/components/ui/WeatherChat'; // IMPORTAMOS EL CHAT
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface ForecastItem {
  dt: number;
  main: { temp: number };
  weather: { icon: string; description: string; id: number }[];
  pop: number;
}

export default function Home() {
  const { coords, error: locError } = useLocation();
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localTime, setLocalTime] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  // RELOJ EN TIEMPO REAL
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

  const loadWeatherData = async (lat: number, lon: number) => {
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
  };

  const handleSearchCity = async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeatherByCity(city);
      if (data && data.coord) {
        setWeather(data);
        setLoadingAi(true);
        const [hourly, analysis] = await Promise.all([
          getWeatherForecast(data.coord.lat, data.coord.lon),
          getAiWeatherAnalysis(data)
        ]);
        if (hourly) setForecast(hourly.slice(0, 8));
        setAiAnalysis(analysis);
        setLoadingAi(false);
      } else {
        setError("Ubicación no encontrada");
      }
    } catch (err) {
      setError("Error al buscar la ciudad");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coords) loadWeatherData(coords.lat, coords.lon);
  }, [coords]);

  const getTempColor = (temp: number) => {
    if (temp <= 15) return "text-cyan-400";
    if (temp > 27) return "text-orange-500";
    return "text-white";
  };

  const chartData = forecast.map((item) => ({
    temp: Math.round(item.main.temp),
  }));

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      
      {/* HEADER NAVBAR */}
      <header className="w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2 shrink-0 group cursor-default">
            <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Sun size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter hidden md:block">
              SkyCast <span className="text-blue-500 font-bold not-italic">IA</span>
            </h1>
          </div>
          <div className="flex-1 max-w-xl">
            <SearchCity onSearch={handleSearchCity} onGPS={() => coords && loadWeatherData(coords.lat, coords.lon)} />
          </div>
        </div>
      </header>

      <div className="w-full max-w-5xl p-6 space-y-6 mt-4 animate-in fade-in duration-700">
        
        {/* CARD PRINCIPAL */}
        <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-colors" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
            
            {/* IZQUIERDA: CIUDAD Y HORA */}
            <div className="text-center md:text-left space-y-4 w-full">
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2 text-blue-500 mb-1">
                  <MapPin size={16} fill="currentColor" fillOpacity={0.2} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Localización Actual</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-white italic truncate leading-tight">
                  {weather ? weather.name : "---"}, <span className="text-blue-500 not-italic uppercase text-3xl md:text-4xl">{weather?.sys?.country}</span>
                </h2>
              </div>

              <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                <Clock size={16} className="text-slate-500" />
                <span className="text-xl font-mono font-bold tracking-widest tabular-nums text-white/90">
                  {localTime || "00:00:00"}
                </span>
              </div>

              {/* CAJA DE ANALISTA IA */}
              <div className={`mt-6 p-5 rounded-3xl border transition-all duration-500 ${loadingAi ? 'bg-white/5 border-white/5 animate-pulse' : 'bg-blue-500/5 border-blue-500/20'}`}>
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Sparkles size={14} className={loadingAi ? "animate-spin" : ""} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Analista Groq IA</span>
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  {loadingAi ? "Consultando a la IA..." : aiAnalysis || "Esperando datos del clima..."}
                </p>
              </div>
            </div>

            {/* CENTRO: TEMP */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative">
                <span className={`text-[11rem] md:text-[13rem] font-black tracking-tighter leading-none ${weather ? getTempColor(weather.main.temp) : 'text-white/10'}`}>
                  {weather ? Math.round(weather.main.temp) : "--"}
                </span>
                <span className="absolute top-10 -right-10 text-5xl font-bold text-slate-700">°</span>
              </div>
              <p className="text-xl font-bold text-slate-400 capitalize -mt-4 tracking-tight italic text-center">
                {weather ? weather.weather[0].description : "Cargando..."}
              </p>
            </div>

            {/* DERECHA: MÉTRICAS */}
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-48">
              <div className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-sm flex flex-col items-center text-center">
                <Thermometer size={18} className="text-orange-400 mb-2" />
                <p className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">Sensación</p>
                <p className="text-xl font-black">{weather ? Math.round(weather.main.feels_like) : "--"}°</p>
              </div>
              <div className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-sm flex flex-col items-center text-center">
                <Droplets size={18} className="text-blue-400 mb-2" />
                <p className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">Humedad</p>
                <p className="text-xl font-black">{weather ? weather.main.humidity : "--"}%</p>
              </div>
              <div className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-sm flex flex-col items-center text-center">
                <Wind size={18} className="text-slate-400 mb-2" />
                <p className="text-[9px] uppercase font-black text-slate-500 tracking-tighter">Viento</p>
                <p className="text-xl font-black">{weather ? Math.round(weather.wind.speed * 3.6) : "--"}<span className="text-[10px] ml-1 text-slate-500">km/h</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* PRONÓSTICO Y GRÁFICO */}
        <div className="bg-slate-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative">
          <div className="p-8 pb-4 flex justify-between items-end">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Tendencia Próximas Horas</span>
            </div>
          </div>

          <div className="relative overflow-x-auto no-scrollbar pb-10">
            <div className="min-w-[850px]">
              <div className="flex justify-between px-10 relative z-10 pt-4">
                {forecast.map((item, i) => (
                  <div key={i} className="flex flex-col items-center w-24 text-center group/item transition-transform">
                    <span className="text-[11px] font-black text-slate-500 mb-3 group-hover/item:text-blue-400">
                      {new Date(item.dt * 1000).getHours()}:00
                    </span>
                    <div className="bg-white/5 p-2 rounded-2xl mb-2 border border-white/5 group-hover/item:border-blue-500/30">
                      <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} alt="icon" className="w-12 h-12" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter">{Math.round(item.main.temp)}°</span>
                    <div className="flex items-center gap-1 mt-2 text-blue-500 font-black">
                      <Droplets size={10} fill="currentColor" />
                      <span className="text-[10px]">{Math.round(item.pop * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-32 w-full absolute bottom-14 left-0 pointer-events-none opacity-20">
                <ResponsiveContainer width="99%" height={128}>
                  <AreaChart data={chartData} margin={{ left: 45, right: 45 }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                        type="monotone" 
                        dataKey="temp" 
                        stroke="#3b82f6" 
                        strokeWidth={5} 
                        fill="url(#chartGrad)" 
                        isAnimationActive={false} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* FEEDBACK DE ERRORES */}
        {(error || locError) && (
          <div className="flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] text-red-400 font-bold text-sm">
            <AlertCircle size={20} />
            {error || locError}
          </div>
        )}
      </div>

      <footer className="mt-auto p-12 text-[10px] uppercase tracking-[0.8em] text-slate-700 font-black text-center opacity-50">
        Juana Manso • SkyCast Realtime • 2026
      </footer>

      {/* CHAT FLOTANTE INTERACTIVO */}
      {weather && (
        <WeatherChat 
          city={weather.name} 
          temp={Math.round(weather.main.temp)} 
        />
      )}
    </main>
  );
}