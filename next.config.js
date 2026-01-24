/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      
      // Handle three.js webgpu import issue
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^three\/webgpu$/,
          require.resolve('./lib/three-webgpu-stub.js')
        )
      );
      
      // Resolve three.js examples paths
      // Direct path to three examples from node_modules
      const threeExamplesPath = path.resolve(__dirname, 'node_modules/three/examples/jsm');
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'three/examples/jsm': threeExamplesPath,
      };
    }
    
    return config;
  },
  transpilePackages: ['three', 'three-globe', 'react-globe.gl'],
}

module.exports = nextConfig

