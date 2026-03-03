"use client";

import { useState, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Shirt,
  Snowflake,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface WeatherChatProps {
  city: string;
  temp: number;
  weatherType: string;
  humidity: number;
  feels_like: number;
  wind_speed: number;
  description: string;
}

export default function WeatherChat({
  city,
  temp,
  weatherType,
  humidity,
  feels_like,
  wind_speed,
  description,
}: WeatherChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  const isSnow = weatherType === "snow";
  const isHot = weatherType === "hot";
  const isRain = ["rain", "thunder", "drizzle"].includes(weatherType);

  const theme = {
    accent: isHot
      ? "bg-orange-600"
      : isSnow
        ? "bg-slate-900"
        : isRain
          ? "bg-blue-800"
          : "bg-slate-700",
    container: isSnow
      ? "bg-white/80 border-black/10 text-slate-900"
      : "bg-slate-800/90 border-white/10 text-white",
    input: isSnow
      ? "bg-black/5 border-black/10 text-slate-900"
      : "bg-white/5 border-white/10 text-white",
  };

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async (customMsg?: string) => {
    const msgToSend = customMsg || input.trim();
    if (!msgToSend || isLoading || !captchaToken) return;

    setMessages((prev) => [...prev, { role: "user", content: msgToSend }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msgToSend,
          captchaToken: captchaToken,
          context: {
            city,
            temp,
            humidity,
            feels_like,
            wind_speed,
            description,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.answer);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "Error de conexión. 📡",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 text-white ${theme.accent} border border-white/10`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div
          className={`absolute bottom-20 right-0 w-[350px] h-[550px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 border backdrop-blur-xl ${theme.container}`}
        >
          {/* Header */}
          <div
            className={`${theme.accent} p-5 flex items-center gap-3 text-white`}
          >
            <Sparkles size={18} className="animate-pulse" />
            <p className="font-bold text-sm">Asistente SkyCast IA</p>
          </div>

          {/* Chat Body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
          >
            {!captchaToken && (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                <p className="text-[10px] uppercase tracking-widest font-black opacity-50">
                  Verificá que eres humano
                </p>
                <ReCAPTCHA
                  sitekey={siteKey}
                  onChange={(t) => setCaptchaToken(t)}
                  theme={isSnow ? "light" : "dark"}
                />
              </div>
            )}

            {captchaToken && messages.length === 0 && (
              <div className="pt-4">
                <button
                  onClick={() => handleSend("¿Qué ropa me pongo hoy?")}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-xs border border-current/10 hover:bg-current/5 transition-colors"
                >
                  {isSnow ? <Snowflake size={16} /> : <Shirt size={16} />}
                  ¿Qué ropa me pongo hoy en {city}?
                </button>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs ${m.role === "user" ? `${theme.accent} text-white rounded-tr-none` : "bg-current/10 rounded-tl-none"}`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-[10px] opacity-50 animate-pulse">
                IA pensando...
              </div>
            )}
          </div>

          {/* Input Area */}
          <div
            className={`p-4 border-t border-white/5 ${!captchaToken && "opacity-20 pointer-events-none"}`}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Preguntá lo que quieras..."
                className={`flex-1 outline-none border rounded-xl px-4 py-2 text-xs ${theme.input}`}
              />
              <button
                onClick={() => handleSend()}
                className={`p-2 rounded-xl text-white ${theme.accent} active:scale-90 transition-transform`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
