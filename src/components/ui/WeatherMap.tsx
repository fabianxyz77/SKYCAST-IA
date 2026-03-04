"use client";
import { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  LayersControl,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { Navigation, Plus, Minus, MousePointer2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

const getCustomIcon = (isSnow: boolean) => {
  const color = isSnow ? "#ffffff" : "#000000";
  const stroke = isSnow ? "#3b82f6" : "#ffffff";
  return new L.DivIcon({
    html: `<div class="relative">
            <div class="absolute -top-8 -left-4 p-2 rounded-full border-2 shadow-xl animate-bounce" 
                 style="background-color: ${color}; color: ${isSnow ? "#000" : "#fff"}; border-color: ${stroke};">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>`,
    className: "custom-pin",
    iconSize: [0, 0],
  });
};

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

function ZoomBridge() {
  const map = useMap();
  useEffect(() => {
    const btnIn = document.getElementById("zoom-in");
    const btnOut = document.getElementById("zoom-out");
    const zoomIn = () => map.zoomIn();
    const zoomOut = () => map.zoomOut();
    btnIn?.addEventListener("click", zoomIn);
    btnOut?.addEventListener("click", zoomOut);
    return () => {
      btnIn?.removeEventListener("click", zoomIn);
      btnOut?.removeEventListener("click", zoomOut);
    };
  }, [map]);
  return null;
}

export default function WeatherMap({ lat, lon, city, isSnow = false }: any) {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const center: [number, number] = useMemo(() => [lat, lon], [lat, lon]);
  const [isInteracting, setIsInteracting] = useState(false);

  // Clases dinámicas para la interfaz del mapa
  const textColor = "text-white";
  const bgClass = isSnow ? "bg-slate-900/95" : "bg-black/80";
  const borderClass = isSnow ? "border-white/40" : "border-white/20";

  return (
    <div
      className={`relative w-full h-[550px] rounded-[3rem] overflow-hidden border shadow-2xl ${isSnow ? "border-white/40" : "border-white/10"}`}
    >
      {!isInteracting && (
        <div
          onClick={() => setIsInteracting(true)}
          className="absolute inset-0 z-[1001] bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer group"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl flex items-center gap-3 text-white transition-transform group-hover:scale-105">
            <MousePointer2 size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Click para interactuar con el mapa
            </span>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="absolute top-6 left-6 z-[1000]">
        <div
          className={`${bgClass} backdrop-blur-xl px-5 py-3 rounded-2xl border ${borderClass} flex items-center gap-3`}
        >
          <Navigation size={14} className="text-blue-400" />
          <div className="flex flex-col">
            <span
              className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${textColor}`}
            >
              Radar Meteorológico
            </span>
            <span className={`text-sm font-bold ${textColor}`}>{city}</span>
          </div>
        </div>
      </div>

      {/* Estilos Globales para los Controles de Leaflet */}
      <style jsx global>{`
        /* Caja de control de capas */
        .leaflet-control-layers {
          background: ${isSnow ? "#0f172a" : "#000"} !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          border-radius: 1.25rem !important;
          padding: 8px 12px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
        }
        /* Icono de las capas (el botón) */
        .leaflet-control-layers-toggle {
          filter: invert(1) brightness(2); /* Hace que el icono oscuro sea blanco */
          width: 36px !important;
          height: 36px !important;
        }
        /* Texto dentro de la lista de capas */
        .leaflet-control-layers-list {
          color: white !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          font-family: inherit !important;
        }
        /* Popup */
        .leaflet-popup-content-wrapper {
          background: ${isSnow ? "#0f172a" : "#1a1a1a"} !important;
          color: white !important;
          border-radius: 12px !important;
        }
        .leaflet-popup-tip {
          background: ${isSnow ? "#0f172a" : "#1a1a1a"} !important;
        }
      `}</style>

      <MapContainer
        center={center}
        zoom={8}
        scrollWheelZoom={isInteracting}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapController center={center} />
        <ZoomBridge />

        {/* Capa Base Dinámica */}
        <TileLayer
          url={
            isSnow
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />

        {/* Selector de Capas de Clima */}
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked name="🌡️ Temperatura">
            <TileLayer
              url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
              opacity={0.7}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="🌧️ Precipitación">
            <TileLayer
              url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
              opacity={0.7}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="💨 Viento">
            <TileLayer
              url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
              opacity={0.7}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <Marker position={center} icon={getCustomIcon(isSnow)}>
          <Popup> {city} </Popup>
        </Marker>
      </MapContainer>

      {/* Botones de Zoom Personalizados */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
        <div
          className={`${bgClass} border ${borderClass} rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl shadow-xl`}
        >
          <button
            id="zoom-in"
            title="Aumentar zoom"
            className="p-3 text-white hover:bg-white/10 border-b border-white/10 transition-colors"
          >
            <Plus size={20} />
          </button>
          <button
            id="zoom-out"
            title="Disminuir zoom"
            className="p-3 text-white hover:bg-white/10 transition-colors"
          >
            <Minus size={20} />
          </button>
        </div>
      </div>

      {/* Leyenda de Escala */}
      <div className="absolute bottom-6 right-6 z-[1000]">
        <div
          className={`${bgClass} backdrop-blur-xl p-5 rounded-[2rem] border ${borderClass} min-w-[170px] shadow-2xl`}
        >
          <p
            className={`text-[10px] font-black uppercase tracking-widest mb-3 opacity-60 ${textColor}`}
          >
            Referencia
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
              <span className={`text-[11px] font-bold ${textColor}`}>
                Condiciones Frías
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></div>
              <span className={`text-[11px] font-bold ${textColor}`}>
                Condiciones Cálidas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
