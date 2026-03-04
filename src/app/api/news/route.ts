import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "";
  const API_KEY = process.env.NEWS_API_KEY;

  // Cambiamos la query para que sea más general si falla la específica
  const query = city ? `${city} clima` : "medio ambiente";

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=es&max=6&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Log para debuguear en la terminal de VS Code
    console.log("GNews Response:", data);

    return NextResponse.json(data.articles || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
