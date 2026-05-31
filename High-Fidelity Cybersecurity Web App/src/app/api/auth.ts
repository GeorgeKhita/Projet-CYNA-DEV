import axiosInstance from './axiosInstance';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company?: string;
  phone?: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
  phone?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

/** POST /api/auth/login */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await axiosInstance.post<AuthResponse>('/auth/login', payload);
  localStorage.setItem('cyna_token', data.token);
  return data;
}

/** POST /api/auth/register */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await axiosInstance.post<AuthResponse>('/auth/register', payload);
  localStorage.setItem('cyna_token', data.token);
  return data;
}

/** POST /api/auth/logout */
export async function logout(): Promise<void> {
  await axiosInstance.post('/auth/logout');
  localStorage.removeItem('cyna_token');
}

/** GET /api/auth/me */
export async function getMe(): Promise<AuthUser> {
  const { data } = await axiosInstance.get<AuthUser>('/auth/me');
  return data;
}

/** PUT /api/auth/me */
export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const { data } = await axiosInstance.put<AuthUser>('/auth/me', payload);
  return data;
}

/** POST /api/auth/forgot-password */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await axiosInstance.post('/auth/forgot-password', { email });
  return data;
}

/** POST /api/auth/reset-password */
export async function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  const { data } = await axiosInstance.post('/auth/reset-password', payload);
  return data;
}

/** POST /api/auth/admin/send-2fa — envoie le code OTP à l'admin */
export async function sendAdmin2FA(): Promise<{ message: string }> {
  const { data } = await axiosInstance.post('/auth/admin/send-2fa');
  return data;
}

/** POST /api/auth/admin/verify-2fa — vérifie le code OTP */
export async function verifyAdmin2FA(code: string): Promise<{ message: string; verified: boolean }> {
  const { data } = await axiosInstance.post('/auth/admin/verify-2fa', { code });
  return data;
}

/** GET /api/auth/me/export — export RGPD des données personnelles */
export async function exportMyData(): Promise<void> {
  const response = await axiosInstance.get('/auth/me/export', { responseType: 'blob' });
  const url  = window.URL.createObjectURL(new Blob([response.data], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href  = url;
  link.download = `mes-donnees-cyna-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  window.URL.revokeObjectURL(url);
}
