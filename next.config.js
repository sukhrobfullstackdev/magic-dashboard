/* eslint @typescript-eslint/no-var-requires: 0 */
/** @type {import('next').NextConfig} */

const path = require('path');

const nextConfig = {
  assetPrefix: process.env.NEXT_PUBLIC_ASSETS_DOMAIN || '',
  logging: {
    fetches: {
      fullUrl: process.env.DEPLOY_ENV === 'local',
    },
  },
  experimental: {
    webpackBuildWorker: true,
    instrumentationHook: true,
    optimizePackageImports: ['@magiclabs/ui-components'],
  },
  reactStrictMode: process.env.HOSTNAME !== 'localhost',
  // only run this within the context of a GitHub Action
  // if this is set to true when running next build on Vercel it will publish the source maps which will expose the source code
  // https://nextjs.org/docs/pages/api-reference/next-config-js/productionBrowserSourceMaps
  productionBrowserSourceMaps: process.env.GITHUB_ACTIONS === 'true' || false,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@styled': path.resolve(__dirname, 'styled-system'),
      '@magiclabs/ui-components/presets': path.resolve(__dirname, '@magiclabs/ui-components/es/presets'),
    };

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.fortmatic.com',
      },
      {
        protocol: 'https',
        hostname: 'dashboard.magic.link',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: Boolean(process.env.ANALYZE),
});
const withImages = require('next-images');
const withPlugins = require('next-compose-plugins');

module.exports = withPlugins([[withBundleAnalyzer], [withImages]], nextConfig);
