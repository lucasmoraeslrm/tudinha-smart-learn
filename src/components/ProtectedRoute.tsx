import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Se não está logado, redireciona para o login apropriado
        navigate(requireAdmin ? '/admin' : '/');
        return;
      }

      if (requireAdmin && profile?.role !== 'admin') {
        // Se precisa ser admin mas não é, redireciona
        navigate('/');
        return;
      }

      if (!requireAdmin && profile?.role === 'admin') {
        // Se é admin tentando acessar área de aluno, redireciona
        navigate('/admin/dashboard');
        return;
      }
    }
  }, [user, profile, loading, navigate, requireAdmin]);

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

  if (!user) {
    return null; // Será redirecionado
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return null; // Será redirecionado
  }

  if (!requireAdmin && profile?.role === 'admin') {
    return null; // Será redirecionado
  }

  return <>{children}</>;
}