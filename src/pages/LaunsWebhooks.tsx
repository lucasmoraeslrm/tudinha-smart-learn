import React from 'react';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Webhook, Plus, Activity, AlertCircle, CheckCircle } from 'lucide-react';

export default function LaunsWebhooks() {
  const webhooks = [
    { id: 1, name: 'User Registration', url: 'https://api.escola1.com/webhooks/user', status: 'active', lastTrigger: '2 min atrás' },
    { id: 2, name: 'Exercise Completion', url: 'https://api.escola2.com/webhooks/exercise', status: 'active', lastTrigger: '15 min atrás' },
    { id: 3, name: 'Payment Processing', url: 'https://api.escola3.com/webhooks/payment', status: 'error', lastTrigger: '1 hora atrás' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'error':
        return <Badge className="bg-red-500 hover:bg-red-600"><AlertCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Inativo</Badge>;
    }
  };

  return (
    <LaunsLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Webhooks
            </h1>
            <p className="text-white/80">
              Configure e monitore webhooks para integração com sistemas externos
            </p>
          </div>
          <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
            <Plus className="w-4 h-4 mr-2" />
            Novo Webhook
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total de Webhooks</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Webhook className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Ativos</p>
                  <p className="text-2xl font-bold">9</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Com Erro</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhooks Configurados
            </CardTitle>
            <CardDescription className="text-white/70">
              Lista de todos os webhooks registrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{webhook.name}</h3>
                    <p className="text-sm text-white/60">{webhook.url}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-white/80">Último disparo</p>
                      <p className="text-xs text-white/60">{webhook.lastTrigger}</p>
                    </div>
                    {getStatusBadge(webhook.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </LaunsLayout>
  );
}