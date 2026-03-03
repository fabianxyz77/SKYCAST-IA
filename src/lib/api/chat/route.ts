import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message, context } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: `Eres un asistente de clima experto. Contexto: Ciudad ${context.city}, Temp ${context.temp}°C. Responde de forma breve y divertida conforme a la situacion humana en el entorno diario compuesto por la actual metereologia.` },
          { role: "user", content: message }
        ],
        max_tokens: 150
      }),
    });

    const data = await response.json();
    return NextResponse.json({ answer: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ answer: "No pude conectarme con el cerebro de la IA. 🧠" }, { status: 500 });
  }
}