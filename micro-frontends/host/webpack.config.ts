import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { withModuleFederation } from '@nx/module-federation/webpack.js';
import { DefinePlugin } from 'webpack';

import baseConfig from './module-federation.config';
import { applyDevPackageWebpackFixes } from '../tools/webpack-dev-packages';

// Development environment variables
// Set these in your shell or create a local .env.local file (gitignored)
// Required: NX_API_BASE_URL (defaults to localhost:8010 for local dev)

// Filter only NX_ prefixed variables from process.env
const envVars = Object.keys(process.env)
  .filter(key => key.startsWith('NX_'))
  .reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(process.env[key]);
    return acc;
  }, {} as Record<string, string>);

console.log('[host/webpack.config] Injecting env vars:', Object.keys(envVars));

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(baseConfig, {
    dts: false,
  }),
  (config) => {
    // Add DefinePlugin to inject environment variables
    config.plugins = config.plugins || [];
    config.plugins.push(
      new DefinePlugin(envVars)
    );

    applyDevPackageWebpackFixes(config);

    // Dev server bundles store/account remotes from source; their path aliases must resolve here too.
    if (config.resolve) {
      const path = require('path');
      const storeSrc = path.resolve(__dirname, '../store/src');
      config.resolve.alias = {
        ...config.resolve.alias,
        '@services': path.resolve(storeSrc, 'services'),
        '@libs': path.resolve(storeSrc, 'libs'),
        '@components': path.resolve(storeSrc, 'components'),
        '@typings': path.resolve(storeSrc, 'typings'),
        '@constants': path.resolve(storeSrc, 'config'),
        '@helpers': path.resolve(storeSrc, 'helpers'),
        '@hooks': path.resolve(storeSrc, 'hooks'),
        '@utils': path.resolve(storeSrc, 'utils'),
      };
    }

    return config;
  }
);
