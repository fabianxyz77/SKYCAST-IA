'use server';

// FUNCIÓN 1: Para el análisis automático que aparece en la caja azul
export async function getAiWeatherAnalysis(weatherData: any) {
  const apiKey = process.env.GROQ_API_KEY;
  const API_URL = "https://api.groq.com/openai/v1/chat/completions";

  if (!apiKey) return "Falta la API Key. 🔑";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "user", 
            content: `Da un consejo de clima para ${weatherData.name}, ${Math.round(weatherData.main.temp)}°C. Sé breve (10 palabras) y usa un emoji.` 
          }
        ],
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || "¡Disfrutá el día! ☀️";
  } catch (error) {
    return "Análisis no disponible. ☁️";
  }
}

// FUNCIÓN 2: Para el Chat interactivo
export async function chatWithAi(message: string, context: { city: string, temp: number }) {
  const apiKey = process.env.GROQ_API_KEY;
  const API_URL = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: `Eres un asistente de clima divertido. Ciudad: ${context.city}, Temp: ${context.temp}°C. Responde en español, corto y con emojis.` 
          },
          { role: "user", content: message }
        ],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    return "Uy, me dio un síncope digital. 😵‍💫 Reintentá.";
  }
}