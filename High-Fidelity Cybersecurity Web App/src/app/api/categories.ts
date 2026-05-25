import axiosInstance from './axiosInstance';

export interface Category {
  id: number;
  name: string;
  color: string;
  description?: string;
  icon?: string;
  products_count?: number;
}

/** GET /api/categories */
export async function getCategories(): Promise<Category[]> {
  const { data } = await axiosInstance.get<Category[]>('/categories');
  return data;
}

// ── Admin ────────────────────────────────────────────────────────────────

/** GET /api/admin/categories */
export async function adminGetCategories(): Promise<Category[]> {
  const { data } = await axiosInstance.get<Category[]>('/admin/categories');
  return data;
}

/** POST /api/admin/categories */
export async function adminCreateCategory(payload: Partial<Category>): Promise<Category> {
  const { data } = await axiosInstance.post<Category>('/admin/categories', payload);
  return data;
}

/** PUT /api/admin/categories/:id */
export async function adminUpdateCategory(id: number, payload: Partial<Category>): Promise<Category> {
  const { data } = await axiosInstance.put<Category>(`/admin/categories/${id}`, payload);
  return data;
}

/** DELETE /api/admin/categories/:id */
export async function adminDeleteCategory(id: number): Promise<void> {
  await axiosInstance.delete(`/admin/categories/${id}`);
}
