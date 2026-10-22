import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type SignUpInput, type SignUpResult } from '../services/auth';
import type { AppUser, UserRole } from '../types';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  /** `undefined` while the signed-in user's role is still loading. */
  role: UserRole | null | undefined;
  mode: 'supabase' | 'demo';
  signIn: (email: string, password: string, remember: boolean) => Promise<AppUser>;
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleState, setRoleState] = useState<{ userId: string; role: UserRole } | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    authService.getRole(userId).then((role) => active && setRoleState({ userId, role }));
    return () => {
      active = false;
    };
  }, [userId]);

  const role = !userId ? null : roleState?.userId === userId ? roleState.role : undefined;

  useEffect(() => {
    let active = true;
    authService.getCurrentUser().then((current) => {
      if (!active) return;
      setUser(current);
      setLoading(false);
    });
    const unsubscribe = authService.onChange((next) => setUser(next));
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    const next = await authService.signIn(email, password, remember);
    setUser(next);
    return next;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const result = await authService.signUp(input);
    if (result.user) setUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, role, mode: authService.mode, signIn, signUp, signOut, requestPasswordReset: authService.requestPasswordReset, updatePassword: authService.updatePassword }),
    [user, loading, role, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
