import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Recibimos 'messages' en lugar de un solo 'message' para tener memoria
    const { messages, context, captchaToken } = await req.json();

    const groqKey = process.env.GROQ_API_KEY;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    if (!groqKey || !recaptchaSecret) {
      return NextResponse.json(
        { answer: "Configuración incompleta en el servidor. ⚙️" },
        { status: 500 },
      );
    }

    // 1. Validar reCAPTCHA
    // IMPORTANTE: Solo validamos si viene un captchaToken (la primera vez)
    // Para mensajes subsiguientes, confiamos en la sesión del cliente
    if (captchaToken) {
      const verifyRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`,
        { method: "POST" },
      );
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        return NextResponse.json(
          { answer: "La verificación de seguridad falló. 🤖" },
          { status: 403 },
        );
      }
    }

    // 2. Definir la personalidad según el clima
    const mood =
      context.temp > 28
        ? "un poco agobiado por el calor 🥵"
        : context.temp < 10
          ? "tiritando de frío ❄️"
          : "con mucha energía ✨";

    const systemPrompt = {
      role: "system",
      content: `Eres SkyCast IA, un asistente de clima con mucha personalidad en ${context.city}. 
      Actualmente estás ${mood}. 
      DATOS REALES: ${context.temp}°C, Humedad ${context.humidity}%, Viento ${context.wind_speed}km/h, Clima: ${context.description}.
      REGLAS:
      1. Sé breve (máximo 2 párrafos).
      2. Usa emojis divertidos.
      3. Si te preguntan por ropa, da consejos basados en los ${context.temp}°C actuales.
      4. Mantén un tono amistoso y un poco ocurrente.`,
    };

    // 3. Llamar a Groq con el historial completo
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [systemPrompt, ...messages], // Incluimos todo el historial
          max_tokens: 250,
          temperature: 0.7, // Para que sea más creativo
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { answer: "La IA se quedó sin palabras. 💤" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({ answer: data.choices[0].message.content });
  } catch (error) {
    console.error("Error crítico:", error);
    return NextResponse.json(
      { answer: "Error inesperado en la conexión. 📡" },
      { status: 500 },
    );
  }
}
