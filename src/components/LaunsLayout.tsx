import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { LaunsSidebar } from './LaunsSidebar';

interface LaunsLayoutProps {
  children: React.ReactNode;
}

export function LaunsLayout({ children }: LaunsLayoutProps) {
  return (
    <SidebarProvider>
      <div className="launs-theme min-h-screen flex w-full bg-background">
        <LaunsSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 bg-white/95 border-b border-gray-200 backdrop-blur-sm shadow-sm">
            <SidebarTrigger className="text-gray-700 hover:bg-gray-100 p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all" />
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-semibold text-sm bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                Launs Platform
              </span>
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