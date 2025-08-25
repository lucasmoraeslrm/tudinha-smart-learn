import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import StudentLogin from './StudentLogin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
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

  // Student Login Page
  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <img 
              src="/src/assets/tudinha-mascot.png" 
              alt="Tudinha" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Tudinha
          </h1>
          <p className="text-white/80 text-lg">
            Sua plataforma de aprendizado inteligente
          </p>
        </div>

        {/* Student Login */}
        <div className="max-w-md mx-auto mb-8">
          <StudentLogin />
        </div>

        {/* Quick Access Links */}
        <div className="text-center space-y-4">
          <p className="text-white/60 text-sm">Acesso para outros usuários:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin')}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Direção/Coordenação
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/professor')}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Professor
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/pais')}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Pais/Responsáveis
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/launs')}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Desenvolvedores
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
