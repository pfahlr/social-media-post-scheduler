import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchMe() {
      try {
        const res = await apiClient.get<User>('/auth/me');
        if (!cancelled) {
          setUser(res.data);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchMe();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading, setUser };
}
