import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // PWA desabilitado temporariamente para garantir build limpo no Vercel
};

export default nextConfig;
