import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile dev connections
  // @ts-ignore - Some versions of Next.js expect this for local network testing
  allowedDevOrigins: ['192.168.1.9'],
  
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.1.9:3000', 'localhost:3000']
    }
  }
};

export default nextConfig;
