import type { LoginCredentials, RegisterCredentials } from '../types';

export interface AuthUserDto {
  id: string;
  email: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  roles: string[];
}

export interface AuthResponseDto {
  accessToken: string;
  expiresIn: number;
  user: AuthUserDto;
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string;
      errors?: string[] | Record<string, string[]>;
    };
    if (body?.errors) {
      if (Array.isArray(body.errors)) {
        return body.errors.join(' ');
      }
      const messages = Object.values(body.errors).flat();
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }
    if (body?.message) {
      return body.message;
    }
  } catch {
    // ignore parse errors
  }
  return response.statusText || 'Request failed';
}

export async function loginWithCredentials(
  baseUrl: string,
  credentials: LoginCredentials
): Promise<AuthResponseDto> {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    throw new AuthApiError(await parseErrorMessage(response), response.status);
  }

  return (await response.json()) as AuthResponseDto;
}

export async function registerWithCredentials(
  baseUrl: string,
  credentials: RegisterCredentials
): Promise<AuthResponseDto> {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
    }),
  });

  if (!response.ok) {
    throw new AuthApiError(await parseErrorMessage(response), response.status);
  }

  return (await response.json()) as AuthResponseDto;
}

export async function fetchCurrentUser(
  baseUrl: string,
  accessToken: string
): Promise<AuthUserDto> {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new AuthApiError(await parseErrorMessage(response), response.status);
  }

  return (await response.json()) as AuthUserDto;
}
