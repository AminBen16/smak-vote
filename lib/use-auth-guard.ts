'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

type GuardStatus = 'loading' | 'authorized' | 'denied';

interface GuardState {
  status: GuardStatus;
  token: string | null;
  role: string | null;
}

export function useAuthGuard(allowedRoles: string[]): GuardState {
  const [state, setState] = useState<GuardState>({ status: 'loading', token: null, role: null });

  useEffect(() => {
    let active = true;

    async function check() {
      const session = await supabaseClient.auth.getSession();
      const token = session.data.session?.access_token ?? null;
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) {
        window.location.href = '/login';
        return;
      }

      const profile = await response.json();
      if (!active) {
        return;
      }
      if (!allowedRoles.includes(profile.role)) {
        setState({ status: 'denied', token, role: profile.role });
        return;
      }
      setState({ status: 'authorized', token, role: profile.role });
    }

    check();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
