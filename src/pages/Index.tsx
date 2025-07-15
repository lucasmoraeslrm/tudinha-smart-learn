import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from '@/components/StudentDashboard';
import StudentLogin from './StudentLogin';

const Index = () => {
  const { user, profile, studentSession, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (user && profile?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, profile, loading, navigate]);

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

  // Redirect admin to admin dashboard
  if (user && profile?.role === 'admin') {
    return null;
  }
  
  // Show dashboard if student is logged in, login screen otherwise
  if (studentSession) {
    return <StudentDashboard />;
  }
  
  return <StudentLogin />;
};

export default Index;
