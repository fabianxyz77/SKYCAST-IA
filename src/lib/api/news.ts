export const getNews = async (city: string) => {
  try {
    const response = await fetch(`/api/news?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error("Error en la respuesta de noticias");
    return await response.json();
  } catch (error) {
    console.error("News Fetch Error:", error);
    return [];
  }
};
