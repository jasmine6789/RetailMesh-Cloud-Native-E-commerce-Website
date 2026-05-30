import React, { ReactNode } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import {
  EcommerceAuthProvider as EcommerceAuthProviderOriginal,
  DebugOptions,
} from '@ecommerce-platform/auth-provider';
import { AppConfigProvider, useAppConfig } from '../context/AppConfigContext';
import { routes } from '../routes';
import { themeConfig } from '../config/theme';
import { env } from '../config/env.config';
import '../i18n/config';
import '../styles.less';

const EcommerceAuthProvider = EcommerceAuthProviderOriginal as React.ComponentType<{
  authApiUrl: string;
  children: ReactNode;
  debug?: DebugOptions;
}>;

const authApiUrl = `${env.apiBaseUrl.replace(/\/+$/, '')}/auth`;

const mockDebugAuth: DebugOptions | undefined = env.useMockData
  ? {
      logging: true,
      presetUser: {
        id: 'demo-user-1',
        email: 'demo@retailmesh.com',
        username: 'demo@retailmesh.com',
        displayName: 'Demo User',
      },
      autoLogin: true,
      autoLoginCredentials: {
        email: 'demo@retailmesh.com',
        password: 'Demo@12345',
      },
    }
  : undefined;

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

function ThemedApp() {
  const { appContext } = useAppConfig();

  return (
    <ConfigProvider
      theme={{
        ...themeConfig,
        algorithm:
          appContext.theme === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <EcommerceAuthProvider authApiUrl={authApiUrl} debug={mockDebugAuth}>
        <AppConfigProvider>
          <ThemedApp />
        </AppConfigProvider>
      </EcommerceAuthProvider>
    </BrowserRouter>
  );
}

export default App;
