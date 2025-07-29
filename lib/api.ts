// lib/api.ts
import axios, { AxiosError } from 'axios';
import { CleanParams, LoginData, SignupData, User } from './types';
import { useAuthStore } from './authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

const isBrowser = typeof window !== 'undefined';

export const TOKEN_KEY = 'jwt';

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && isBrowser) {
      useAuthStore.getState().clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (userData: SignupData) =>
    api.post<{ user: User; token: string }>('/signup', userData).then((r) => r.data),
  login: (credentials: LoginData) =>
    api.post<{ user: User; token: string }>('/login', credentials).then((r) => r.data),
  google: (googleCode: string) =>
    api.post<{ user: User; token: string }>('/google', { token: googleCode }).then((r) => r.data),
  logout: () => api.post('/logout').then((r) => r.data),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>('/update-password', payload).then((r) => r.data),
  deleteAccount: () => api.delete<{ message: string }>('/delete').then((r) => r.data),
};

export const userApi = {
  getAllUsers: (params?: Record<string, unknown>) => {
    const cleaned: CleanParams = {};
    const allowed = ['id', 'name', 'email', 'createdAt', 'updatedAt'];

    if (params?.page != null) cleaned.page = Number(params.page);
    if (params?.limit != null) cleaned.limit = Number(params.limit);
    if (params?.order != null) cleaned.order = String(params.order);
    const sort = String(params?.sort || '').toLowerCase();
    if (allowed.includes(sort)) cleaned.sort = sort;

    return api.get<{ users: User[]; pagination: unknown }>('/users', { params: cleaned });
  },
  searchUsers: (searchTerm: string, params?: Record<string, unknown>) =>
    api.get<{ users: User[]; pagination: unknown }>('/users/search', {
      params: { q: searchTerm, ...params },
    }),
  getProfile: (id: string) => api.get<User>(`/users/${id}`),
  updateProfile: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),
};

export const getMe = async (): Promise<User | null> => {
  const token = useAuthStore.getState().token;
  if (!token) return null;
  const res = await api.get<User>('/me');
  return res.data;
};

export default api;