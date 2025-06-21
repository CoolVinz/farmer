/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      // Add your MinIO server domain here, WITHOUT protocol
      // Example: "minio.yourdomain.com"
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https', 
        hostname: '**',
      }
    ]
  },
};

module.exports = nextConfig;
