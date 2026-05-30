import type { AuthUser } from '../types';

/**
 * Canonical user key for basket, checkout, and order APIs.
 * Uses email as the canonical sign-in identifier (matches Identity.API JWT claims).
 */
export function resolveUserName(user: AuthUser | null | undefined): string | null {
  if (!user) {
    return null;
  }

  return user.email || user.username || user.displayName || user.id || null;
}
