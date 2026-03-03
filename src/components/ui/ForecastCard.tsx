import { Clock, Droplets } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface Props {
  forecast: any[];
}

export default function ForecastCard({ forecast }: Props) {
  if (!forecast || forecast.length === 0) return null;

  const chartData = forecast.map((item) => ({
    temp: Math.round(item.main.temp),
  }));

  return (
    <div className="bg-slate-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative">
      <div className="p-8 pb-4 flex justify-between items-end">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-500" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            Pronóstico Próximas Horas
          </span>
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
                <div className="bg-white/5 p-2 rounded-2xl mb-2 border border-white/5 group-hover/item:border-blue-500/30 transition-colors">
                  <img 
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} 
                    alt="icon" 
                    className="w-12 h-12" 
                  />
                </div>
                <span className="text-2xl font-black tracking-tighter">{Math.round(item.main.temp)}°</span>
                <div className="flex items-center gap-1 mt-2 text-blue-500 font-black">
                  <Droplets size={10} fill="currentColor" />
                  <span className="text-[10px]">{Math.round(item.pop * 100)}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* EL GRÁFICO */}
          <div className="h-32 w-full absolute bottom-14 left-0 pointer-events-none opacity-20">
            <ResponsiveContainer width="100%" height={128}>
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
                  isAnimationActive={true} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}