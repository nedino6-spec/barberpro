import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  }
});

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/:path*` : 'http://localhost:3001/api/auth/:path*',
      },
      {
        source: '/api/appointments/:path*',
        destination: process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/:path*` : 'http://localhost:3001/api/appointments/:path*',
      },
      {
        source: '/api/finance/:path*',
        destination: process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/finance/:path*` : 'http://localhost:3001/api/finance/:path*',
      },
      {
        source: '/api/pdv/:path*',
        destination: process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pdv/:path*` : 'http://localhost:3001/api/pdv/:path*',
      },
      {
        source: '/api/bot/:path*',
        destination: process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bot/:path*` : 'http://localhost:3001/api/bot/:path*',
      },
    ];
  },
};

export default withPWA(nextConfig);
