import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Check if user has already set up their name
    const savedUserName = localStorage.getItem('tudinha_user_name');
    if (savedUserName) {
      setUserName(savedUserName);
      setAppState('app');
    }
  }, []);

  const handleUserSetup = (name: string) => {
    setUserName(name);
    localStorage.setItem('tudinha_user_name', name);
    setAppState('app');
  };

  const handleLogout = () => {
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
