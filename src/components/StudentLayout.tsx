import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveModules } from '@/hooks/useActiveModules';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageCircle, 
  BookOpen, 
  Settings, 
  LogOut,
  User,
  MapPin,
  FileText
} from 'lucide-react';

const sidebarItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, moduleCode: null }, // Always available
  { title: 'Jornada', url: '/jornada', icon: MapPin, moduleCode: 'jornada' },
  { title: 'Redação', url: '/redacao', icon: FileText, moduleCode: 'redacao' },
  { title: 'Tudinha', url: '/chat', icon: MessageCircle, moduleCode: 'tudinha-chat' },
  { title: 'Exercícios', url: '/exercicios', icon: BookOpen, moduleCode: 'exercicios' },
];

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { studentSession, signOut, getStudentName } = useAuth();
  const { activeModules } = useActiveModules(studentSession?.escola_id || null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const studentName = studentSession?.full_name || studentSession?.name || getStudentName() || 'Estudante';

  // Filter menu items based on active modules
  const availableModuleCodes = activeModules.map(module => module.codigo);
  const filteredSidebarItems = sidebarItems.filter(item => 
    item.moduleCode === null || availableModuleCodes.includes(item.moduleCode)
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 p-2">
              <img 
                src="https://storange.tudinha.com.br/colag.png" 
                alt="Colégio Almeida Garrett" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Colégio Almeida</h2>
              <p className="text-xs text-muted-foreground">Garrett</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Plataforma de Estudos</p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Olá, {studentName.split(' ')[0]}!</p>
              <p className="text-xs text-muted-foreground">Pronto para estudar?</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {filteredSidebarItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <li key={item.title}>
                  <NavLink
                    to={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4 mr-3" />
            Configurações
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Olá, {studentName.split(' ')[0]}! 👋</h1>
            <p className="text-sm text-muted-foreground">Vamos continuar seus estudos com a Tudinha</p>
          </div>
          
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate('/chat')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Conversar com Tudinha
          </Button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}