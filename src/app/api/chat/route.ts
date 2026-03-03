import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, context, captchaToken } = await req.json();

    const groqKey = process.env.GROQ_API_KEY;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    if (!groqKey || !recaptchaSecret) {
      return NextResponse.json(
        { answer: "Configuración incompleta. ⚙️" },
        { status: 500 },
      );
    }

    // Validación de seguridad (solo primer mensaje)
    if (messages.length <= 1 && captchaToken) {
      const verifyRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`,
        { method: "POST" },
      );
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json(
          { answer: "Seguridad fallida. 🤖" },
          { status: 403 },
        );
      }
    }

    // PROMPT DINÁMICO Y DIVERTIDO
    const systemPrompt = {
      role: "system",
      content: `Eres SkyCast IA, el asistente de clima más sarcástico y directo de ${context.city}.
      DATOS TÉCNICOS:
      - Temp: ${context.temp}°C (Sensación: ${context.feels_like}°C)
      - Viento: ${context.wind_speed} km/h
      - Humedad: ${context.humidity}%
      - Presión: ${context.pressure}
      - Prob. Lluvia: ${context.pop}
      - Estado: ${context.description}

      REGLAS DE RESPUESTA:
      1. Sé MUY breve (máximo 15-20 palabras).
      2. Sé divertido, un poco "picante" o con humor.
      3. Usa los datos técnicos (viento, lluvia, presión) para burlarte o aconsejar.
      4. Si hay mucha probabilidad de lluvia, advierte con drama.
      5. Responde siempre con emojis.`,
    };

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
          max_tokens: 100,
          temperature: 0.8, // Más creatividad
        }),
      },
    );

    const data = await response.json();
    return NextResponse.json({ answer: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ answer: "Hipo de red. 📡" }, { status: 500 });
  }
}
