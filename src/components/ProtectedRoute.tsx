import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, studentSession, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Check admin authentication
      if (user && profile) {
        if (requireAdmin && profile.role !== 'admin') {
          navigate('/');
          return;
        }

        if (!requireAdmin && profile.role === 'admin') {
          navigate('/admin/dashboard');
          return;
        }
      }

      // Check student authentication
      if (studentSession) {
        if (requireAdmin) {
          navigate('/');
          return;
        }
        // Student is logged in and doesn't need admin - allow access
        return;
      }

      // No authentication found
      if (!user && !studentSession) {
        navigate(requireAdmin ? '/admin' : '/');
      }
    }
  }, [user, profile, studentSession, loading, navigate, requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando...
        </div>
      </div>
    );
  }

  // Check if user is authenticated (either admin or student)
  const isAuthenticated = (user && profile) || studentSession;
  
  if (!isAuthenticated) {
    return null; // Será redirecionado
  }

  // Check admin requirements
  if (requireAdmin && profile?.role !== 'admin') {
    return null; // Será redirecionado
  }

  // Redirect admin to admin dashboard if accessing student area
  if (!requireAdmin && profile?.role === 'admin') {
    return null; // Será redirecionado
  }

  return <>{children}</>;
}