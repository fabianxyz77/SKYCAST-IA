'use client';

import { useState, useEffect, useRef } from 'react';
import { LocateFixed, X, MapPin } from 'lucide-react';

interface SearchCityProps {
  onSearch: (city: string) => void;
  onGPS: () => void;
}

export default function SearchCity({ onSearch, onGPS }: SearchCityProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 3) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Error buscando sugerencias", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleSelect = (city: any) => {
    onSearch(`${city.name}, ${city.country}`);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center gap-2 bg-slate-900 border border-white/10 p-1.5 rounded-2xl shadow-inner">
        <button 
          type="button"
          onClick={onGPS}
          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
        >
          <LocateFixed size={18} />
        </button>

        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ciudad..."
          className="flex-1 bg-transparent text-sm outline-none px-1 text-white"
        />

        {query && (
          <button type="button" onClick={() => setQuery('')} className="p-1 text-slate-500">
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && query.length >= 3 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl">
          {suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left border-b border-white/5 last:border-0"
              >
                <MapPin size={14} className="text-blue-500 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{s.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase truncate">
                    {s.state ? `${s.state}, ` : ''}{s.country}
                  </p>
                </div>
              </button>
            ))
          ) : (
            !isSearching && (
              <div className="p-4 text-[10px] text-slate-500 text-center uppercase tracking-widest">
                No se encontraron resultados
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}