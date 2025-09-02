import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorLogin from './ProfessorLogin';

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
          // Redirecionar para o dashboard com o novo layout
          navigate('/professor/dashboard');
          return;
        } else {
          localStorage.removeItem('professorSession');
        }
      } catch (error) {
        localStorage.removeItem('professorSession');
      }
    }
  }, [navigate]);

  const handleProfessorSuccess = (data: any) => {
    setProfessorData(data);
    // Redirecionar para o dashboard após login bem-sucedido
    navigate('/professor/dashboard');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Sempre mostrar tela de login na rota /professor
  return <ProfessorLogin onBack={handleBackToHome} onSuccess={handleProfessorSuccess} />;
};

export default ProfessorLayout;