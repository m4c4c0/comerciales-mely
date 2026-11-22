/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep builds independent from the availability of Google's font server.
  optimizeFonts: false,
};

module.exports = nextConfig;
