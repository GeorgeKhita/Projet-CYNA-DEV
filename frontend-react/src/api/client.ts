const TOKEN_KEY = 'cyna_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur serveur' }));
    throw new Error(err.message || `Erreur ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = {
  get:    <T>(url: string)              => request<T>(url),
  post:   <T>(url: string, data: unknown) => request<T>(url, { method: 'POST',   body: JSON.stringify(data) }),
  put:    <T>(url: string, data: unknown) => request<T>(url, { method: 'PUT',    body: JSON.stringify(data) }),
  delete: <T>(url: string)              => request<T>(url, { method: 'DELETE' }),
};
