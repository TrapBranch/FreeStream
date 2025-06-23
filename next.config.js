/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Docker 部署支持
  output: 'standalone',
  // experimental: {
  //   serverActions: true,
  // },
};

module.exports = nextConfig;
