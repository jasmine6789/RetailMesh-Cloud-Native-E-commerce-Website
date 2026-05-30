/**
 * @nx/webpack nests webpack 5.107+, which breaks @module-federation/enhanced.
 * Junction nested webpack to the workspace root copy (5.105.0).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const rootWebpack = path.join(root, 'node_modules', 'webpack');
const nestedDir = path.join(root, 'node_modules', '@nx', 'webpack', 'node_modules');
const nestedWebpack = path.join(nestedDir, 'webpack');

if (!fs.existsSync(rootWebpack)) {
  process.exit(0);
}

const rootVersion = require(path.join(rootWebpack, 'package.json')).version;

if (fs.existsSync(nestedWebpack)) {
  let nestedVersion = rootVersion;
  try {
    nestedVersion = require(path.join(nestedWebpack, 'package.json')).version;
  } catch {
    // replace broken nested install
  }

  if (nestedVersion === rootVersion) {
    process.exit(0);
  }

  fs.rmSync(nestedWebpack, { recursive: true, force: true });
}

fs.mkdirSync(nestedDir, { recursive: true });
execSync(`cmd /c mklink /J "${nestedWebpack}" "${rootWebpack}"`, {
  stdio: 'inherit',
});
