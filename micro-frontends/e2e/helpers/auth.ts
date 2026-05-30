import { Page } from '@playwright/test';
import {
  AUTH_TOKEN_KEY,
  AUTH_TOKEN_EXPIRY_KEY,
  AUTH_USER_KEY,
} from '@ecommerce-platform/auth-provider';

const AUTH_API_BASE =
  process.env.NX_API_BASE_URL?.replace(/\/+$/, '') ||
  process.env.E2E_API_BASE_URL?.replace(/\/+$/, '') ||
  'http://127.0.0.1:8010';

export const demoCredentials = {
  email: process.env.E2E_LOGIN_EMAIL || 'demo@retailmesh.com',
  password: process.env.E2E_LOGIN_PASSWORD || 'Demo@12345',
};

export async function loginViaApi(
  email = demoCredentials.email,
  password = demoCredentials.password
): Promise<{ accessToken: string; expiresIn: number }> {
  const response = await fetch(`${AUTH_API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Auth login failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    accessToken: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      userName: string;
      displayName?: string;
      firstName?: string;
      lastName?: string;
      roles: string[];
    };
  };

  return { accessToken: data.accessToken, expiresIn: data.expiresIn };
}

/**
 * Inject JWT session into localStorage (auth-provider keys).
 */
export async function setupAuthenticatedSession(
  page: Page,
  credentials = demoCredentials
) {
  const loginResponse = await fetch(`${AUTH_API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!loginResponse.ok) {
    const body = await loginResponse.text();
    throw new Error(`Auth login failed (${loginResponse.status}): ${body}`);
  }

  const authBody = (await loginResponse.json()) as {
    accessToken: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      userName: string;
      displayName?: string;
      firstName?: string;
      lastName?: string;
    };
  };

  const accessToken = authBody.accessToken;
  const tokenExpiry = Date.now() + authBody.expiresIn * 1000;
  const user = {
    id: authBody.user.id,
    username: authBody.user.userName || authBody.user.email,
    displayName: authBody.user.displayName || authBody.user.email,
    email: authBody.user.email,
    firstName: authBody.user.firstName,
    lastName: authBody.user.lastName,
  };

  await page.addInitScript(
    (payload) => {
      localStorage.setItem(payload.tokenKey, payload.accessToken);
      localStorage.setItem(payload.expiryKey, String(payload.tokenExpiry));
      localStorage.setItem(payload.userKey, JSON.stringify(payload.user));
    },
    {
      tokenKey: AUTH_TOKEN_KEY,
      expiryKey: AUTH_TOKEN_EXPIRY_KEY,
      userKey: AUTH_USER_KEY,
      accessToken,
      tokenExpiry,
      user,
    }
  );
}

/** @deprecated Use setupAuthenticatedSession */
export async function setupMockAuth(page: Page) {
  await setupAuthenticatedSession(page);
}

export async function clearMockAuth(page: Page) {
  await page.evaluate(
    (keys) => {
      localStorage.removeItem(keys.tokenKey);
      localStorage.removeItem(keys.expiryKey);
      localStorage.removeItem(keys.userKey);
    },
    {
      tokenKey: AUTH_TOKEN_KEY,
      expiryKey: AUTH_TOKEN_EXPIRY_KEY,
      userKey: AUTH_USER_KEY,
    }
  );
}

export async function navigateWithAuth(page: Page, url: string) {
  await setupAuthenticatedSession(page);
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

export async function isUserAvatarVisible(page: Page): Promise<boolean> {
  const avatar = page.locator('[data-testid="user-avatar"]');
  return await avatar.isVisible({ timeout: 3000 }).catch(() => false);
}

export async function waitForAuthState(
  page: Page,
  authenticated: boolean = true
) {
  if (authenticated) {
    await page.waitForSelector('[data-testid="user-avatar"]', {
      state: 'visible',
      timeout: 5000,
    });
  } else {
    await page.waitForSelector('[data-testid="login-button"]', {
      state: 'visible',
      timeout: 5000,
    });
  }
}
