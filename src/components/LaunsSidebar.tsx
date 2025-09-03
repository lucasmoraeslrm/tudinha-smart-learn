import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  School,
  BookOpen,
  Webhook,
  Users,
  LogOut,
  Settings,
  Activity,
  Monitor,
  FileText,
  Brain
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/launs/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Escolas',
    url: '/launs/escolas',
    icon: School,
  },
  {
    title: 'Lista de Exercícios',
    url: '/launs/exercicios',
    icon: BookOpen,
  },
  {
    title: 'IA ENEM',
    url: '/launs/ia-enem',
    icon: Brain,
  },
  {
    title: 'Webhooks',
    url: '/launs/webhooks',
    icon: Webhook,
  },
  {
    title: 'Status do Sistema',
    url: '/launs/sistema',
    icon: Activity,
  },
  {
    title: 'Status do Projeto',
    url: '/launs/status',
    icon: Monitor,
  },
  {
    title: 'Usuários',
    url: '/launs/usuarios',
    icon: Users,
  },
  {
    title: 'Documentação',
    url: '/docs/acessos',
    icon: FileText,
  },
];

export function LaunsSidebar() {
  const { open } = useSidebar();
  const collapsed = !open;
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const isActiveRoute = (url: string) => currentPath.startsWith(url);

  const handleLogout = async () => {
    await signOut();
    navigate('/launs');
  };

  return (
    <Sidebar className={`${collapsed ? 'w-16' : 'w-64'} border-r bg-sidebar shadow-sm`} style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
      <SidebarHeader className="p-4 border-b bg-sidebar" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <div>
              <h2 className="text-sidebar-foreground font-bold text-lg">Launs</h2>
              <p className="text-sidebar-foreground/70 text-sm font-medium">Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider font-semibold px-3 mb-2">
            {!collapsed ? 'Navegação' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveRoute(item.url)}
                    className="border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:border-primary px-3 py-3 rounded-lg"
                  >
                    <NavLink to={item.url} className="flex items-center gap-3 w-full">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t mt-auto bg-sidebar" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        {!collapsed && profile && (
          <div className="mb-4 p-3 bg-sidebar-accent rounded-lg border" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
            <p className="text-sidebar-foreground text-sm font-semibold truncate">
              {profile.full_name || 'Admin'}
            </p>
            <p className="text-sidebar-foreground/60 text-xs truncate font-medium">
              Administrador
            </p>
          </div>
        )}
        
        <div className={`flex ${collapsed ? 'flex-col gap-2' : 'gap-2'}`}>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium border hover:border-primary/30 transition-all"
            style={{ borderColor: 'hsl(var(--sidebar-border))' }}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-sm">Configurações</span>}
          </Button>
          
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleLogout}
            className="text-sidebar-foreground hover:bg-red-50 hover:text-red-600 font-medium border hover:border-red-200 transition-all"
            style={{ borderColor: 'hsl(var(--sidebar-border))' }}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-sm">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}