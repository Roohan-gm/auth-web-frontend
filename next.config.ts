import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output:"standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental:{
    serverActions:{
      bodySizeLimit:'5mb'
    }
  }
};

export default nextConfig;