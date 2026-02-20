export const AUTH_TOKEN_KEY = "accessToken";

export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export function readAuthToken(storage: StorageLike): string | null {
  return storage.getItem(AUTH_TOKEN_KEY);
}

type JwtPayload = {
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    if (typeof atob !== "function") return null;
    const raw = atob(padded);
    return JSON.parse(raw) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenUsable(token: string | null, nowMs = Date.now()): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (!payload.exp) return true;
  return payload.exp * 1000 > nowMs;
}

export function readValidAuthToken(storage: StorageLike): string | null {
  const token = readAuthToken(storage);
  if (isTokenUsable(token)) return token;
  if (token) clearAuthToken(storage);
  return null;
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
