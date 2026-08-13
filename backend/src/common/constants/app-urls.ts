import { ConfigService } from '@nestjs/config';

export const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
export const DEFAULT_BACKEND_URL = 'http://localhost:3000';
export const DEFAULT_MOOD_API_URL =
  'https://mhs1010-fer-emotion-api.hf.space/predict';

export function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

export function getFrontendUrl(configService: ConfigService): string {
  return stripTrailingSlash(
    configService.get<string>('FRONTEND_URL') || DEFAULT_FRONTEND_URL,
  );
}

export function getBackendUrl(configService: ConfigService): string {
  return stripTrailingSlash(
    configService.get<string>('BACKEND_URL') || DEFAULT_BACKEND_URL,
  );
}

export function getGoogleCallbackUrl(configService: ConfigService): string {
  const explicit = configService.get<string>('GOOGLE_CALLBACK_URL');
  if (explicit) {
    return stripTrailingSlash(explicit);
  }
  return `${getBackendUrl(configService)}/auth/google/callback`;
}

export function getMoodApiUrl(configService: ConfigService): string {
  return (
    configService.get<string>('MOOD_API_URL') || DEFAULT_MOOD_API_URL
  );
}
