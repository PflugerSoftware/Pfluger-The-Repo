import { Navigate } from 'react-router-dom';
import { useAuth } from '../System/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that requires authentication
 * Redirects to /login if user is not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
