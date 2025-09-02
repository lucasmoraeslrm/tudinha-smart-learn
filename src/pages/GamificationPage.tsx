import React from 'react';
import GameificationDashboard from '@/components/GameificationDashboard';

export default function GamificationPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Progresso e Conquistas</h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e desbloqueie conquistas enquanto estuda
        </p>
      </div>
      
      <GameificationDashboard />
    </div>
  );
}