export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Запрос к Express API. С token — от имени пользователя (Authorization: Bearer). */
export async function api<T>(path: string, { token, ...init }: RequestInit & { token?: string | null } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("content-type", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(res.status, body?.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
