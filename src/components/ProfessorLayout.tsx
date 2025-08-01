import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorLogin from './ProfessorLogin';
import ProfessorDashboard from './ProfessorDashboard';

const ProfessorLayout: React.FC = () => {
  const [professorData, setProfessorData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se existe sessão de professor salva
    const savedSession = localStorage.getItem('professorSession');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        // Verificar se a sessão ainda é válida (exemplo: menos de 8 horas)
        const loginTime = new Date(sessionData.loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 8) {
          setProfessorData(sessionData);
        } else {
          localStorage.removeItem('professorSession');
        }
      } catch (error) {
        localStorage.removeItem('professorSession');
      }
    }
  }, []);

  const handleProfessorSuccess = (data: any) => {
    setProfessorData(data);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('professorSession');
    setProfessorData(null);
    navigate('/');
  };

  if (professorData) {
    return <ProfessorDashboard professorData={professorData} onLogout={handleLogout} />;
  }

  return <ProfessorLogin onBack={handleBackToHome} onSuccess={handleProfessorSuccess} />;
};

export default ProfessorLayout;