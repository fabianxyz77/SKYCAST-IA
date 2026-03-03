import { Thermometer, Droplets, Wind, Gauge } from 'lucide-react';

interface Props {
  weather: any;
}

export default function WeatherStats({ weather }: Props) {
  if (!weather) return null;

  const stats = [
    {
      icon: <Thermometer size={20} className="text-orange-400" />,
      label: "Sensación",
      val: `${Math.round(weather.main.feels_like)}°`,
    },
    {
      icon: <Droplets size={20} className="text-blue-400" />,
      label: "Humedad",
      val: `${weather.main.humidity}%`,
    },
    {
      icon: <Wind size={20} className="text-slate-400" />,
      label: "Viento",
      val: `${Math.round(weather.wind.speed * 3.6)} km/h`,
    },
    {
      icon: <Gauge size={20} className="text-purple-400" />,
      label: "Presión",
      val: `${weather.main.pressure} hPa`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-slate-900 border border-white/10 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
          {stat.icon}
          <p className="text-[10px] uppercase font-black text-slate-500 mt-2 tracking-widest">{stat.label}</p>
          <p className="text-2xl font-black">{stat.val}</p>
        </div>
      ))}
    </div>
  );
}