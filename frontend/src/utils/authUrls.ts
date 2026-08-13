export function getBackendOrigin(): string {
  const fromEnv = import.meta.env.VITE_BACKEND_URL as string | undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return 'http://localhost:3000';
}

export function getGoogleAuthUrl(): string {
  return `${getBackendOrigin()}/auth/google`;
}

export function dashboardPathForRole(role: string): string {
  if (role === 'doctor') return '/doctor';
  if (role === 'admin') return '/admin';
  return '/app';
}
