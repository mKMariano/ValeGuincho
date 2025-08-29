/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // <--- ADICIONADO
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
