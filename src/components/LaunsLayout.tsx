import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { LaunsSidebar } from './LaunsSidebar';

interface LaunsLayoutProps {
  children: React.ReactNode;
}

export function LaunsLayout({ children }: LaunsLayoutProps) {
  return (
    <SidebarProvider>
      <div className="launs-theme min-h-screen flex w-full bg-gradient-main">
        <LaunsSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 bg-white/10 border-b border-white/20 backdrop-blur-sm">
            <SidebarTrigger className="text-white hover:bg-white/20 p-2 rounded-lg border border-white/20 hover:border-white/40 transition-all" />
            <div className="flex items-center gap-4">
              <span className="text-white font-semibold text-sm bg-white/10 px-3 py-1 rounded-full border border-white/20">
                Launs Platform
              </span>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-gradient-to-br from-transparent to-black/10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}