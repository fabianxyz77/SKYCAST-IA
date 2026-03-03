import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, context, captchaToken } = await req.json();

    const groqKey = process.env.GROQ_API_KEY;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    if (!groqKey || !recaptchaSecret) {
      return NextResponse.json(
        { answer: "Configuración incompleta en el servidor. ⚙️" },
        { status: 500 },
      );
    }

    // --- LOGICA DE CAPTCHA FLEXIBLE ---
    // Solo validamos con Google si es el PRIMER mensaje (cuando el historial tiene 1 solo mensaje)
    // O si el token es nuevo. Si no, dejamos pasar para permitir fluidez.
    if (messages.length <= 1 && captchaToken) {
      const verifyRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`,
        { method: "POST" },
      );
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        return NextResponse.json(
          {
            answer: "La verificación de seguridad expiró. Refresca el chat. 🤖",
          },
          { status: 403 },
        );
      }
    }
    // ----------------------------------

    const mood =
      context.temp > 28
        ? "un poco agobiado por el calor 🥵"
        : context.temp < 10
          ? "tiritando de frío ❄️"
          : "con mucha energía ✨";

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
          messages: [
            {
              role: "system",
              content: `Eres SkyCast IA en ${context.city}. Estás ${mood}. Datos: ${context.temp}°C, Humedad ${context.humidity}%. Responde corto, divertido y da consejos de ropa.`,
            },
            ...messages, // Aquí va el historial que mandamos desde WeatherChat
          ],
          max_tokens: 200,
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { answer: "IA ocupada. Reintenta. 💤" },
        { status: 503 },
      );
    }

    const data = await response.json();
    return NextResponse.json({ answer: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json(
      { answer: "Error de conexión. 📡" },
      { status: 500 },
    );
  }
}
