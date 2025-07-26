import axios, { AxiosResponse, type AxiosError } from "axios";
import { LoginData, SignupData, User } from "./types";

/* ---------- axios instance ---------- */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/* ---------- token helpers ---------- */
export const TOKEN_KEY = "jwt";
export const storage = {
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

/* ---------- request / response interceptors ---------- */
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      storage.clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* ---------- auth API ---------- */
export const authApi = {
  signup: (userData: SignupData) =>
    api.post<{ user: User; token: string }>("/api/auth/signup", userData).then((r) => r.data),

  login: (credentials: LoginData) =>
    api.post<{ user: User; token: string }>("/api/auth/login", credentials).then((r) => r.data),

  google: (googleCode: string) =>
    api.post<{ user: User; token: string }>("/api/auth/google", { token: googleCode }).then((r) => r.data),

  logout: () => api.post("/api/auth/logout").then((r) => r.data),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.put("/api/auth/change-password", payload).then((r) => r.data),

  deleteAccount: () => api.delete("/api/auth/account").then((r) => r.data),
};

/* ---------- user API ---------- */
export const userApi = {
  getProfile: (id: string) => api.get<AxiosResponse>(`/api/user/${id}`).then((r) => r.data),

  updateProfile: (id: string, data: Partial<User>) =>
    api.put<User>(`/api/user/${id}`, data).then((r) => r.data),

  getAllUsers: (params?: Record<string, unknown>) =>
    api.get<{ users: User[]; pagination: unknown }>("/api/user", { params }).then((r) => r.data),

  searchUsers: (searchTerm: string, params?: Record<string, unknown>) =>
    api.get<{ users: User[]; pagination: unknown }>("/api/user/search", {
      params: { q: searchTerm, ...params },
    }).then((r) => r.data),
};

export const getMe = async (): Promise<User | null> => {
  const token = storage.getToken();
  if (!token) return null;
  const res = await api.get<User>("/api/auth/me");
  return res.data;
};

export default api;