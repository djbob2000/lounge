/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@lounge/types"],
  experimental: {
    esmExternals: true,
  },
};

export default nextConfig;
