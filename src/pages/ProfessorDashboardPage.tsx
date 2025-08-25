import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorDashboard from '@/components/ProfessorDashboard';

export default function ProfessorDashboardPage() {
  const navigate = useNavigate();
  const [professorData, setProfessorData] = useState<any>(null);

  useEffect(() => {
    const session = localStorage.getItem('professorSession');
    if (session) {
      setProfessorData(JSON.parse(session));
    } else {
      navigate('/professor');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('professorSession');
    navigate('/professor');
  };

  if (!professorData) {
    return null;
  }

  return (
    <ProfessorDashboard 
      professorData={professorData} 
      onLogout={handleLogout} 
    />
  );
}