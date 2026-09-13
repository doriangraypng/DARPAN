import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  productionBrowserSourceMaps: false,
  compress: true, // Reduce JS sizes natively
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
