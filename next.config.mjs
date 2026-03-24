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
  turbopack: {
    watchOptions: {
      ignoredDirectories: [".next", "node_modules", ".cache", ".git", ".local"],
    },
  },
  webpack: (config) => {
    config.output.chunkLoadTimeout = 120000
    config.watchOptions = {
      ignored: /\/(\.next|node_modules|\.cache|\.git|\.local)\//,
      aggregateTimeout: 500,
    }
    return config
  },
}

export default nextConfig
