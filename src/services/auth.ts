import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, setRememberSession, supabase } from '../lib/supabase';
import type { AppUser, UserRole } from '../types';

export interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignUpResult {
  user: AppUser | null;
  needsEmailConfirmation: boolean;
}

export interface AuthService {
  mode: 'supabase' | 'demo';
  getCurrentUser(): Promise<AppUser | null>;
  signIn(email: string, password: string, remember: boolean): Promise<AppUser>;
  signUp(input: SignUpInput): Promise<SignUpResult>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  getRole(userId: string): Promise<UserRole>;
  onChange(callback: (user: AppUser | null) => void): () => void;
}

export class AuthError extends Error {}

/** Absolute URL inside this app, including the deploy base path (e.g. /omegs/ on GitHub Pages). */
const appUrl = (path: string) => `${window.location.origin}${import.meta.env.BASE_URL}${path}`;

const toAppUser = (user: User): AppUser => ({
  id: user.id,
  email: user.email ?? '',
  fullName: (user.user_metadata?.full_name as string | undefined) ?? user.email?.split('@')[0] ?? 'Omegs customer',
  phone: user.user_metadata?.phone as string | undefined,
});

const friendlySupabaseError = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'The email or password you entered is incorrect.';
  if (m.includes('email not confirmed')) return 'Please confirm your email address before logging in. Check your inbox for the confirmation link.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'An account with this email already exists. Try logging in instead.';
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.';
  if (m.includes('password')) return message;
  return 'Something went wrong. Please try again.';
};

const supabaseAuth = (): AuthService => {
  const client = supabase!;
  return {
    mode: 'supabase',
    async getCurrentUser() {
      const { data } = await client.auth.getSession();
      return data.session?.user ? toAppUser(data.session.user) : null;
    },
    async signIn(email, password, remember) {
      setRememberSession(remember);
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data.user) throw new AuthError(friendlySupabaseError(error?.message ?? ''));
      return toAppUser(data.user);
    },
    async signUp({ fullName, email, phone, password }) {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: appUrl('account'),
        },
      });
      if (error) throw new AuthError(friendlySupabaseError(error.message));
      // Supabase returns a user with no identities when the email is already registered.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new AuthError('An account with this email already exists. Try logging in instead.');
      }
      return { user: data.session && data.user ? toAppUser(data.user) : null, needsEmailConfirmation: !data.session };
    },
    async signOut() {
      await client.auth.signOut();
    },
    async requestPasswordReset(email) {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: appUrl('reset-password') });
      if (error) throw new AuthError(friendlySupabaseError(error.message));
    },
    async updatePassword(password) {
      const { error } = await client.auth.updateUser({ password });
      if (error) {
        const m = error.message.toLowerCase();
        if (m.includes('different from the old')) throw new AuthError('Your new password must be different from your old password.');
        throw new AuthError(friendlySupabaseError(error.message));
      }
    },
    async getRole(userId) {
      const { data } = await client.from('profiles').select('role').eq('id', userId).maybeSingle();
      return (data?.role as UserRole | undefined) ?? 'customer';
    },
    onChange(callback) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ? toAppUser(session.user) : null);
      });
      return () => data.subscription.unsubscribe();
    },
  };
};

/**
 * Demo-only auth stored in this browser. It is NOT secure and does not create real accounts.
 * Used automatically when Supabase environment variables are not configured.
 */
const DEMO_USERS = 'omegs.demo.users';
const DEMO_SESSION = 'omegs.demo.session';

interface DemoRecord extends AppUser {
  passwordHash: string;
}

const hash = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const demoAuth = (): AuthService => {
  const listeners = new Set<(user: AppUser | null) => void>();
  const readUsers = (): DemoRecord[] => JSON.parse(localStorage.getItem(DEMO_USERS) ?? '[]');
  const strip = (record: DemoRecord): AppUser => ({ id: record.id, email: record.email, fullName: record.fullName, phone: record.phone });
  const readSession = (): AppUser | null => {
    const raw = localStorage.getItem(DEMO_SESSION) ?? sessionStorage.getItem(DEMO_SESSION);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  };
  const writeSession = (user: AppUser | null, remember = true) => {
    localStorage.removeItem(DEMO_SESSION);
    sessionStorage.removeItem(DEMO_SESSION);
    if (user) (remember ? localStorage : sessionStorage).setItem(DEMO_SESSION, JSON.stringify(user));
    listeners.forEach((listener) => listener(user));
  };

  return {
    mode: 'demo',
    async getCurrentUser() {
      return readSession();
    },
    async signIn(email, password, remember) {
      await delay(700);
      const record = readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!record || record.passwordHash !== (await hash(password))) {
        throw new AuthError('The email or password you entered is incorrect.');
      }
      const user = strip(record);
      writeSession(user, remember);
      return user;
    },
    async signUp({ fullName, email, phone, password }) {
      await delay(800);
      const users = readUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new AuthError('An account with this email already exists. Try logging in instead.');
      }
      const record: DemoRecord = { id: crypto.randomUUID(), email, fullName, phone, passwordHash: await hash(password) };
      localStorage.setItem(DEMO_USERS, JSON.stringify([...users, record]));
      const user = strip(record);
      writeSession(user);
      return { user, needsEmailConfirmation: false };
    },
    async signOut() {
      writeSession(null);
    },
    async requestPasswordReset() {
      await delay(700);
    },
    async updatePassword(password) {
      await delay(500);
      const session = readSession();
      if (!session) throw new AuthError('Your reset link is invalid or has expired. Please request a new one.');
      const passwordHash = await hash(password);
      localStorage.setItem(DEMO_USERS, JSON.stringify(readUsers().map((u) => (u.id === session.id ? { ...u, passwordHash } : u))));
    },
    async getRole() {
      return 'customer';
    },
    onChange(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
};

export const authService: AuthService = isSupabaseConfigured ? supabaseAuth() : demoAuth();
