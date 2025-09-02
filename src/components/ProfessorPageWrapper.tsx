import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorShell from './ProfessorShell';

interface ProfessorPageWrapperProps {
  children: (professorData: any) => React.ReactNode;
}

export default function ProfessorPageWrapper({ children }: ProfessorPageWrapperProps) {
  const navigate = useNavigate();
  const [professorData, setProfessorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('professorSession');
    if (session) {
      try {
        setProfessorData(JSON.parse(session));
      } catch (error) {
        console.error('Error parsing professor session:', error);
        localStorage.removeItem('professorSession');
        navigate('/professor');
      }
    } else {
      navigate('/professor');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('professorSession');
    navigate('/professor');
  };

  if (loading || !professorData) {
    return null;
  }

  return (
    <ProfessorShell professorData={professorData} onLogout={handleLogout}>
      {children(professorData)}
    </ProfessorShell>
  );
}