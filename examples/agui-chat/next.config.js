const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["deepcitation"],
  turbopack: {
    root: path.resolve(__dirname, "../../../.."),
  },
  devIndicators: {
    position: "bottom-left",
  },
};

module.exports = nextConfig;
