import type { AuthUser } from '@ecommerce-platform/auth-provider';
import { resolveUserName } from '@ecommerce-platform/auth-provider';
import { env } from '../../config';

export function resolveCartUserName(user: AuthUser | null | undefined): string | null {
  const name = resolveUserName(user);
  if (name) {
    return name;
  }

  if (env.useMockData) {
    return 'demo@retailmesh.com';
  }

  return null;
}
