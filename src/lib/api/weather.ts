const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Obtiene el clima actual por coordenadas (Lat/Lon)
 * Útil para la ubicación automática por GPS.
 */
export const getCurrentWeather = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`,
    );

    if (!response.ok) throw new Error("No se pudo obtener el clima actual");

    return await response.json();
  } catch (error) {
    console.error("Error en getCurrentWeather:", error);
    return null;
  }
};

/**
 * Obtiene el pronóstico extendido (5 días / cada 3 horas)
 * Usamos los primeros 8-9 resultados para cubrir las 24hs en el gráfico.
 */
export const getWeatherForecast = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`,
    );

    if (!response.ok) throw new Error("No se pudo obtener el pronóstico");

    const data = await response.json();
    // Retornamos la lista completa. El componente se encarga de hacer el .slice(0,8)
    return data.list;
  } catch (error) {
    console.error("Error en getWeatherForecast:", error);
    return null;
  }
};

/**
 * Busca clima por nombre de ciudad.
 * Ideal para el buscador manual.
 */
export const getWeatherByCity = async (city: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`,
    );

    if (!response.ok) throw new Error("Ciudad no encontrada");

    return await response.json();
  } catch (error) {
    console.error("Error en getWeatherByCity:", error);
    return null;
  }
};
