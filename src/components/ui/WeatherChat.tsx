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
  // Nuevas props técnicas para la IA
  pressure?: number | string;
  pop?: number;
}

export default function WeatherChat({
  city,
  temp,
  weatherType,
  humidity,
  feels_like,
  wind_speed,
  description,
  pressure,
  pop,
}: WeatherChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  const isSnow = weatherType === "snow";
  const isHot = weatherType === "hot";
  const isRain = ["rain", "thunder", "drizzle"].includes(weatherType);

  const theme = {
    header: isHot ? "bg-[#FF5733]" : isSnow ? "bg-[#3498DB]" : "bg-[#000000]",
    container: isSnow
      ? "bg-white/95 border-2 border-[#3498DB] text-slate-900"
      : "bg-[#1A1A1A]/95 border-2 border-white/20 text-white",
    input: isSnow
      ? "bg-white border-2 border-[#3498DB] text-slate-900"
      : "bg-[#2D2D2D] border-2 border-white/10 text-white",
    userMsg: "bg-[#E74C3C] text-white",
    aiMsg: isSnow ? "bg-[#ECF0F1] text-slate-800" : "bg-[#3D3D3D] text-white",
    button: "bg-[#2ECC71]",
  };

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async (customMsg?: string) => {
    const msgText = (customMsg || input).trim();

    if (!msgText || isLoading || !captchaToken) return;
    if (msgText.length > 300) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: msgText },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          captchaToken: captchaToken,
          context: {
            city,
            temp,
            humidity,
            feels_like,
            wind_speed,
            description,
            pressure: pressure || "N/A",
            pop: pop !== undefined ? `${Math.round(pop * 100)}%` : "0%",
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.answer);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
      setIsVerified(true);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error de conexión. 📡" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-white ${theme.header}`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div
          className={`absolute bottom-20 right-0 w-[350px] h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 ${theme.container}`}
        >
          <div
            className={`${theme.header} p-4 flex items-center gap-3 text-white font-bold`}
          >
            <Sparkles size={20} />
            <span className="text-sm tracking-wide uppercase">
              SkyCast Chat
            </span>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
          >
            {!isVerified && !captchaToken && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <p className="text-[10px] font-black uppercase opacity-60 text-center px-6 tracking-widest">
                  Validación de Seguridad
                </p>
                <ReCAPTCHA
                  sitekey={siteKey}
                  onChange={(t) => {
                    setCaptchaToken(t);
                    setIsVerified(true);
                  }}
                  theme={isSnow ? "light" : "dark"}
                />
              </div>
            )}

            {isVerified && messages.length === 0 && (
              <div className="pt-2">
                <button
                  onClick={() =>
                    handleSend(`¿Cómo está el clima para salir ahora?`)
                  }
                  className="w-full flex items-center gap-2 p-3 rounded-xl text-xs font-black border-2 border-current/20 hover:bg-current/10 transition-colors text-left uppercase tracking-tighter"
                >
                  {isSnow ? <Snowflake size={16} /> : <Shirt size={16} />}
                  ¿Qué me pongo hoy?
                </button>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-[13px] font-bold shadow-sm ${m.role === "user" ? theme.userMsg : theme.aiMsg}`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="text-[10px] font-black opacity-40 px-2 uppercase italic animate-pulse">
                SkyCast está pensando...
              </div>
            )}
          </div>

          <div
            className={`p-4 border-t-2 border-current/10 ${!isVerified && "opacity-20 pointer-events-none"}`}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                maxLength={300}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Pregunta sobre el clima..."
                className={`flex-1 outline-none rounded-xl px-4 py-2 text-sm font-bold ${theme.input}`}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className={`p-2 rounded-xl text-white shadow-lg transition-all active:scale-90 disabled:grayscale ${theme.button}`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
