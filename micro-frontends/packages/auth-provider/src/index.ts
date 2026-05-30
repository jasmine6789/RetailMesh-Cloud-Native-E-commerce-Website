/**
 * @ecommerce-platform/auth-provider
 *
 * Reusable React authentication provider for ecommerce micro-frontend applications.
 * Provides JWT login, token management, and auth context.
 */

export { EcommerceAuthProvider } from './EcommerceAuthProvider';
export { AuthConsumerProvider } from './AuthConsumerProvider';

export { InternalAuthProvider, AuthErrorBoundary } from './components';

export { useAuth } from './useAuth';

export {
  useLogin,
  useLogout,
  useAccessToken,
  useIsAuthenticated,
  useCurrentUser,
  useAuthLoading,
  useUserDisplayName,
  useUserEmail,
  useTokenBroadcastSubscription,
  broadcastToken,
} from './hooks';

export {
  createDebugUser,
  createDebugAuthState,
  createUnauthenticatedState,
  createLoadingState,
  isBrowser,
  getCurrentOrigin,
  debugLog,
  resolveUserName,
  getTokenExpiry,
  isTokenExpired,
  isExpiryTimestampExpired,
  safeStorage,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  getStoredTokenExpiry,
  setStoredTokenExpiry,
  removeStoredTokenExpiry,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  clearAuthStorage,
  authUserDtoToAuthUser,
} from './utils';

export {
  loginWithCredentials,
  registerWithCredentials,
  fetchCurrentUser,
  AuthApiError,
} from './services/authApi';
export type { AuthResponseDto, AuthUserDto } from './services/authApi';

export {
  AUTH_TOKEN_KEY,
  AUTH_TOKEN_EXPIRY_KEY,
  AUTH_USER_KEY,
  TOKEN_BROADCAST_EVENT,
  AUTH_STATE_BROADCAST_EVENT,
  TOKEN_EXPIRY_BUFFER_SECONDS,
} from './constants';

export type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  DebugOptions,
  AuthApiConfig,
  AuthState,
  AuthContextType,
  EcommerceAuthProviderProps,
  InternalAuthProviderProps,
  TokenBroadcastEventDetail,
  TokenBroadcastState,
  HostUser,
  HostAuthContext,
  AuthConsumerProviderProps,
} from './types';
