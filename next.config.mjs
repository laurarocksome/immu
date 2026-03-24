/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ["*.replit.dev", "*.riker.replit.dev"],
  webpack: (config) => {
    config.output.chunkLoadTimeout = 120000
    return config
  },
}

export default nextConfig
