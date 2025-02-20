/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@novu/echo"],
    webpack: (config, { isServer }) => {
        // Add resolve fallback
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "@novu/echo": require.resolve("@novu/echo"),
        };

        return config;
    },
};

export default nextConfig;
