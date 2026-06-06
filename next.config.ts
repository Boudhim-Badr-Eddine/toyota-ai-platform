import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

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
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "babydrive.com.au", pathname: "/**" },
      { protocol: "https", hostname: "img.philkotse.com", pathname: "/**" },
      { protocol: "https", hostname: "burlappcar.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
