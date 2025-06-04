import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {  
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    GUEST_PASSWORD: process.env.GUEST_PASSWORD,
    // ENVIRONMENT: process.env.ENVIRONMENT,
  },
};

export default nextConfig;
