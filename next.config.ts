import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false, // <--- CHANGED THIS TO FALSE!
});

const nextConfig: NextConfig = {
  turbopack: {}, 
};

export default withPWA(nextConfig);