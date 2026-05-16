import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence Next.js 16 "Turbopack + webpack config" warning
  turbopack: {},

  webpack(config) {
    config.module.rules.push({
      test: /\.(gltf|glb|bin|hdr|hdri|ktx2)$/i,
      type: "asset/resource",
    });
    return config;
  },

  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
