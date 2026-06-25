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
  const lang = localStorage.getItem('cyna_lang') ?? 'fr';

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `/api${endpoint}${separator}lang=${lang}`;

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    // Token expiré ou invalide → déconnexion automatique (seulement si on avait un token)
    if (res.status === 401 && token) {
      localStorage.removeItem('cyna_token');
      localStorage.removeItem('cyna_user');
      window.location.href = '/connexion';
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    const err = await res.json().catch(() => ({ message: 'Erreur serveur' }));
    if (err.errors) {
      const first = Object.values(err.errors)[0];
      const msg = Array.isArray(first) ? first[0] : String(first);
      throw new Error(msg);
    }
    throw new Error(err.message || `Erreur ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = {
  get:    <T>(url: string)               => request<T>(url),
  post:   <T>(url: string, data: unknown)  => request<T>(url, { method: 'POST',   body: JSON.stringify(data) }),
  put:    <T>(url: string, data: unknown)  => request<T>(url, { method: 'PUT',    body: JSON.stringify(data) }),
  patch:  <T>(url: string, data?: unknown) => request<T>(url, { method: 'PATCH',  body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(url: string, data?: unknown) => request<T>(url, { method: 'DELETE', body: data ? JSON.stringify(data) : undefined }),
};
