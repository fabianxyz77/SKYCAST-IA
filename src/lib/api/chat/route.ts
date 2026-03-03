import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, context, captchaToken } = await req.json();

    // Verificamos que las keys existan en el servidor
    const groqKey = process.env.GROQ_API_KEY;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    if (!groqKey || !recaptchaSecret) {
      console.error("Faltan variables de entorno en Vercel");
      return NextResponse.json(
        { answer: "Configuración incompleta en el servidor. ⚙️" },
        { status: 500 },
      );
    }

    // 1. Validar reCAPTCHA
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

    // 2. Llamar a Groq
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey.trim()}`, // .trim() por si hay espacios
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `Eres un asistente de clima divertido en ${context.city}. Responde brevemente sobre: ${context.temp}°C, Humedad ${context.humidity}%, Viento ${context.wind_speed}km/h.`,
            },
            { role: "user", content: message },
          ],
          max_tokens: 150,
        }),
      },
    );

    // AQUÍ ESTABA EL ERROR: Verificar si Groq respondió bien antes de hacer .json()
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de Groq:", errorText);
      return NextResponse.json(
        { answer: "La IA está descansando. Intentá de nuevo. 💤" },
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
