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
    <Sidebar className={`${collapsed ? 'w-16' : 'w-64'} border-r border-white/20 bg-primary/95 backdrop-blur-sm`}>
      <SidebarHeader className="p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Launs</h2>
              <p className="text-white/70 text-sm font-medium">Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-lg">L</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 text-xs uppercase tracking-wider font-semibold px-3 mb-2">
            {!collapsed ? 'Navegação' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-white/20 text-white font-semibold border border-white/30 shadow-lg'
                            : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
                        }`
                      }
                    >
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

      <SidebarFooter className="p-4 border-t border-white/10 mt-auto">
        {!collapsed && profile && (
          <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
            <p className="text-white text-sm font-semibold truncate">
              {profile.full_name || 'Admin'}
            </p>
            <p className="text-white/70 text-xs truncate font-medium">
              Administrador
            </p>
          </div>
        )}
        
        <div className={`flex ${collapsed ? 'flex-col gap-2' : 'gap-2'}`}>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className="text-white/90 hover:bg-white/20 hover:text-white font-medium border border-white/20 hover:border-white/40 transition-all"
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-sm">Configurações</span>}
          </Button>
          
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleLogout}
            className="text-white/90 hover:bg-red-500/80 hover:text-white font-medium border border-white/20 hover:border-red-400/60 transition-all"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-sm">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}