/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lounge/types'],
  experimental: {
    esmExternals: true,
    browserDebugInfoInTerminal: true,
    devtoolSegmentExplorer: true,
    globalNotFound: true,
    clientSegmentCache: true,
    // turbopackPersistentCaching: true,
    // cacheComponents: true, // This option is not recognized in Next.js 15
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.eu-central-003.backblazeb2.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'f003.backblazeb2.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
