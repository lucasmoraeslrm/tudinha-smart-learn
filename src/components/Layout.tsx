import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, 
  MessageCircle, 
  BookOpen,
  Settings, 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';


interface LayoutProps {
  children: React.ReactNode;
  userName: string;
  activeView: 'dashboard' | 'chat' | 'exercises';
  onViewChange: (view: 'dashboard' | 'chat' | 'exercises') => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userName, 
  activeView, 
  onViewChange, 
  onLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin, setAdminMode } = useIsAdmin();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'exercises', label: 'Exercícios', icon: BookOpen },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <Card className="hidden lg:flex flex-col w-64 h-screen sticky top-0 rounded-none border-r shadow-soft">
        {/* Logo/Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img 
                src="https://storange.tudinha.com.br/colag.png" 
                alt="Colégio Almeida Garrett" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Colégio Almeida Garrett</h2>
              <p className="text-sm text-muted-foreground">Plataforma de Estudos</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b">
          <div className="bg-gradient-primary/10 rounded-xl p-3">
            <p className="font-medium text-foreground">Olá, {userName}!</p>
            <p className="text-sm text-muted-foreground">Pronto para estudar?</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start h-12 ${
                    isActive 
                      ? 'bg-gradient-primary text-primary-foreground shadow-soft' 
                      : 'hover:bg-primary/5'
                  }`}
                  onClick={() => onViewChange(item.id as 'dashboard' | 'chat' | 'exercises')}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t space-y-2">
          {/* Admin Toggle */}
          <Button 
            variant={isAdmin ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setAdminMode(!isAdmin)}
          >
            <Shield className="w-5 h-5 mr-3" />
            {isAdmin ? 'Modo Admin Ativo' : 'Ativar Modo Admin'}
          </Button>
          
          {/* Admin Chat Access */}
          {isAdmin && (
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open('/admin/chat', '_blank')}
            >
              <MessageCircle className="w-5 h-5 mr-3" />
              Chat Admin
            </Button>
          )}
          
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="w-5 h-5 mr-3" />
            Configurações
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:bg-destructive/10"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </Card>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img 
                src="https://storange.tudinha.com.br/colag.png" 
                alt="Colégio Almeida Garrett" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="font-bold text-foreground">Colégio A.G.</h2>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMobileMenu}
            className="lg:hidden"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={toggleMobileMenu}>
          <Card className="fixed right-0 top-16 bottom-0 w-64 p-4 rounded-none border-l shadow-float">
            {/* User Info */}
            <div className="mb-6">
              <div className="bg-gradient-primary/10 rounded-xl p-3">
                <p className="font-medium text-foreground">Olá, {userName}!</p>
                <p className="text-sm text-muted-foreground">Pronto para estudar?</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 mb-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start h-12 ${
                      isActive 
                        ? 'bg-gradient-primary text-primary-foreground shadow-soft' 
                        : 'hover:bg-primary/5'
                    }`}
                    onClick={() => {
                      onViewChange(item.id as 'dashboard' | 'chat' | 'exercises');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="w-5 h-5 mr-3" />
                Configurações
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:bg-destructive/10"
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sair
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile header */}
        
        <main className="flex-1">
          {activeView === 'chat' ? (
            <Card className="h-[calc(100vh-4rem)] lg:h-screen m-4 lg:m-0 lg:rounded-none border shadow-soft">
              {children}
            </Card>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;