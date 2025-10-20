// Enable this code below for Server Side Rendering/Translation (SSR)
// const { i18n } = require('./next-i18next.config')
const withImages = require('next-images');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = withImages({
  // Enable this code below for Server Side Rendering/Translation (SSR)
  //  i18n,
  // output: 'export', // Disabled to support dynamic Firebase routes
  trailingSlash: true,
  images: {
    disableStaticImages: true
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  publicRuntimeConfig: {
    localeSubpaths: typeof process.env.LOCALE_SUBPATHS === 'string'
      ? process.env.LOCALE_SUBPATHS
      : 'none',
  },
  // Optimize serverless function size
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'recharts', 'firebase'],
  },
  // Reduce bundle size
  productionBrowserSourceMaps: false,
  // Compress output
  compress: true,
  swcMinify: true,
  webpack: (config, options) => {
    // Reduce bundle size with aggressive optimization
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Big libraries in separate chunks
          firebase: {
            name: 'firebase',
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            priority: 40,
          },
          mui: {
            name: 'mui',
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            priority: 30,
          },
          pdf: {
            name: 'pdf',
            test: /[\\/]node_modules[\\/](jspdf|pdf-lib|html2canvas)[\\/]/,
            priority: 25,
          },
          charts: {
            name: 'charts',
            test: /[\\/]node_modules[\\/](recharts|react-big-calendar)[\\/]/,
            priority: 20,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              if (!match) return 'npm.common';
              const packageName = match[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 10,
          },
        },
      },
    };
    
    config.plugins.push(
      //      new ESLintPlugin({
      //        exclude: ['node_modules'],
      //      })
    );
    return config;
  }
});
