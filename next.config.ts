import type { NextConfig } from "next";
import "./src/env.js";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@node-rs/argon2", "@node-rs/bcrypt"],
  webpack: (config) => {
    config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
    return config;
  },
  experimental: {
    // ppr: true,
    // dynamicIO: true,
    reactCompiler: true,
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
