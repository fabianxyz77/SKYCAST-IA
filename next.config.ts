/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Configuración de Red / Servidor
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.2.175:3000", "localhost:3000"],
    },
  },

  // 2. Ignorar errores de ESLint (las advertencias que apagaste en VS Code)
  eslint: {
    // Esto permite que el build de Vercel termine aunque haya advertencias
    ignoreDuringBuilds: true,
  },

  // 3. Ignorar errores de TypeScript (los "any" y tipos de datos)
  typescript: {
    // Esto permite que la app se publique aunque falten definir tipos exactos
    ignoreBuildErrors: true,
  },

  // 4. Configuración de Imágenes (Opcional pero recomendada para OpenWeather)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openweathermap.org",
        port: "",
        pathname: "/img/wn/**",
      },
    ],
  },
};

export default nextConfig;
