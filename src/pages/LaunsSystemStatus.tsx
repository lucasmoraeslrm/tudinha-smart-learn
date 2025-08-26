import React from 'react';
import { LaunsLayout } from '@/components/LaunsLayout';
import SystemStatusMonitor from '@/components/SystemStatusMonitor';

export default function LaunsSystemStatus() {
  return (
    <LaunsLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Status do Sistema
          </h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real dos serviços e métricas da plataforma
          </p>
        </div>

        <SystemStatusMonitor />
      </div>
    </LaunsLayout>
  );
}