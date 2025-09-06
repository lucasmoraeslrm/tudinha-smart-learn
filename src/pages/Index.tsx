import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';
import { supabase } from '@/integrations/supabase/client';
import StudentLogin from './StudentLogin';
import { Button } from '@/components/ui/button';
import { Shield, GraduationCap, Users, Settings, FileText } from 'lucide-react';

const Index = () => {
  const { instancia } = useParams();
  const { branding } = useSchoolBranding(instancia);
  const { user, profile, studentSession, loading } = useAuth();
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
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4">
            <img 
              src="/src/assets/tudinha-mascot.png" 
              alt="Carregando..." 
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
          <p className="text-white/80">Carregando...</p>
          <Button 
            variant="ghost"
            onClick={handleClearAllSessions}
            className="mt-4 text-sm text-white/60 hover:text-white"
          >
            Limpar sessões
          </Button>
        </div>
      </div>
    );
  }

  const primaryColor = branding?.cor_primaria || '#3B82F6';
  const secondaryColor = branding?.cor_secundaria || '#1E40AF';

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Gradient */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: branding?.login_image_url 
            ? `linear-gradient(135deg, ${primaryColor}AA, ${secondaryColor}AA), url(${branding.login_image_url})`
            : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: branding?.login_image_url ? 'overlay' : 'normal'
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            {branding?.logo_url ? (
              <img 
                src={branding.logo_url} 
                alt={branding.nome}
                className="mx-auto h-24 w-auto mb-8 filter brightness-0 invert"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <img 
                  src="/src/assets/tudinha-mascot.png" 
                  alt="Tudinha Mascot" 
                  className="w-16 h-16"
                />
              </div>
            )}
            <h1 className="text-5xl font-bold mb-6">
              {branding?.nome || "Portal Educacional"}
            </h1>
            <p className="text-2xl opacity-90">
              Sistema de Gestão Educacional
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login and Navigation */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-primary to-primary-dark p-6 text-center text-white">
          {branding?.logo_url ? (
            <img 
              src={branding.logo_url} 
              alt={branding.nome}
              className="mx-auto h-16 w-auto mb-4"
            />
          ) : (
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <img 
                src="/src/assets/tudinha-mascot.png" 
                alt="Tudinha Mascot" 
                className="w-10 h-10"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold mb-2">
            {branding?.nome || "Portal Educacional"}
          </h1>
          <p className="opacity-90">
            Sistema de Gestão Educacional
          </p>
        </div>

        {/* Student Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <StudentLogin onBack={() => navigate('/')} />
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="p-8 bg-muted/5">
          <h2 className="text-xl font-semibold text-foreground mb-4 text-center">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => navigate('/coordenador')}
            >
              <Shield className="w-5 h-5" />
              <span className="text-xs">Direção</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => navigate('/professor')}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="text-xs">Professor</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => navigate('/parent')}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs">Pais</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => navigate('/docs/acessos')}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs">Docs</span>
            </Button>

            {/* Mostrar apenas se for ambiente de desenvolvimento */}
            {window.location.hostname === 'localhost' && (
              <Button
                variant="outline"
                size="sm"
                className="h-16 flex flex-col items-center justify-center space-y-1 col-span-2 lg:col-span-4"
                onClick={() => navigate('/launs')}
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs">Desenvolvedores</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
