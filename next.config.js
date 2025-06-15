/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to fix middleware-manifest.json error
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;