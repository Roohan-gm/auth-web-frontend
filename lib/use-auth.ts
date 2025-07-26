import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe, storage } from "@/lib/api";
import type { UserData } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = storage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        storage.clearToken();
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  return { user, loading };
}