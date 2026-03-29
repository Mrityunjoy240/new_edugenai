/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    serverComponentsExternalPackages: ['@xenova/transformers', 'pdf-parse'],
  },
}

module.exports = nextConfig
