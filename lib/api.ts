import axios, { type AxiosError } from "axios"
import { getSession } from "next-auth/react"
import { AxiosResponse } from "axios";

interface SignupData {
  name: string
  email: string
  password: string
  age?: number
  gender?: string
}

interface LoginData {
  email: string
  password: string
}

interface UserData {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session?.user?.accessToken}`
  }
  return config
})

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token might be expired, redirect to login
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const authApi = {

  signup: async (userData: SignupData): Promise<AxiosResponse<{ user: UserData; accessToken: string }>> => {
    const response = await api.post("/api/auth/signup", userData)
    return response.data
  },

  login: async (credentials: LoginData): Promise<AxiosResponse<{ user: UserData; accessToken: string }>> => {
    const response = await api.post("/api/auth/login", credentials)
    return response.data
  },

  logout: async (): Promise<AxiosResponse> => {
    const response = await api.post("/api/auth/logout")
    return response.data
  },

  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const res = await api.put("/api/auth/change-password", payload);
    return res.data;        
  },

  deleteAccount: async () => {
    const res = await api.delete("/api/auth/account");
    return res.data;           
  },
}

export const userApi = {

  getProfile: async (id: string): Promise<AxiosResponse<UserData>> => {
    return await api.get(`/api/user/${id}`)
  },

  updateProfile: async (id: string, data: Partial<UserData>): Promise<AxiosResponse<UserData>> => {
    return await api.put(`/api/user/${id}`, data)
  },

  getAllUsers: async (
    params?: Record<string, unknown>,
  ): Promise<AxiosResponse<{ users: UserData[]; pagination: unknown }>> => {
    return await api.get("/api/user", { params })
  },

  searchUsers: async (
    searchTerm: string,
    params?: Record<string, unknown>,
  ): Promise<AxiosResponse<{ users: UserData[]; pagination: unknown }>> => {
    return await api.get("/api/user/search", {
      params: { q: searchTerm, ...params },
    })
  },
}

export default api
