// lib/use-auth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { getMe } from '@/lib/api';

export function useAuth() {
  const token   = useAuthStore((s) => s.token);
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clear   = useAuthStore((s) => s.clearToken);
  const router  = useRouter();
  const [loading, setLoading] = useState(!!token); // true only if we have to fetch

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getMe()
      .then(setUser)
      .catch(() => {
        clear();
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [token, setUser, clear, router]);

  return { user, token, loading };
}