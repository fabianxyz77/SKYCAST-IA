"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, Loader2, History, Search } from "lucide-react";
import { createPortal } from "react-dom";

interface SearchCityProps {
  onSearch: (city: string) => void;
  onGPS: () => void;
  isSearchingGPS?: boolean;
  isSnow?: boolean;
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Para poder usar createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMobileSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isMobileSearchOpen]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("weather-history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Cerrar dropdown desktop al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopRef.current &&
        !desktopRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    closeMobile();
  };

  const handleHistorySelect = (cityName: string) => {
    onSearch(cityName);
    closeMobile();
  };

  const closeMobile = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setIsMobileSearchOpen(false);
  };

  const containerStyles = isSnow
    ? "bg-slate-100 border-slate-200 text-slate-900"
    : "bg-white/5 border-white/10 text-white";

  const modalBg = isSnow
    ? "bg-white/98 border-slate-200"
    : "bg-[#0F0F0F]/98 border-white/10";

  // ====== MOBILE MODAL via Portal (se renderiza directo en body) ======
  const mobileModal =
    isMobileSearchOpen && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex flex-col justify-end md:hidden"
            style={{ isolation: "isolate" }}
          >
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={closeMobile}
              style={{ animation: "fadeIn 0.2s ease forwards" }}
            />

            {/* Bottom Sheet */}
            <div
              className={`relative w-full rounded-t-[2rem] border-t border-x shadow-2xl ${modalBg}`}
              style={{
                animation:
                  "slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards",
                maxHeight: "85dvh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Input */}
              <div className="px-5 pt-2 pb-4 shrink-0">
                <div
                  className={`flex items-center gap-3 rounded-2xl px-4 h-14 border transition-all ${
                    isSnow
                      ? "bg-slate-100 border-slate-300 focus-within:border-emerald-500"
                      : "bg-white/8 border-white/10 focus-within:border-[#2ECC71]/60"
                  }`}
                >
                  <Search
                    size={20}
                    className={isSnow ? "text-emerald-600" : "text-[#2ECC71]"}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                    }}
                    placeholder="¿A dónde vamos?"
                    className={`flex-1 bg-transparent text-lg outline-none font-bold placeholder:opacity-30 ${
                      isSnow ? "text-slate-900" : "text-white"
                    }`}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  {isSearching ? (
                    <Loader2 size={18} className="animate-spin opacity-40" />
                  ) : query ? (
                    <button
                      onClick={() => setQuery("")}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10"
                    >
                      <X
                        size={16}
                        className={isSnow ? "text-slate-600" : "text-white/60"}
                      />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Divider */}
              <div
                className={`mx-5 h-px shrink-0 ${isSnow ? "bg-slate-200" : "bg-white/8"}`}
              />

              {/* Results */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <SuggestionsList
                  query={query}
                  suggestions={suggestions}
                  history={history}
                  isSearching={isSearching}
                  handleSelect={handleSelect}
                  handleHistorySelect={handleHistorySelect}
                  isSnow={isSnow}
                />
              </div>

              {/* Footer */}
              <div
                className={`shrink-0 px-5 pt-3 pb-8 ${isSnow ? "bg-slate-50" : "bg-white/3"}`}
              >
                <button
                  onClick={closeMobile}
                  className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-[0.25em] transition-all active:scale-95 ${
                    isSnow
                      ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      : "bg-white/8 text-white/40 hover:bg-white/12"
                  }`}
                >
                  Cerrar
                </button>
              </div>
            </div>

            <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="relative flex items-center gap-2" ref={desktopRef}>
        {/* ===== DESKTOP SEARCH ===== */}
        <div
          className={`hidden md:flex items-center gap-3 border h-11 px-4 rounded-2xl w-56 lg:w-72 transition-all focus-within:ring-2 ring-[#2ECC71]/30 ${containerStyles}`}
        >
          <Search size={16} className="opacity-70 shrink-0" />
          <input
            type="text"
            value={query}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            placeholder="Buscar ciudad..."
            className="flex-1 bg-transparent text-sm outline-none font-medium placeholder:opacity-100 min-w-0"
            autoComplete="off"
          />
          {isSearching && (
            <Loader2 size={13} className="animate-spin opacity-40 shrink-0" />
          )}

          {/* Dropdown Desktop */}
          {showDropdown && (query.length > 0 || history.length > 0) && (
            <div
              ref={dropdownRef}
              className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50 backdrop-blur-2xl ${modalBg}`}
            >
              <SuggestionsList
                query={query}
                suggestions={suggestions}
                history={history}
                isSearching={isSearching}
                handleSelect={handleSelect}
                handleHistorySelect={handleHistorySelect}
                isSnow={isSnow}
              />
            </div>
          )}
        </div>

        {/* ===== MOBILE SEARCH BUTTON ===== */}
        <button
          onClick={() => setIsMobileSearchOpen(true)}
          className={`md:hidden flex items-center justify-center w-11 h-11 rounded-2xl border active:scale-90 transition-all ${containerStyles}`}
          aria-label="Buscar ciudad"
        >
          <Search size={20} />
        </button>
      </div>

      {/* Portal modal para mobile */}
      {mobileModal}
    </>
  );
}

function SuggestionsList({
  query,
  suggestions,
  history,
  isSearching,
  handleSelect,
  handleHistorySelect,
  isSnow = false,
}: any) {
  const textColor = isSnow ? "text-slate-900" : "text-white";
  const subColor = isSnow ? "text-slate-500" : "text-white/40";
  const hoverBg = isSnow ? "hover:bg-slate-100" : "hover:bg-white/6";
  const borderColor = isSnow ? "border-slate-100" : "border-white/5";

  return (
    <div className="flex flex-col w-full">
      {query.length >= 3 ? (
        suggestions.length > 0 ? (
          suggestions.map((s: any, i: number) => (
            <button
              key={i}
              onClick={() => handleSelect(s)}
              className={`w-full flex items-center gap-4 px-5 py-4 text-left border-b last:border-0 transition-colors group ${hoverBg} ${borderColor}`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#2ECC71]/10 flex items-center justify-center text-[#2ECC71] group-hover:scale-110 transition-transform shrink-0">
                <MapPin size={17} />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-sm font-bold leading-tight truncate ${textColor}`}
                >
                  {s.name}
                </p>
                <p
                  className={`text-[10px] uppercase font-black tracking-widest mt-0.5 ${subColor}`}
                >
                  {s.state ? `${s.state}, ` : ""}
                  {s.country}
                </p>
              </div>
            </button>
          ))
        ) : (
          !isSearching && (
            <div className="py-14 flex flex-col items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                <X size={22} />
              </div>
              <p className="text-xs font-black text-red-400 uppercase tracking-widest">
                Ciudad no encontrada
              </p>
            </div>
          )
        )
      ) : history.length > 0 ? (
        <div>
          <div className="px-5 pt-5 pb-3">
            <p className="text-[9px] font-black text-[#2ECC71] uppercase tracking-[0.2em]">
              Búsquedas recientes
            </p>
          </div>
          {history.map((cityName: string, i: number) => (
            <button
              key={i}
              onClick={() => handleHistorySelect(cityName)}
              className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors border-b last:border-0 ${hoverBg} ${borderColor}`}
            >
              <History size={16} className={`shrink-0 ${subColor}`} />
              <p
                className={`text-sm font-semibold truncate ${isSnow ? "text-slate-700" : "text-white/70"}`}
              >
                {cityName}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="py-14 text-center">
          <Search
            size={28}
            className={`mx-auto mb-3 opacity-10 ${textColor}`}
          />
          <p
            className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ${textColor}`}
          >
            Escribe al menos 3 letras
          </p>
        </div>
      )}
    </div>
  );
}
