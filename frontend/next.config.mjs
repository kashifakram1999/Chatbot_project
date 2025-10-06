/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE:
      process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
