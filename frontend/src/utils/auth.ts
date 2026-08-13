import { User } from '../types';

const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'zehnify_user';

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function getStoredSession(): { user: User; accessToken: string } | null {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (!accessToken || !savedUser) {
      return null;
    }

    if (isTokenExpired(accessToken)) {
      clearStoredSession();
      return null;
    }

    return {
      accessToken,
      user: JSON.parse(savedUser) as User,
    };
  } catch {
    clearStoredSession();
    return null;
  }
}

export function saveStoredSession(accessToken: string, user: User): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
