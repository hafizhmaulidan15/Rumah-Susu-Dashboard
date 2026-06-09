let adminKey: string | null = null;

export function getAdminKey(): string | null {
  return adminKey;
}

export function setAdminKey(key: string | null): void {
  adminKey = key;
}

export function clearAdminKey(): void {
  adminKey = null;
}
