export const AUTH_TOKEN_KEY = "accessToken";

export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export function readAuthToken(storage: StorageLike): string | null {
  return storage.getItem(AUTH_TOKEN_KEY);
}

export function persistAuthToken(storage: StorageLike, token: string) {
  storage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(storage: StorageLike) {
  storage.removeItem(AUTH_TOKEN_KEY);
}

export function formatBearerToken(token: string | null): string | undefined {
  if (!token) return undefined;
  return `Bearer ${token}`;
}

export function applyAuthHeader(
  headers: { [key: string]: unknown; Authorization?: unknown },
  token: string | null
) {
  const formatted = formatBearerToken(token);
  if (formatted) {
    headers.Authorization = formatted;
    return;
  }
  delete headers.Authorization;
}
