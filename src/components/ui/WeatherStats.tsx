import { Thermometer, Droplets, Wind, Gauge } from "lucide-react";

interface Props {
  weather: any;
  variant: "vertical" | "horizontal";
}

export default function WeatherStats({ weather, variant }: Props) {
  if (!weather) return null;

  // Detectamos si el clima es nieve para ajustar los iconos internamente si fuera necesario
  // Pero lo más importante es que los textos NO tengan clases de colores fijos.
  const isSnow = weather.weather[0].main.toLowerCase() === "snow";

  const stats = [
    {
      icon: <Thermometer size={30} />,
      label: "Sensación",
      val: `${Math.round(weather.main.feels_like)}°`,
    },
    {
      icon: <Droplets size={30} />,
      label: "Humedad",
      val: `${weather.main.humidity}%`,
    },
    {
      icon: <Wind size={30} />,
      label: "Viento",
      val: `${Math.round(weather.wind.speed * 3.6)} km/h`,
    },
    {
      icon: <Gauge size={30} />,
      label: "Presión",
      val: `${weather.main.pressure} hPa`,
    },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 w-full`}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className={` border p-6 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all group shadow-lg 
            ${
              isSnow
                ? "bg-black/5 border-black/10 hover:bg-black/10"
                : "bg-white/10 border-white/10 hover:bg-white/20"
            }`}
        >
          {/* Contenedor del icono: Siempre oscuro en nieve, blanco en otros */}
          <div
            className={`p-3 rounded-2xl mb-3 group-hover:scale-110 transition-transform 
            ${isSnow ? "bg-slate-900 text-white" : "bg-white/10 text-white"}`}
          >
            {stat.icon}
          </div>

          {/* Label: Usamos opacidad para que herede el negro o blanco del page.tsx */}
          <p className="text-[11px] uppercase font-black opacity-70 tracking-[0.2em] mb-1">
            {stat.label}
          </p>

          {/* Valor: Color heredado (Negro en nieve, Blanco en el resto) */}
          <p className="text-2xl font-black tracking-tighter">{stat.val}</p>
        </div>
      ))}
    </div>
  );
}
