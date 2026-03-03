import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, context, captchaToken } = await req.json();

    const groqKey = process.env.GROQ_API_KEY;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    if (!groqKey || !recaptchaSecret) {
      return NextResponse.json(
        { answer: "Faltan llaves de API. ⚙️" },
        { status: 500 },
      );
    }

    // 1. Validación de seguridad (Solo primer mensaje para evitar errores de duplicado)
    if (messages.length <= 1 && captchaToken) {
      const verifyRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`,
        { method: "POST" },
      );
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json(
          { answer: "Error de seguridad. Reintenta." },
          { status: 403 },
        );
      }
    }

    // 2. System Prompt: Sincero, técnico y divertido
    const systemPrompt = {
      role: "system",
      content: `Eres SkyCast IA en ${context.city}. Tu estilo es directo, sincero y ligeramente sarcástico. No endulces el clima.
      
      DATOS REALES:
      - Temperatura: ${context.temp}°C (Sensación: ${context.feels_like}°C)
      - Humedad: ${context.humidity}%
      - Viento: ${context.wind_speed} km/h
      - Presión: ${context.pressure}
      - Probabilidad de lluvia: ${context.pop}
      - Estado: ${context.description}

      REGLAS CRÍTICAS:
      1. Usa los datos técnicos (especialmente presión y probabilidad de lluvia) para dar consejos reales.
      2. Sé breve (máximo 25 palabras).
      3. Tono: Divertido pero sincero. Si el clima es malo, dilo sin vueltas.
      4. EMOJIS: Máximo 2 por respuesta. No más.
      5. Si preguntan qué ponerse, usa la sensación térmica de ${context.feels_like}°C.`,
    };

    // 3. Llamada a Groq
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
          messages: [systemPrompt, ...messages],
          max_tokens: 150,
          temperature: 0.7, // Equilibrio entre seriedad y creatividad
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { answer: "La IA se tomó un café. Reintenta pronto." },
        { status: 503 },
      );
    }

    const data = await response.json();
    return NextResponse.json({ answer: data.choices[0].message.content });
  } catch (error) {
    console.error("Error en API:", error);
    return NextResponse.json(
      { answer: "Error de conexión. 📡" },
      { status: 500 },
    );
  }
}
