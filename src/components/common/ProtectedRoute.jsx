/**
 * ProtectedRoute.jsx
 * Guards all app routes — redirects unauthenticated users to /login.
 * Also enforces role-based access:
 *   - requireAdmin: only 'admin' can access
 *   - requireRole: 'admin' | 'manager' — viewers are redirected
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ requireAdmin = false, requireRole = null }) {
  const { session, isAdmin, isManager, loading } = useAuth();

  // Still resolving session — show nothing (avoids flash)
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-muted)',
        fontSize: '0.875rem',
        fontFamily: 'var(--font-family)',
      }}>
        <div style={{
          width: '24px', height: '24px',
          border: '2px solid rgba(255,255,255,0.15)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!session) return <Navigate to="/login" replace />;

  // Admin-only route, but user is not admin → redirect to dashboard
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;

  // Manager-or-above route, but user is a viewer → redirect to dashboard
  if (requireRole === 'manager' && !isAdmin && !isManager)
    return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
