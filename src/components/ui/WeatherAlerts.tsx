import { AlertTriangle } from "lucide-react";

interface Props {
  weather: any;
}

export default function WeatherAlerts({ weather }: Props) {
  // Nota: OpenWeather a veces pone alertas en 'alerts', pero en el plan free
  // solemos mirar el código de clima (2xx es tormenta, 6xx nieve, etc)
  const isBadWeather = weather?.weather[0].id < 700;

  if (!isBadWeather) return null;

  return (
    <div className="w-full bg-red-500/10 border border-red-500/20 p-4 rounded-3xl flex items-center gap-4 animate-pulse">
      <div className="bg-red-500 p-2 rounded-xl">
        <AlertTriangle size={20} className="text-white" />
      </div>
      <div>
        <h4 className="text-red-500 font-black uppercase text-xs tracking-tighter">
          Aviso Meteorológico
        </h4>
        <p className="text-red-200/70 text-sm italic">
          Se detectan condiciones de {weather.weather[0].description}. Toma
          precauciones.
        </p>
      </div>
    </div>
  );
}
