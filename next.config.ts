/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.2.175:3000", "localhost:3000"]
    }
  }
};

export default nextConfig;