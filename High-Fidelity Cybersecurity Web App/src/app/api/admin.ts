import axiosInstance from './axiosInstance';

// ── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  total_revenue: number;
  active_clients: number;
  active_contracts: number;
  open_tickets: number;
  revenue_trend: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  category_stats: { name: string; value: number }[];
  recent_orders: {
    id: number;
    ref: string;
    client: string;
    amount: number;
    status: string;
    created_at: string;
  }[];
  recent_logs: {
    id: number;
    action: string;
    detail: string;
    ip_address: string;
    created_at: string;
  }[];
}

/** GET /api/admin/dashboard */
export async function adminGetDashboard(): Promise<DashboardData> {
  const { data } = await axiosInstance.get<DashboardData>('/admin/dashboard');
  return data;
}

/** GET /api/admin/dashboard/revenue-chart */
export async function adminGetRevenueChart(): Promise<{ month: string; revenue: number }[]> {
  const { data } = await axiosInstance.get('/admin/dashboard/revenue-chart');
  return data;
}

// ── Users ─────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  role: string;
  is_active: boolean;
  orders_count: number;
  subscriptions_count: number;
  created_at: string;
}

/** GET /api/admin/users */
export async function adminGetUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
}): Promise<{ data: AdminUser[]; total: number; last_page: number }> {
  const { data } = await axiosInstance.get('/admin/users', { params });
  return data;
}

/** PATCH /api/admin/users/:id/toggle */
export async function adminToggleUser(id: number): Promise<{ id: number; is_active: boolean }> {
  const { data } = await axiosInstance.patch(`/admin/users/${id}/toggle`);
  return data;
}

/** DELETE /api/admin/users/:id */
export async function adminDeleteUser(id: number): Promise<void> {
  await axiosInstance.delete(`/admin/users/${id}`);
}

// ── Logs ──────────────────────────────────────────────────────────────────

export interface ActivityLog {
  id: number;
  user_id: number | null;
  action: string;
  detail: string;
  ip_address: string;
  created_at: string;
}

/** GET /api/admin/logs */
export async function adminGetLogs(params?: {
  type?: string;
  search?: string;
  page?: number;
}): Promise<{ data: ActivityLog[]; total: number }> {
  const { data } = await axiosInstance.get('/admin/logs', { params });
  return data;
}

// ── Carousel ─────────────────────────────────────────────────────────────

export interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  position: number;
  active: boolean;
}

/** GET /api/admin/carousel */
export async function adminGetCarousel(): Promise<CarouselSlide[]> {
  const { data } = await axiosInstance.get<CarouselSlide[]>('/admin/carousel');
  return data;
}

/** POST /api/admin/carousel */
export async function adminCreateSlide(payload: Partial<CarouselSlide>): Promise<CarouselSlide> {
  const { data } = await axiosInstance.post<CarouselSlide>('/admin/carousel', payload);
  return data;
}

/** PUT /api/admin/carousel/:id */
export async function adminUpdateSlide(id: number, payload: Partial<CarouselSlide>): Promise<CarouselSlide> {
  const { data } = await axiosInstance.put<CarouselSlide>(`/admin/carousel/${id}`, payload);
  return data;
}

/** DELETE /api/admin/carousel/:id */
export async function adminDeleteSlide(id: number): Promise<void> {
  await axiosInstance.delete(`/admin/carousel/${id}`);
}

// ── Settings ──────────────────────────────────────────────────────────────

export type AdminSettings = Record<string, boolean | number | string>;

/** GET /api/admin/settings */
export async function adminGetSettings(): Promise<AdminSettings> {
  const { data } = await axiosInstance.get<AdminSettings>('/admin/settings');
  return data;
}

/** PUT /api/admin/settings */
export async function adminUpdateSettings(payload: AdminSettings): Promise<AdminSettings> {
  const { data } = await axiosInstance.put<{ settings: AdminSettings }>('/admin/settings', payload);
  return data.settings;
}
