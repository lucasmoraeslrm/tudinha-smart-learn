import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeScreen from '@/components/WelcomeScreen';
import Dashboard from '@/components/Dashboard';
import Chat from '@/components/Chat';
import Exercises from '@/pages/Exercises';
import Layout from '@/components/Layout';

type AppState = 'welcome' | 'app';
type AppView = 'dashboard' | 'chat' | 'exercises';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [userName, setUserName] = useState<string>('');
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (user && profile) {
      // Se o usuário é admin, redirecionar para o dashboard admin
      if (profile.role === 'admin') {
        navigate('/admin/dashboard');
        return;
      }
      
      // Se é aluno autenticado, usar o nome do perfil
      setUserName(profile.full_name || user.email || 'Usuário');
      setAppState('app');
    } else {
      // Se não está logado, verificar localStorage para manter compatibilidade
      const savedUserName = localStorage.getItem('tudinha_user_name');
      if (savedUserName) {
        setUserName(savedUserName);
        setAppState('app');
      } else {
        // Redirecionar para login se não tiver dados salvos
        setAppState('welcome');
      }
    }
  }, [user, profile, loading, navigate]);

  const handleUserSetup = (name: string) => {
    // Se não há usuário autenticado, salvar no localStorage (modo offline)
    if (!user) {
      setUserName(name);
      localStorage.setItem('tudinha_user_name', name);
      setAppState('app');
    }
  };

  const handleLogout = async () => {
    if (user) {
      await signOut();
    }
    localStorage.removeItem('tudinha_user_name');
    setUserName('');
    setAppState('welcome');
    setActiveView('dashboard');
  };

  const handleStartChat = () => {
    setActiveView('chat');
  };

  const handleViewExercises = () => {
    setActiveView('exercises');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <img 
              src="https://storange.tudinha.com.br/colag.png" 
              alt="Carregando..." 
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (appState === 'welcome') {
    return <WelcomeScreen onUserSetup={handleUserSetup} />;
  }

  return (
    <Layout 
      userName={userName}
      activeView={activeView}
      onViewChange={setActiveView}
      onLogout={handleLogout}
    >
      {activeView === 'dashboard' && (
        <Dashboard userName={userName} onStartChat={handleStartChat} onViewExercises={handleViewExercises} />
      )}
      {activeView === 'chat' && (
        <Chat userName={userName} />
      )}
      {activeView === 'exercises' && (
        <Exercises />
      )}
    </Layout>
  );
};

export default Index;
