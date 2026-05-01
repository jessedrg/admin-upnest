/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // global window.X assignments break with double-mount
};

export default nextConfig;
