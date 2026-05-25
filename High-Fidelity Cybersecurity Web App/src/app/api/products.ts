import axiosInstance from './axiosInstance';

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  available: boolean;
  popular: boolean;
  created_at?: string;
}

export interface ProductsParams {
  search?: string;
  category?: string;
  sort?: string;
}

export interface PaginatedProducts {
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

/** GET /api/products */
export async function getProducts(params?: ProductsParams): Promise<Product[]> {
  const { data } = await axiosInstance.get<Product[]>('/products', { params });
  return data;
}

/** GET /api/products/:id */
export async function getProduct(id: number): Promise<Product> {
  const { data } = await axiosInstance.get<Product>(`/products/${id}`);
  return data;
}

// ── Admin ────────────────────────────────────────────────────────────────

/** GET /api/admin/products */
export async function adminGetProducts(params?: ProductsParams): Promise<PaginatedProducts> {
  const { data } = await axiosInstance.get<PaginatedProducts>('/admin/products', { params });
  return data;
}

/** POST /api/admin/products */
export async function adminCreateProduct(payload: Partial<Product>): Promise<Product> {
  const { data } = await axiosInstance.post<Product>('/admin/products', payload);
  return data;
}

/** PUT /api/admin/products/:id */
export async function adminUpdateProduct(id: number, payload: Partial<Product>): Promise<Product> {
  const { data } = await axiosInstance.put<Product>(`/admin/products/${id}`, payload);
  return data;
}

/** DELETE /api/admin/products/:id */
export async function adminDeleteProduct(id: number): Promise<void> {
  await axiosInstance.delete(`/admin/products/${id}`);
}

/** PATCH /api/admin/products/:id/toggle */
export async function adminToggleProduct(id: number): Promise<Product> {
  const { data } = await axiosInstance.patch<Product>(`/admin/products/${id}/toggle`);
  return data;
}
