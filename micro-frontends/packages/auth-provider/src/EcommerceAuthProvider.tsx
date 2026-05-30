import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { EcommerceAuthProviderProps } from './types';
import { InternalAuthProvider } from './components/InternalAuthProvider';
import { AuthErrorBoundary } from './components/AuthErrorBoundary';
import { debugLog } from './utils/auth';

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * EcommerceAuthProvider — JWT authentication for the ecommerce platform.
 */
export const EcommerceAuthProvider: React.FC<EcommerceAuthProviderProps> = ({
  children,
  authApiUrl,
  debug = {},
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (debug.presetToken) {
      debugLog(debug, 'Using preset token for development');
    }
    setIsReady(true);
  }, [debug]);

  return (
    <QueryClientProvider client={defaultQueryClient}>
      <AuthErrorBoundary debug={debug}>
        <InternalAuthProvider authApiUrl={authApiUrl} debug={debug}>
          {isReady ? children : null}
        </InternalAuthProvider>
      </AuthErrorBoundary>
    </QueryClientProvider>
  );
};
