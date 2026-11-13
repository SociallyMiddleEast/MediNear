import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { backend, ensureDemoAccounts, type SignUpInput } from '../services/backend';
import { countryFromTimezone } from '../data/countries';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (input: SignUpInput) => Promise<User>;
  signOut: () => Promise<void>;
  update: (patch: Partial<User>) => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await ensureDemoAccounts(countryFromTimezone() ?? 'LB');
      setUser(await backend.currentUser());
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (e: string, p: string) => { const u = await backend.signIn(e, p); setUser(u); return u; }, []);
  const signUp = useCallback(async (i: SignUpInput) => { const u = await backend.signUp(i); setUser(u); return u; }, []);
  const signOut = useCallback(async () => { await backend.signOut(); setUser(null); }, []);
  const update = useCallback(async (patch: Partial<User>) => {
    if (!user) return;
    setUser(await backend.updateUser(user.id, patch));
  }, [user]);

  return <Ctx.Provider value={{ user, loading, signIn, signUp, signOut, update }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside AuthProvider');
  return c;
}
