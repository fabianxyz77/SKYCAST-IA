import { MapPin, Clock, Sparkles } from 'lucide-react';

interface Props {
  weather: any;
  localTime: string;
  loadingAi: boolean;
  aiAnalysis: string;
  getTempColor: (t: number) => string;
}

export default function MainWeatherCard({ weather, localTime, loadingAi, aiAnalysis, getTempColor }: Props) {
  if (!weather) return null;

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-colors" />
      
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8">
        
        {/* IZQUIERDA: CIUDAD Y HORA */}
        <div className="text-center lg:text-left space-y-4 flex-1 min-w-0"> {/* min-w-0 permite que el truncate funcione */}
          <div className="space-y-1">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-blue-500 mb-1">
              <MapPin size={14} fill="currentColor" fillOpacity={0.2} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Localización</span>
            </div>
            {/* TRUNCADO DE TÍTULO AQUÍ */}
            <h2 className="text-4xl md:text-6xl font-black text-white italic leading-tight truncate max-w-full">
              {weather.name}, <span className="text-blue-500 not-italic uppercase text-2xl md:text-4xl">{weather.sys?.country}</span>
            </h2>
          </div>

          <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
            <Clock size={16} className="text-slate-500" />
            <span className="text-lg font-mono font-bold tracking-widest tabular-nums text-white/90">
              {localTime || "00:00:00"}
            </span>
          </div>

          <div className={`mt-4 p-4 rounded-2xl border transition-all duration-500 ${loadingAi ? 'bg-white/5 border-white/5 animate-pulse' : 'bg-blue-500/5 border-blue-500/20'}`}>
            <div className="flex items-center gap-2 mb-1 text-blue-400">
              <Sparkles size={12} className={loadingAi ? "animate-spin" : ""} />
              <span className="text-[9px] font-black uppercase tracking-widest">IA Insight</span>
            </div>
            <p className="text-sm text-slate-300 italic leading-snug">
              {loadingAi ? "Analizando..." : aiAnalysis}
            </p>
          </div>
        </div>

        {/* CENTRO: TEMP GIGANTE */}
        <div className="flex flex-col items-center shrink-0 lg:px-10">
          <div className="relative">
            <span className={`text-[10rem] md:text-[12rem] font-black tracking-tighter leading-none ${getTempColor(weather.main.temp)}`}>
              {Math.round(weather.main.temp)}
            </span>
            <span className="absolute top-8 -right-8 text-4xl font-bold text-slate-700">°</span>
          </div>
          <p className="text-lg font-bold text-slate-400 capitalize -mt-4 italic">
            {weather.weather[0].description}
          </p>
        </div>
      </div>
    </div>
  );
}