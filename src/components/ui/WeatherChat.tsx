'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { chatWithAi } from '@/lib/api/mistral'; // IMPORTAMOS LA ACCIÓN DIRECTA

export default function WeatherChat({ city, temp }: { city: string; temp: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // LLAMADA DIRECTA A LA FUNCIÓN (Sin rutas de API!)
      const answer = await chatWithAi(userMsg, { city, temp });
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error de conexión con el cerebro IA. 📡" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 shadow-blue-500/20"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] h-[450px] bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-blue-600 p-5 flex items-center gap-3">
            <Sparkles size={18} className="text-white animate-pulse" />
            <p className="font-bold text-sm">Asistente SkyCast</p>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-slate-500 text-center text-[11px] mt-10">
                ¿Querés saber qué ponerte hoy en {city}? Preguntame.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white/10 text-slate-200 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-slate-500 text-[10px] animate-pulse">Escribiendo...</div>}
          </div>

          <div className="p-4 bg-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribí..."
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500"
            />
            <button onClick={handleSend} className="bg-blue-600 p-2 rounded-xl transition-colors">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}