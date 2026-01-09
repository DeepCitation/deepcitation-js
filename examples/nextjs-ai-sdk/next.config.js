/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@deepcitation/deepcitation-js"],
  },
};

module.exports = nextConfig;
