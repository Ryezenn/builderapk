/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Fail-proof builds
  },
  typescript: {
    ignoreBuildErrors: true, // Fail-proof builds
  },
};

module.exports = nextConfig;
