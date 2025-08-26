import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireLauns?: boolean;
  requireSchoolAdmin?: boolean;
  requireParent?: boolean;
  requireProfessor?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireLauns = false,
  requireSchoolAdmin = false,
  requireParent = false,
  requireProfessor = false
}: ProtectedRouteProps) {
  const { user, profile, studentSession, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Check for specific role requirements
      if (requireLauns) {
        if (!user || !profile || profile.role !== 'admin') {
          navigate('/launs');
          return;
        }
      }
      
      if (requireSchoolAdmin) {
        if (!user || !profile || !['school_admin', 'coordinator'].includes(profile.role)) {
          navigate('/admin');
          return;
        }
      }
      
      if (requireParent) {
        const parentSession = localStorage.getItem('parentSession');
        if (!parentSession) {
          navigate('/admin');
          return;
        }
      }
      
      if (requireProfessor) {
        const professorSession = localStorage.getItem('professorSession');
        if (!professorSession) {
          navigate('/admin');
          return;
        }
      }
      
      if (requireAdmin) {
        if (!user || !profile || profile.role !== 'admin') {
          navigate('/admin');
          return;
        }
      }

      // Check authentication and redirect based on role
      if (user && profile) {
        if (requireLauns && profile.role !== 'admin') {
          navigate('/launs');
          return;
        }
        if (requireSchoolAdmin && !['school_admin', 'coordinator'].includes(profile.role)) {
          navigate('/admin');
          return;
        }
        if (requireAdmin && profile.role !== 'admin') {
          navigate('/admin');
          return;
        }
        return;
      }

      // Check student authentication
      if (studentSession) {
        if (requireAdmin || requireLauns || requireSchoolAdmin || requireParent || requireProfessor) {
          navigate('/admin');
          return;
        }
        return;
      }

      // Check professor session
      const professorSession = localStorage.getItem('professorSession');
      if (professorSession && !requireProfessor && (requireAdmin || requireLauns || requireSchoolAdmin)) {
        navigate('/admin');
        return;
      }

      // Check parent session  
      const parentSession = localStorage.getItem('parentSession');
      if (parentSession && !requireParent && (requireAdmin || requireLauns || requireSchoolAdmin)) {
        navigate('/admin');
        return;
      }

      // No authentication found
      if (!user && !studentSession && !professorSession && !parentSession) {
        navigate('/admin');
      }
    }
  }, [user, profile, studentSession, loading, navigate, requireAdmin, requireLauns, requireSchoolAdmin, requireParent, requireProfessor]);

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

  // Check authentication based on requirements
  if (requireLauns) {
    if (!user || !profile || profile.role !== 'admin') {
      return null;
    }
  }
  
  if (requireSchoolAdmin) {
    if (!user || !profile || !['school_admin', 'coordinator'].includes(profile.role)) {
      return null;
    }
  }
  
  if (requireParent) {
    const parentSession = localStorage.getItem('parentSession');
    if (!parentSession) {
      return null;
    }
  }
  
  if (requireProfessor) {
    const professorSession = localStorage.getItem('professorSession');
    if (!professorSession) {
      return null;
    }
  }
  
  if (requireAdmin) {
    if (!user || !profile || profile.role !== 'admin') {
      return null;
    }
  }

  // Check if user is authenticated (admin, student, parent, or professor)
  const parentSession = localStorage.getItem('parentSession');
  const professorSession = localStorage.getItem('professorSession');
  const isAuthenticated = (user && profile) || studentSession || parentSession || professorSession;
  
  if (!isAuthenticated) {
    return null; // Será redirecionado
  }

  return <>{children}</>;
}