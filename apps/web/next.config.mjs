/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  transpilePackages: ['@lounge/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.backblazeb2.com',
      },
      {
        protocol: 'https',
        hostname: '**.backblaze.com',
      },
      {
        protocol: 'https',
        hostname: '**.b2cdn.net',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3001/v1/:path*',
      },
    ];
  },
};
export default nextConfig;