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
    <Sidebar className={`${collapsed ? 'w-16' : 'w-64'} border-r border-sidebar-border bg-sidebar shadow-sm`}>
      <SidebarHeader className="p-4 border-b border-sidebar-border bg-sidebar">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/90 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <h2 className="text-sidebar-foreground font-bold text-lg">Launs</h2>
              <p className="text-sidebar-foreground/70 text-sm font-medium">Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-primary/90 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
              <span className="text-white font-bold text-lg">L</span>
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
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium'
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

      <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto bg-sidebar">
        {!collapsed && profile && (
          <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
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
            className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium border border-sidebar-border hover:border-primary/30 transition-all"
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-sm">Configurações</span>}
          </Button>
          
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleLogout}
            className="text-sidebar-foreground/80 hover:bg-red-50 hover:text-red-600 font-medium border border-sidebar-border hover:border-red-200 transition-all"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-sm">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}