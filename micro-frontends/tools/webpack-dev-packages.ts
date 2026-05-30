import type { Configuration, RuleSetRule } from 'webpack';
import * as path from 'path';

const packagesDir = path.resolve(__dirname, '../packages');

/** Resolve shared packages from source in dev (avoids missing or stale dist/ builds). */
export function applyLocalPackageAliases(config: Configuration): void {
  config.resolve = config.resolve ?? {};

  const authSrc = path.join(packagesDir, 'auth-provider/src/index.ts');
  const layoutSrc = path.join(packagesDir, 'shared-layout/src/index.ts');
  const injectorSrc = path.join(packagesDir, 'app-injector/src/index.ts');

  // Prefer source in dev (package.json "development" export + aliases).
  const conditionNames = new Set([
    'development',
    ...(config.resolve.conditionNames ?? []),
    'import',
    'require',
    'default',
  ]);
  config.resolve.conditionNames = [...conditionNames];

  config.resolve.alias = {
    ...config.resolve.alias,
    '@ecommerce-platform/auth-provider': authSrc,
    '@ecommerce-platform/auth-provider$': authSrc,
    '@ecommerce-platform/shared-layout': layoutSrc,
    '@ecommerce-platform/shared-layout$': layoutSrc,
    '@ecommerce-platform/app-injector': injectorSrc,
    '@ecommerce-platform/app-injector$': injectorSrc,
  };
}

/** Nested package node_modules are not excluded by the default rule and break source-map-loader. */
export function excludeNestedPackageNodeModulesFromSourceMapLoader(
  config: Configuration
): void {
  const nested = [
    path.join(packagesDir, 'auth-provider/node_modules'),
    path.join(packagesDir, 'shared-layout/node_modules'),
    path.join(packagesDir, 'app-injector/node_modules'),
  ];

  const patchRule = (rule: RuleSetRule | undefined): void => {
    if (!rule) return;

    const loader =
      typeof rule.loader === 'string'
        ? rule.loader
        : '';
    const useList = rule.use
      ? Array.isArray(rule.use)
        ? rule.use
        : [rule.use]
      : [];
    const usesSourceMapLoader =
      loader.includes('source-map-loader') ||
      useList.some(
        (entry) =>
          typeof entry === 'object' &&
          entry !== null &&
          'loader' in entry &&
          String((entry as { loader: string }).loader).includes(
            'source-map-loader'
          )
      );

    if (usesSourceMapLoader) {
      const prev = rule.exclude;
      const excludes = Array.isArray(prev) ? [...prev] : prev ? [prev] : [];
      rule.exclude = [...excludes, ...nested];
    }

    if (Array.isArray(rule.oneOf)) {
      rule.oneOf.forEach(patchRule);
    }
    if (Array.isArray(rule.rules)) {
      rule.rules.forEach(patchRule);
    }
  };

  config.module?.rules?.forEach((rule) => patchRule(rule as RuleSetRule));
}

export function applyDevPackageWebpackFixes(config: Configuration): void {
  applyLocalPackageAliases(config);
  excludeNestedPackageNodeModulesFromSourceMapLoader(config);
}
