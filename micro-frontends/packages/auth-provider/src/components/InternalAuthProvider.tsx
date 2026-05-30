import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AuthContext } from '../AuthContext';
import type {
  InternalAuthProviderProps,
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from '../types';
import {
  createDebugAuthState,
  createLoadingState,
  createUnauthenticatedState,
  debugLog,
} from '../utils/auth';
import { getTokenExpiry, isExpiryTimestampExpired } from '../utils/token';
import {
  useTokenBroadcastSubscription,
  broadcastToken,
} from '../hooks/useTokenBroadcast';
import {
  clearAuthStorage,
  getStoredToken,
  getStoredTokenExpiry,
  getStoredUser,
  setStoredToken,
  setStoredTokenExpiry,
  setStoredUser,
} from '../utils/storage';
import { authUserDtoToAuthUser } from '../utils/jwtUser';
import {
  AuthApiError,
  loginWithCredentials,
  registerWithCredentials,
} from '../services/authApi';

function applyAuthResponse(
  accessToken: string,
  expiresInSeconds: number,
  user: ReturnType<typeof authUserDtoToAuthUser>
): AuthState {
  const tokenExpiry = Date.now() + expiresInSeconds * 1000;
  setStoredToken(accessToken);
  setStoredTokenExpiry(tokenExpiry);
  setStoredUser(user);

  return {
    user,
    isAuthenticated: true,
    isLoading: false,
    accessToken,
    tokenExpiry,
    error: null,
  };
}

function restoreAuthFromStorage(): AuthState | null {
  const token = getStoredToken();
  const user = getStoredUser();
  const tokenExpiry = getStoredTokenExpiry();

  if (!token || !user) {
    return null;
  }

  if (isExpiryTimestampExpired(tokenExpiry)) {
    clearAuthStorage();
    return null;
  }

  return {
    user,
    isAuthenticated: true,
    isLoading: false,
    accessToken: token,
    tokenExpiry,
    error: null,
  };
}

/**
 * InternalAuthProvider — JWT session state and auth API integration.
 */
export const InternalAuthProvider: React.FC<InternalAuthProviderProps> = ({
  children,
  authApiUrl,
  debug = {},
}) => {
  const isDebugMode = Boolean(debug.presetToken || debug.autoLogin);
  const autoLoginStarted = useRef(false);

  const [authState, setAuthState] = useState<AuthState>(() => {
    if (debug.presetToken) {
      return createDebugAuthState(debug);
    }
    return createLoadingState();
  });

  const broadcastState = useTokenBroadcastSubscription(true);

  useEffect(() => {
    if (debug.presetToken) {
      return;
    }

    const restored = restoreAuthFromStorage();
    if (restored) {
      debugLog(debug, 'Restored session from storage');
      setAuthState(restored);
      broadcastToken(restored.accessToken, restored.tokenExpiry);
      return;
    }

    setAuthState(createUnauthenticatedState());
  }, [debug.presetToken, debug]);

  useEffect(() => {
    if (!debug.autoLogin || !debug.autoLoginCredentials || debug.presetToken) {
      return;
    }
    if (autoLoginStarted.current || authState.isAuthenticated) {
      return;
    }

    autoLoginStarted.current = true;
    loginWithCredentials(authApiUrl, debug.autoLoginCredentials)
      .then((response) => {
        const user = authUserDtoToAuthUser(response.user);
        const next = applyAuthResponse(
          response.accessToken,
          response.expiresIn,
          user
        );
        setAuthState(next);
        broadcastToken(next.accessToken, next.tokenExpiry);
        debugLog(debug, 'Auto-login succeeded');
      })
      .catch((error) => {
        const err = error instanceof Error ? error : new Error(String(error));
        debugLog(debug, 'Auto-login failed', err.message);
        setAuthState((prev) => ({ ...prev, isLoading: false, error: err }));
      });
  }, [
    authApiUrl,
    authState.isAuthenticated,
    debug.autoLogin,
    debug.autoLoginCredentials,
    debug.presetToken,
    debug,
  ]);

  useEffect(() => {
    if (!broadcastState.token || broadcastState.lastUpdated === 0) {
      return;
    }

    setAuthState((prev) => ({
      ...prev,
      accessToken: broadcastState.token,
      tokenExpiry: broadcastState.tokenExpiry,
    }));
  }, [broadcastState]);

  const login = useCallback(
    async (credentials?: LoginCredentials): Promise<void> => {
      if (debug.presetToken) {
        debugLog(debug, 'Login skipped in preset-token debug mode');
        return;
      }

      if (!credentials?.email || !credentials?.password) {
        const err = new Error('Email and password are required.');
        setAuthState((prev) => ({ ...prev, error: err }));
        throw err;
      }

      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await loginWithCredentials(authApiUrl, credentials);
        const user = authUserDtoToAuthUser(response.user);
        const next = applyAuthResponse(
          response.accessToken,
          response.expiresIn,
          user
        );
        setAuthState(next);
        broadcastToken(next.accessToken, next.tokenExpiry);
        debugLog(debug, 'Login succeeded', user.email);
      } catch (error) {
        const err =
          error instanceof AuthApiError
            ? error
            : error instanceof Error
              ? error
              : new Error(String(error));
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          error: err,
        }));
        throw err;
      }
    },
    [authApiUrl, debug]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<void> => {
      if (debug.presetToken) {
        debugLog(debug, 'Register skipped in preset-token debug mode');
        return;
      }

      if (!credentials.email || !credentials.password) {
        const err = new Error('Email and password are required.');
        setAuthState((prev) => ({ ...prev, error: err }));
        throw err;
      }

      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await registerWithCredentials(authApiUrl, credentials);
        const user = authUserDtoToAuthUser(response.user);
        const next = applyAuthResponse(
          response.accessToken,
          response.expiresIn,
          user
        );
        setAuthState(next);
        broadcastToken(next.accessToken, next.tokenExpiry);
        debugLog(debug, 'Registration succeeded', user.email);
      } catch (error) {
        const err =
          error instanceof AuthApiError
            ? error
            : error instanceof Error
              ? error
              : new Error(String(error));
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          error: err,
        }));
        throw err;
      }
    },
    [authApiUrl, debug]
  );

  const logout = useCallback(async (): Promise<void> => {
    clearAuthStorage();
    setAuthState(createUnauthenticatedState());
    broadcastToken(null, null);
    debugLog(debug, 'Logged out');
  }, [debug]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (debug.presetToken) {
      return debug.presetToken;
    }

    if (
      authState.accessToken &&
      !isExpiryTimestampExpired(authState.tokenExpiry)
    ) {
      return authState.accessToken;
    }

    const stored = getStoredToken();
    const storedExpiry = getStoredTokenExpiry();
    if (stored && !isExpiryTimestampExpired(storedExpiry)) {
      const tokenExpiry =
        storedExpiry ?? getTokenExpiry(stored) ?? authState.tokenExpiry;
      setAuthState((prev) => ({
        ...prev,
        accessToken: stored,
        tokenExpiry,
      }));
      broadcastToken(stored, tokenExpiry);
      return stored;
    }

    return null;
  }, [debug.presetToken, authState.accessToken, authState.tokenExpiry]);

  const isTokenExpired = useCallback((): boolean => {
    if (debug.presetToken) {
      return false;
    }
    return isExpiryTimestampExpired(authState.tokenExpiry);
  }, [debug.presetToken, authState.tokenExpiry]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      ...authState,
      login,
      register,
      logout,
      getAccessToken,
      isTokenExpired,
      isDebugMode,
    }),
    [
      authState,
      login,
      register,
      logout,
      getAccessToken,
      isTokenExpired,
      isDebugMode,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
