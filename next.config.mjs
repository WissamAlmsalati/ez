/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.alezdeehar.ly',
        pathname: '/storage/**'
      }
    ]
  }
}
export default nextConfig;
