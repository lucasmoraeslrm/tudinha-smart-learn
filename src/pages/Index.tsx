import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';
import { supabase } from '@/integrations/supabase/client';
import StudentLoginForm from '@/components/StudentLoginForm';
import { Button } from '@/components/ui/button';
const Index = () => {
  const {
    instancia
  } = useParams();
  const {
    branding
  } = useSchoolBranding(instancia);
  const {
    user,
    profile,
    studentSession,
    loading
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const initializeApp = async () => {
      if (loading) return;

      // Se há user mas não há profile, limpar tudo
      if (user && !profile) {
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.reload();
        return;
      }

      // Se há sessão de aluno ativa, redireciona para dashboard do aluno
      if (studentSession) {
        navigate('/dashboard');
        return;
      }

      // Se há usuário admin autenticado, redireciona para admin
      if (user && profile?.role === 'admin') {
        navigate('/admin/dashboard');
        return;
      }

      // Verificar sessões de outros tipos de usuário
      const savedProfessorSession = localStorage.getItem('professorSession');
      const savedParentSession = localStorage.getItem('parentSession');
      if (savedProfessorSession) {
        navigate('/professor/dashboard');
        return;
      }
      if (savedParentSession) {
        navigate('/pais/dashboard');
        return;
      }
    };
    initializeApp();
  }, [user, profile, studentSession, loading, navigate]);
  const handleClearAllSessions = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.reload();
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4">
            <img src="/src/assets/tudinha-mascot.png" alt="Carregando..." className="w-full h-full object-contain animate-pulse" />
          </div>
          <p className="text-white/80">Carregando...</p>
          <Button variant="ghost" onClick={handleClearAllSessions} className="mt-4 text-sm text-white/60 hover:text-white">
            Limpar sessões
          </Button>
        </div>
      </div>;
  }
  const primaryColor = branding?.cor_primaria || '#3B82F6';
  const secondaryColor = branding?.cor_secundaria || '#1E40AF';
  return <div className="min-h-screen flex">
      {/* Left Side - Image/Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{
      background: branding?.login_image_url ? `linear-gradient(135deg, ${primaryColor}AA, ${secondaryColor}AA), url(${branding.login_image_url})` : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: branding?.login_image_url ? 'overlay' : 'normal'
    }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          
        </div>
      </div>

      {/* Right Side - Login and Navigation */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Student Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <StudentLoginForm onBack={() => navigate('/')} />
          </div>
        </div>
      </div>
    </div>;
};
export default Index;