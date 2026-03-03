"use client";

import { useState, useEffect, useRef } from "react";
import { LocateFixed, X, MapPin, Loader2, History } from "lucide-react";

interface SearchCityProps {
  onSearch: (city: string) => void;
  onGPS: () => void;
  isSearchingGPS?: boolean;
  isSnow?: boolean; // Prop para detectar modo nieve
}

export default function SearchCity({
  onSearch,
  onGPS,
  isSearchingGPS = false,
  isSnow = false,
}: SearchCityProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem("weather-history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`,
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Error buscando sugerencias", err);
      } finally {
        setIsSearching(false);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(debounce);
  }, [query]);

  const saveToHistory = (cityName: string) => {
    const newHistory = [
      cityName,
      ...history.filter((h) => h !== cityName),
    ].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("weather-history", JSON.stringify(newHistory));
  };

  const handleSelect = (city: any) => {
    const fullName = `${city.name}, ${city.country}`;
    onSearch(fullName);
    saveToHistory(fullName);
    setQuery("");
    setShowDropdown(false);
  };

  const handleHistorySelect = (cityName: string) => {
    onSearch(cityName);
    setQuery("");
    setShowDropdown(false);
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Clases dinámicas según el modo nieve
  const containerStyles = isSnow
    ? "bg-slate-900 border-black/10 shadow-xl focus-within:border-black/40"
    : "bg-black/10  border-white/10 shadow-2xl focus-within:border-white/40";

  const textStyles = isSnow ? "text-white" : "text-white";
  const placeholderStyles = isSnow
    ? "placeholder:text-white/40"
    : "placeholder:text-white/40";
  const iconButtonStyles = isSnow
    ? isSearchingGPS
      ? "bg-white/10 text-white"
      : "text-white/70 hover:bg-white/10"
    : isSearchingGPS
      ? "bg-white/20 text-white"
      : "text-white/70 hover:bg-white/10";

  const dropdownBg = isSnow ? "bg-slate-900" : "bg-slate-700/95";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={`flex items-center gap-2 border p-2 rounded-2xl transition-all ${containerStyles}`}
      >
        <button
          type="button"
          onClick={onGPS}
          disabled={isSearchingGPS}
          className={`p-2 rounded-xl transition-all flex items-center justify-center ${iconButtonStyles}`}
        >
          {isSearchingGPS ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <LocateFixed size={20} />
          )}
        </button>

        <input
          type="text"
          value={query}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ciudad..."
          className={`flex-1 bg-transparent text-sm outline-none px-1 font-medium ${textStyles} ${placeholderStyles}`}
        />

        {isSearching && (
          <Loader2 size={14} className="animate-spin text-white/40 mr-2" />
        )}

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="p-1 text-white/40 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className={`absolute top-full left-0 w-full mt-2 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${dropdownBg}`}
        >
          {query.length >= 3 ? (
            suggestions.length > 0 ? (
              suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left border-b border-white/5 last:border-0 transition-colors group"
                >
                  <MapPin
                    size={14}
                    className="text-white/40 group-hover:text-white"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{s.name}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">
                      {s.state ? `${s.state}, ` : ""}
                      {s.country}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              !isSearching && (
                <div className="p-6 text-[20px] text-red-400/90 text-center uppercase tracking-widest">
                  Sin resultados
                </div>
              )
            )
          ) : history.length > 0 ? (
            <div>
              <div className="px-4 py-2 border-b border-white/5 bg-white/5">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                  Búsquedas recientes
                </p>
              </div>
              {history.map((cityName, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleHistorySelect(cityName)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left border-b border-white/5 last:border-0 transition-colors group"
                >
                  <History
                    size={14}
                    className="text-white/20 group-hover:text-white/60"
                  />
                  <p className="text-sm font-medium text-white/80">
                    {cityName}
                  </p>
                </button>
              ))}
              <button
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem("weather-history");
                }}
                className="w-full py-2 text-[9px] font-black text-red-400/50 hover:text-red-400 uppercase tracking-widest bg-red-500/5 hover:bg-red-500/10 transition-colors"
              >
                Limpiar historial
              </button>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">
                Escribe para buscar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
