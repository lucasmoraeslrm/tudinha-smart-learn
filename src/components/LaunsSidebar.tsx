import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Settings
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
    title: 'Webhooks',
    url: '/launs/webhooks',
    icon: Webhook,
  },
  {
    title: 'Usuários',
    url: '/launs/usuarios',
    icon: Users,
  },
];

export function LaunsSidebar() {
  const { open } = useSidebar();
  const collapsed = !open;
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/launs');
  };

  return (
    <Sidebar className={`${collapsed ? 'w-16' : 'w-64'} border-r border-white/10 bg-white/5`}>
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <div>
              <h2 className="text-white font-semibold">Launs</h2>
              <p className="text-white/60 text-xs">Admin Panel</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60 text-xs uppercase tracking-wider">
            {!collapsed ? 'Navegação' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white font-medium'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10">
        {!collapsed && profile && (
          <div className="mb-3">
            <p className="text-white text-sm font-medium truncate">
              {profile.full_name || 'Admin'}
            </p>
            <p className="text-white/60 text-xs truncate">
              Administrador
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className="text-white/80 hover:bg-white/10 hover:text-white flex-1"
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Configurações</span>}
          </Button>
          
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleLogout}
            className="text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}