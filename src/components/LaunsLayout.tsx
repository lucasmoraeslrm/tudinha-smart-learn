import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { LaunsSidebar } from './LaunsSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LaunsLayoutProps {
  children: React.ReactNode;
}

export function LaunsLayout({ children }: LaunsLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/launs/login');
  };

  return (
    <SidebarProvider>
      <div className="launs-theme min-h-screen flex w-full bg-background">
        <LaunsSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 bg-white/95 border-b border-gray-200 backdrop-blur-sm shadow-sm">
            <SidebarTrigger className="text-gray-700 hover:bg-gray-100 p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                <span className="font-medium text-sm">
                  {profile?.full_name || 'Admin'}
                </span>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-gray-200 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-secondary">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}