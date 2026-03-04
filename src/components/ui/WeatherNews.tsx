"use client";
import { Newspaper, ExternalLink, Calendar, ArrowRight } from "lucide-react";

export default function WeatherNews({
  news,
  isSnow,
}: {
  news: any[];
  isSnow: boolean;
}) {
  // Si no hay noticias, mostramos un mensaje sutil en lugar de desaparecer
  if (!news || news.length === 0) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 pb-10">
      {/* HEADER DE SECCIÓN */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${isSnow ? "bg-slate-900" : "bg-emerald-500/20"}`}
          >
            <Newspaper
              className={isSnow ? "text-white" : "text-white-400"}
              size={29}
            />
          </div>
          <h2
            className={`text-2xl font-[1000] uppercase tracking-tighter ${isSnow ? "text-slate-900" : "text-white"}`}
          >
            Crónicas del Clima
          </h2>
        </div>
      </div>

      {/* GRID DE NOTICIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col h-full rounded-[2rem] border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
              isSnow
                ? "bg-white border-slate-200 text-slate-900 shadow-sm"
                : "bg-slate-900/40 border-white/5 text-white shadow-xl"
            }`}
          >
            {/* Contenedor Imagen */}
            <div className="relative aspect-video w-full overflow-hidden rounded-t-[2rem]">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md text-white border border-white/10">
                  {item.source.name}
                </span>
              </div>
            </div>

            {/* Contenido Texto */}
            <div className="flex flex-col p-6 flex-1">
              <div className="flex items-center gap-2 mb-3 opacity-50">
                <Calendar size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {new Date(item.publishedAt).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "long",
                  })}
                </span>
              </div>

              <h3 className="text-lg font-bold leading-[1.3] line-clamp-2 mb-4 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>

              <p
                className={`text-sm leading-relaxed line-clamp-2 mb-6 opacity-60 font-medium ${isSnow ? "text-slate-600" : "text-slate-300"}`}
              >
                {item.description}
              </p>

              {/* Footer Tarjeta */}
              <div className="mt-auto pt-2 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-tighter">
                  Leer más
                </span>
                <div
                  className={`p-2 rounded-full transition-all ${
                    isSnow
                      ? "bg-slate-100 group-hover:bg-slate-900 group-hover:text-white"
                      : "bg-white/5 group-hover:bg-emerald-500 group-hover:text-black"
                  }`}
                >
                  <ArrowRight size={19} />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
