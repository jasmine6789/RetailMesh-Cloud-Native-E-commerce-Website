import type { AuthUser, AuthState, DebugOptions } from '../types';

/**
 * Create AuthUser from debug options
 */
export function createDebugUser(presetUser?: Partial<AuthUser>): AuthUser {
  return {
    id: presetUser?.id || 'debug-user-id',
    username: presetUser?.username || presetUser?.email || 'debug@example.com',
    displayName: presetUser?.displayName || 'Debug User',
    email: presetUser?.email || 'debug@example.com',
    firstName: presetUser?.firstName || 'Debug',
    lastName: presetUser?.lastName || 'User',
    claims: presetUser?.claims,
  };
}

/**
 * Create initial auth state from debug options
 */
export function createDebugAuthState(debug: DebugOptions): AuthState {
  const token = debug.presetToken || null;
  return {
    user: debug.presetUser ? createDebugUser(debug.presetUser) : createDebugUser(),
    isAuthenticated: Boolean(token),
    isLoading: false,
    accessToken: token,
    tokenExpiry: null,
    error: null,
  };
}

/**
 * Create initial unauthenticated state
 */
export function createUnauthenticatedState(): AuthState {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    accessToken: null,
    tokenExpiry: null,
    error: null,
  };
}

/**
 * Create loading state
 */
export function createLoadingState(): AuthState {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    tokenExpiry: null,
    error: null,
  };
}

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get current origin for redirect URI
 */
export function getCurrentOrigin(): string {
  if (!isBrowser()) return 'http://localhost:4200';
  return window.location.origin;
}

/**
 * Log debug message if logging is enabled
 */
export function debugLog(
  debug: DebugOptions | undefined,
  message: string,
  ...args: unknown[]
): void {
  if (debug?.logging) {
    console.log(`[AuthProvider] ${message}`, ...args);
  }
}
