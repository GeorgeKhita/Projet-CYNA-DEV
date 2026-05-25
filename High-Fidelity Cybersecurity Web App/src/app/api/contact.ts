import axiosInstance from './axiosInstance';

export interface ContactPayload {
  email: string;
  subject: string;
  message: string;
  name?: string;
}

/** POST /api/contact */
export async function sendContact(payload: ContactPayload): Promise<{ message: string }> {
  const { data } = await axiosInstance.post<{ message: string }>('/contact', payload);
  return data;
}
