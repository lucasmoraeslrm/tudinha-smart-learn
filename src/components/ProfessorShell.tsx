import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  Users,
  MapPin,
  History,
  BookOpen,
  Settings, 
  LogOut,
  GraduationCap,
  School
} from 'lucide-react';

const sidebarItems = [
  { title: 'Dashboard', url: '/professor/dashboard', icon: LayoutDashboard },
  { title: 'Meus Alunos', url: '/professor/students', icon: Users },
  { title: 'Jornadas', url: '/professor/jornadas', icon: MapPin },
  { title: 'Histórico', url: '/professor/historico', icon: History },
  { title: 'Exercícios', url: '/professor/exercicios', icon: BookOpen },
];

interface ProfessorShellProps {
  children: React.ReactNode;
  professorData: any;
  onLogout: () => void;
}

export default function ProfessorShell({ children, professorData, onLogout }: ProfessorShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [escolaData, setEscolaData] = useState<any>(null);

  useEffect(() => {
    carregarDadosEscola();
  }, [professorData]);

  const carregarDadosEscola = async () => {
    if (!professorData?.escola_id) return;

    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .eq('id', professorData.escola_id)
        .single();

      if (error) {
        console.error('Erro ao carregar dados da escola:', error);
        return;
      }

      setEscolaData(data);
    } catch (error) {
      console.error('Erro ao carregar dados da escola:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/professor');
  };

  const professorName = professorData?.nome || 'Professor';

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 p-1 flex items-center justify-center overflow-hidden">
              {escolaData?.logo_url ? (
                <img
                  src={escolaData.logo_url}
                  alt={escolaData?.nome_fantasia || escolaData?.nome || 'Escola'}
                  className="w-full h-full object-contain rounded-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <School className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-sm">
                {escolaData?.nome_fantasia || escolaData?.nome || 'Sistema Acadêmico'}
              </h2>
              {escolaData?.codigo && (
                <p className="text-xs text-muted-foreground">{escolaData.codigo}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Área do Professor</p>
        </div>

        {/* Professor Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Olá, {professorName.split(' ')[0]}!</p>
              <p className="text-xs text-muted-foreground">Professor</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
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
      <div className="flex-1">
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}