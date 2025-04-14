/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        typedRoutes: true,
    },
    env: {
        BACKEND_API_PROD: process.env.BACKEND_API_PROD,
    },
};

module.exports = nextConfig;
