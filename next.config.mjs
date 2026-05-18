/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      '*': ['public/**/*'],
    },
  },
};

export default nextConfig;
