'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

type NavItem = { href: '/' | '/vote' | '/results' | '/admin' | '/officer'; label: string };

const publicItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/results', label: 'Results' }
];

export function SiteHeader() {
  const [role, setRole] = useState<string | null>(null);
  const [hasVotingToken, setHasVotingToken] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const session = await supabaseClient.auth.getSession();
      const token = session.data.session?.access_token ?? null;
      const votingToken = window.localStorage.getItem('smak-voting-token');
      if (!active) {
        return;
      }
      setHasVotingToken(Boolean(votingToken));
      if (token) {
        const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (active && response.ok) {
          const profile = await response.json();
          setRole(profile.role);
        }
      }
      if (active) {
        setReady(true);
      }
    }

    loadSession();
    return () => {
      active = false;
    };
  }, []);

  async function signOut() {
    await supabaseClient.auth.signOut();
    window.localStorage.removeItem('smak-voting-token');
    window.location.href = '/';
  }

  const isLoggedIn = Boolean(role) || hasVotingToken;
  const navItems: NavItem[] = [...publicItems];
  if (isLoggedIn) {
    navItems.splice(1, 0, { href: '/vote', label: 'Vote' });
  }
  if (role === 'admin') {
    navItems.push({ href: '/admin', label: 'Admin' });
  }
  if (role === 'admin' || role === 'officer') {
    navItems.push({ href: '/officer', label: 'Officer' });
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          St. Mark’s Prefect Vote
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
              {item.label}
            </Link>
          ))}
          {ready && (isLoggedIn ? (
            <button onClick={signOut} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-200">
              Log out
            </button>
          ) : (
            <Link href="/login" className="rounded-full bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
              Login
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
