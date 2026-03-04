/src/
┣ 📂app
┃ ┣ 📂api
┃ ┃ ┗ 📂chat
┃ ┃ ┃ ┗ 📜route.ts
┃ ┣ 📜globals.css
┃ ┣ 📜layout.tsx
┃ ┗ 📜page.tsx
┣ 📂components
┃ ┗ 📂ui
┃ ┃ ┣ 📜ForecastCard.tsx
┃ ┃ ┣ 📜MainWeatherCard.tsx
┃ ┃ ┣ 📜SearchCity.tsx
┃ ┃ ┣ 📜WeatherAlerts.tsx
┃ ┃ ┣ 📜WeatherChat.tsx
┃ ┃ ┗ 📜WeatherStats.tsx
┣ 📂hooks
┃ ┗ 📜useLocation.ts
┗ 📂lib
┃ ┗ 📂api
┃ ┃ ┣ 📜mistral.ts
┃ ┃ ┗ 📜weather.ts

---

## Resumen de funcion en cada archivos:

📦 src
┣ 📂 app # Next.js App Router
┃ ┣ 📂 api/chat # Endpoint para el chat con IA (Mistral)
┃ ┣ 📜 globals.css # Estilos globales y Tailwind
┃ ┣ 📜 layout.tsx # Estructura base de la aplicación
┃ ┗ 📜 page.tsx # Dashboard principal del clima
┣ 📂 components/ui # Componentes visuales (Cards y Widgets)
┃ ┣ 📜 ForecastCard # Pronóstico para los próximos días
┃ ┣ 📜 MainWeatherCard # Estado del clima actual (Principal)
┃ ┣ 📜 SearchCity # Buscador de ciudades con autocompletado
┃ ┣ 📜 WeatherAlerts # Avisos meteorológicos importantes
┃ ┣ 📜 WeatherChat # Interfaz del chat inteligente
┃ ┗ 📜 WeatherStats # Estadísticas detalladas (Humedad, Viento, etc.)
┣ 📂 hooks # Hooks personalizados
┃ ┗ 📜 useLocation.ts # Gestión de geolocalización del usuario
┗ 📂 lib/api # Clientes y configuraciones de APIs
┣ 📜 mistral.ts # Configuración del modelo de IA
┗ 📜 weather.ts # Integración con la API de clima
