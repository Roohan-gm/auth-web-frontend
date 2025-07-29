// lib/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserData } from './types';


interface AuthState {
  token: string | null;
  user: UserData | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  hydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: UserData | null) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      status: 'loading',
      hydrated: false,
      setToken: (token) =>
        set({ token, status: token ? 'authenticated' : 'unauthenticated' }),
      setUser: (user) => set({ user }),
      clearToken: () =>
        set({ token: null, user: null, status: 'unauthenticated' }),
    }),
    {
      name: 'auth',
      onRehydrateStorage: () => () => {
        /* mark hydrated when restore is done */
        useAuthStore.setState({ hydrated: true });
      },
    }
  )
);