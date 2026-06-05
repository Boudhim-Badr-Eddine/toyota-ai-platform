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

  // Long-lived cache for 3D assets — browsers won't re-download on page reload
  async headers() {
    return [
      {
        source: "/models/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/hdr/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

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
