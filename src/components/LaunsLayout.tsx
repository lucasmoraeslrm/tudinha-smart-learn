import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { LaunsSidebar } from './LaunsSidebar';

interface LaunsLayoutProps {
  children: React.ReactNode;
}

export function LaunsLayout({ children }: LaunsLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-main">
        <LaunsSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 bg-white/5 border-b border-white/10">
            <SidebarTrigger className="text-white hover:bg-white/10" />
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm">Launs Platform</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}