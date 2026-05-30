import type { ReactNode } from 'react';

/**
 * User information from authentication
 */
export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  claims?: Record<string, unknown>;
}

/**
 * Login credentials for JWT auth API
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration credentials for auth API
 */
export interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Debug options for development mode
 */
export interface DebugOptions {
  /** Enable console logs for debugging */
  logging?: boolean;
  /** Preset token to use in development (bypasses login API) */
  presetToken?: string;
  /** Preset user info for development */
  presetUser?: Partial<AuthUser>;
  /** Auto-login via auth API on mount (mock data mode) */
  autoLogin?: boolean;
  /** Credentials used when autoLogin is enabled */
  autoLoginCredentials?: LoginCredentials;
  /** Environment override: development, staging, or production */
  env?: 'development' | 'staging' | 'production';
}

/**
 * Identity auth API configuration (gateway base + /auth)
 */
export interface AuthApiConfig {
  /** Base URL for auth endpoints, e.g. http://localhost:8010/auth */
  baseUrl: string;
}

/**
 * Internal auth state
 */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  tokenExpiry: number | null;
  error: Error | null;
}

/**
 * Auth context value with all auth operations
 */
export interface AuthContextType extends AuthState {
  /** Sign in with email and password */
  login: (credentials?: LoginCredentials) => Promise<void>;
  /** Create account and sign in */
  register: (credentials: RegisterCredentials) => Promise<void>;
  /** Sign out and clear session */
  logout: () => Promise<void>;
  /** Get access token (refreshes if needed) */
  getAccessToken: () => Promise<string | null>;
  /** Check if token is expired */
  isTokenExpired: () => boolean;
  /** Whether running in debug mode */
  isDebugMode: boolean;
}

/**
 * Props for EcommerceAuthProvider (main entry)
 */
export interface EcommerceAuthProviderProps {
  children: ReactNode;
  /** Auth API base URL (gateway /auth) */
  authApiUrl: string;
  /** Debug options for development */
  debug?: DebugOptions;
}

/**
 * Props for InternalAuthProvider (without QueryClient wrapper)
 */
export interface InternalAuthProviderProps {
  children: ReactNode;
  /** Auth API base URL */
  authApiUrl: string;
  /** Debug options for development */
  debug?: DebugOptions;
}

/**
 * Token broadcast event detail
 */
export interface TokenBroadcastEventDetail {
  token: string | null;
  tokenExpiry: number | null;
  timestamp: number;
}

/**
 * Token broadcast state
 */
export interface TokenBroadcastState {
  token: string | null;
  tokenExpiry: number | null;
  lastUpdated: number;
}

/**
 * Host user information passed from host app via appContext
 */
export interface HostUser {
  id?: string;
  username?: string;
  displayName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

/**
 * Host auth context passed from host app via appContext.
 * Used by AuthConsumerProvider to receive auth state from the host application.
 */
export interface HostAuthContext {
  /** User information from host */
  user?: HostUser | null;
  /** Access token from host */
  token?: string | null;
  /** Token expiry timestamp (milliseconds) */
  tokenExpiry?: number | null;
  /** Whether user is authenticated */
  isAuthenticated?: boolean;
  /** Request token refresh from host */
  requestTokenRefresh?: () => Promise<string | null>;
  /** Logout handler from host */
  onLogout?: () => void | Promise<void>;
}

/**
 * Props for AuthConsumerProvider
 */
export interface AuthConsumerProviderProps {
  children: ReactNode;
  /** Host auth context from appContext */
  config?: HostAuthContext | null;
  /** Debug options for development */
  debug?: DebugOptions;
}

// Default context value
export const defaultAuthContextValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,
  tokenExpiry: null,
  error: null,
  isDebugMode: false,
  login: async () => {
    console.warn('[AuthProvider] login called before provider initialized');
  },
  register: async () => {
    console.warn('[AuthProvider] register called before provider initialized');
  },
  logout: async () => {
    console.warn('[AuthProvider] logout called before provider initialized');
  },
  getAccessToken: async () => null,
  isTokenExpired: () => true,
};
