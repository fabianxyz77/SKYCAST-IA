"use server";

/**
 * FUNCIÓN: getAiWeatherAnalysis
 * Se encarga del análisis automático que aparece en la MainWeatherCard (Caja Azul).
 * Es un Server Action que se ejecuta al cargar los datos del clima.
 */
export async function getAiWeatherAnalysis(weatherData: any) {
  const apiKey = process.env.GROQ_API_KEY;
  const API_URL = "https://api.groq.com/openai/v1/chat/completions";

  if (!apiKey) {
    console.error(
      "Error: GROQ_API_KEY no configurada en las variables de entorno.",
    );
    return "Falta la API Key. 🔑";
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "Eres una API de clima práctica. Tu objetivo es dar un consejo de vestimenta o actividad basado en los datos. Máximo 20 palabras y un emoji. Sé directo, breve y no uses comillas ni introducciones.",
          },
          {
            role: "user",
            content: `Ciudad: ${weatherData.name}, Temp: ${Math.round(weatherData.main.temp)}°C, Humedad: ${weatherData.main.humidity}%, Viento: ${weatherData.wind.speed}km/h, Estado: ${weatherData.weather[0].description}.`,
          },
        ],
        temperature: 0.3, // Temperatura baja para que sea consistente y directo
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || "¡Disfrutá el día! ☀️";
  } catch (error) {
    console.error("Error en getAiWeatherAnalysis:", error);
    return "Análisis no disponible. ☁️";
  }
}
