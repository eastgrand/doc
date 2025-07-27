/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@arcgis/core', '@kepler.gl/components', '@kepler.gl/actions', '@kepler.gl/reducers'],
  reactStrictMode: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_ARCGIS_API_KEY: process.env.NEXT_PUBLIC_ARCGIS_API_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/arcgis/:path*',
        destination: 'https://services.arcgisonline.com/:path*',
      },
    ]
  },
  webpack: (config, { isServer }) => {

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    
    // Handle Kepler.gl and other large modules
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        chunks: 'all',
        maxSize: 2000000, // 2MB max chunk size
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          kepler: {
            test: /[\\/]node_modules[\\/]@kepler\.gl[\\/]/,
            name: 'kepler',
            chunks: 'all',
            priority: 10,
            maxSize: 3000000, // 3MB for Kepler.gl
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 5,
            maxSize: 2000000,
            enforce: true,
          },
        },
      },
    };
    
    // Increase timeout for large modules
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    
    config.module.rules.push({
      test: /\.d\.ts$/,
      loader: 'ignore-loader'
    });
    
    return config;
  },
}

module.exports = nextConfig 