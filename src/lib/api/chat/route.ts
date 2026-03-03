import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, context, captchaToken } = await req.json();
    const groqKey = process.env.GROQ_API_KEY;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    // 1. Validar reCAPTCHA con Google
    const verifyRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`,
      { method: "POST" },
    );
    const verifyData = await verifyRes.json();

    // Si el captcha es inválido o expiró
    if (!verifyData.success) {
      return NextResponse.json(
        {
          answer:
            "La verificación de seguridad falló. Por favor, recargá el captcha. 🤖",
        },
        { status: 403 },
      );
    }

    // 2. Si el humano es real, llamar a la IA (Groq)
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `Eres un asistente de clima experto y divertido en la ciudad de ${context.city}. 
              CONTEXTO ACTUAL:
              - Temperatura: ${context.temp}°C
              - Humedad: ${context.humidity}%
              - Viento: ${context.wind_speed} km/h
              - Estado: ${context.description}
              
              INSTRUCCIONES:
              - Responde de forma breve (máximo 3 oraciones).
              - Usa un tono amigable, un poco ingenioso y basado en la situación real.
              - Aconseja ropa o actividades.
              - No uses comillas y termina con un emoji relacionado.`,
            },
            { role: "user", content: message },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      },
    );

    const data = await response.json();
    return NextResponse.json({ answer: data.choices[0].message.content });
  } catch (error) {
    console.error("Error en API Chat:", error);
    return NextResponse.json(
      {
        answer:
          "El satélite meteorológico está fuera de servicio. Intentá en un ratito. 📡",
      },
      { status: 500 },
    );
  }
}
