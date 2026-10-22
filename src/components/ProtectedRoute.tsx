import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

const Loading = () => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status">
    <Loader2 className="h-8 w-8 animate-spin text-mint-600" aria-hidden />
    <span className="sr-only">Loading…</span>
  </div>
);

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}`, reason: 'auth-required' }} />;
  }

  return <>{children}</>;
}

function RoleRoute({ allow, title, text, children }: { allow: UserRole[]; title: string; text: string; children: ReactNode }) {
  const { user, role } = useAuth();
  return (
    <ProtectedRoute>
      {user && role === undefined ? (
        <Loading />
      ) : role && allow.includes(role) ? (
        children
      ) : (
        <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-3 max-w-md text-navy-600">{text}</p>
          <Link to="/account" className="mt-6 font-semibold text-mint-700 hover:underline">
            Go to my account
          </Link>
        </div>
      )}
    </ProtectedRoute>
  );
}

/** Role-gated pages. The database enforces the same rules; these just keep others off the page. */
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <RoleRoute allow={['admin']} title="Admins only" text="This page is for Omegs administrators. If you think you should have access, please contact the Omegs team.">
      {children}
    </RoleRoute>
  );
}

export function StaffRoute({ children }: { children: ReactNode }) {
  return (
    <RoleRoute allow={['employee', 'admin']} title="Staff only" text="This page is for Omegs cleaning staff. If you work for Omegs, ask an admin to give your account staff access.">
      {children}
    </RoleRoute>
  );
}
