/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Disable ESLint during build
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Disable TypeScript type checking during build
    typescript: {
        ignoreBuildErrors: true,
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://backend:3000/api/:path*'
            }
        ]
    },
    // Add webpack configuration to handle punycode warning
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                punycode: false,
            };
        }
        return config;
    },
    reactStrictMode: false,
};

export default nextConfig;
