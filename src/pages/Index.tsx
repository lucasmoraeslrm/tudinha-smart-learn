import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from '@/components/StudentDashboard';
import StudentLogin from './StudentLogin';
import UserTypeSelector from '@/components/UserTypeSelector';
import ProfessorLogin from '@/components/ProfessorLogin';
import CoordenadorLogin from '@/components/CoordenadorLogin';
import ProfessorDashboard from '@/components/ProfessorDashboard';

const Index = () => {
  const { user, profile, studentSession, loading } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'selector' | 'student' | 'professor' | 'coordenador'>('selector');
  const [professorData, setProfessorData] = useState<any>(null);
  const [coordenadorData, setCoordenadorData] = useState<any>(null);

  useEffect(() => {
    console.log('Index: Loading status:', loading);
    console.log('Index: User:', user);
    console.log('Index: Profile:', profile);
    console.log('Index: Student session:', studentSession);
    console.log('Index: LocalStorage keys:', Object.keys(localStorage));
    
    if (loading) return;
    
    // Se há sessão de aluno ativa, redireciona para dashboard do aluno
    if (studentSession) {
      navigate('/dashboard');
      return;
    }

    // Se há usuário admin autenticado via Supabase, redireciona para admin
    if (user && profile?.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    // Verificar se há sessão de professor ou coordenador salva
    const savedProfessorSession = localStorage.getItem('professorSession');
    const savedCoordenadorSession = localStorage.getItem('coordenadorSession');
    
    if (savedProfessorSession) {
      const professorSession = JSON.parse(savedProfessorSession);
      setProfessorData(professorSession);
      setCurrentView('professor');
    } else if (savedCoordenadorSession) {
      const coordenadorSession = JSON.parse(savedCoordenadorSession);
      setCoordenadorData(coordenadorSession);
      setCurrentView('coordenador');
    }
    // Se não há nenhuma sessão ativa, mantém na tela de seleção (currentView = 'selector')
  }, [user, profile, studentSession, loading, navigate]);

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


  const handleUserTypeSelect = (type: 'student' | 'professor' | 'coordenador') => {
    setCurrentView(type);
  };

  const handleBackToSelector = () => {
    setCurrentView('selector');
    setProfessorData(null);
    setCoordenadorData(null);
  };

  const handleProfessorSuccess = (data: any) => {
    setProfessorData(data);
    setCurrentView('professor');
  };

  const handleCoordenadorSuccess = (data: any) => {
    setCoordenadorData(data);
    setCurrentView('coordenador');
  };

  const handleProfessorLogout = () => {
    setProfessorData(null);
    setCurrentView('selector');
  };

  const handleCoordenadorLogout = () => {
    setCoordenadorData(null);
    setCurrentView('selector');
  };

  // Renderizar baseado na visualização atual
  switch (currentView) {
    case 'student':
      if (studentSession) {
        return <StudentDashboard />;
      }
      return <StudentLogin onBack={handleBackToSelector} />;
    
    case 'professor':
      if (professorData) {
        return <ProfessorDashboard professorData={professorData} onLogout={handleProfessorLogout} />;
      }
      return <ProfessorLogin onBack={handleBackToSelector} onSuccess={handleProfessorSuccess} />;
    
    case 'coordenador':
      if (coordenadorData) {
        // TODO: Implementar CoordenadorDashboard
        return (
          <div className="min-h-screen bg-gradient-main flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Painel da Coordenação</h1>
              <p className="mb-4">Bem-vindo, {coordenadorData.nome}</p>
              <button onClick={handleCoordenadorLogout} className="bg-red-500 text-white px-4 py-2 rounded">
                Sair
              </button>
            </div>
          </div>
        );
      }
      return <CoordenadorLogin onBack={handleBackToSelector} onSuccess={handleCoordenadorSuccess} />;
    
    default:
      return <UserTypeSelector onSelectUserType={handleUserTypeSelect} />;
  }
};

export default Index;
