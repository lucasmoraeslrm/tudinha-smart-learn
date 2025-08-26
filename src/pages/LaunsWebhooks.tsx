import React, { useState, useEffect } from 'react';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Webhook, Plus, Activity, AlertCircle, CheckCircle, Edit, Trash2, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WebhookData {
  id: string;
  nome: string;
  tipo: string;
  url_teste: string;
  url_producao: string;
  ativo: boolean;
  modo_producao: boolean;
  ultimo_disparo?: string;
  ultimo_status?: string;
  total_disparos: number;
}

const tiposWebhook = [
  { value: 'chat_ia', label: 'Chat IA' },
  { value: 'criar_tema_redacao', label: 'Criar Tema Redação' },
  { value: 'corrigir_redacao_texto', label: 'Corrigir Redação Texto' },
  { value: 'corrigir_redacao_imagem', label: 'Corrigir Redação Imagem' },
  { value: 'ia_assistente_direcao', label: 'IA Assistente Direção' },
  { value: 'jornada_resumo', label: 'Jornada do Aluno - Resumo' },
  { value: 'jornada_duvidas', label: 'Jornada do Aluno - Dúvidas' },
  { value: 'jornada_exercicios', label: 'Jornada do Aluno - Criar Exercícios' },
];

export default function LaunsWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookData | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    url_teste: '',
    url_producao: '',
    ativo: true,
    modo_producao: false,
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Erro ao buscar webhooks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os webhooks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveWebhook = async () => {
    try {
      if (editingWebhook) {
        const { error } = await supabase
          .from('webhooks')
          .update(formData)
          .eq('id', editingWebhook.id);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Webhook atualizado com sucesso" });
      } else {
        const { error } = await supabase
          .from('webhooks')
          .insert([formData]);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Webhook criado com sucesso" });
      }
      
      setIsDialogOpen(false);
      setEditingWebhook(null);
      resetForm();
      fetchWebhooks();
    } catch (error) {
      console.error('Erro ao salvar webhook:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o webhook",
        variant: "destructive",
      });
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Sucesso", description: "Webhook removido com sucesso" });
      fetchWebhooks();
    } catch (error) {
      console.error('Erro ao deletar webhook:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o webhook",
        variant: "destructive",
      });
    }
  };

  const toggleWebhookStatus = async (webhook: WebhookData) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ ativo: !webhook.ativo })
        .eq('id', webhook.id);
      
      if (error) throw error;
      fetchWebhooks();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: '',
      url_teste: '',
      url_producao: '',
      ativo: true,
      modo_producao: false,
    });
  };

  const openDialog = (webhook?: WebhookData) => {
    if (webhook) {
      setEditingWebhook(webhook);
      setFormData({
        nome: webhook.nome,
        tipo: webhook.tipo,
        url_teste: webhook.url_teste,
        url_producao: webhook.url_producao,
        ativo: webhook.ativo,
        modo_producao: webhook.modo_producao,
      });
    } else {
      setEditingWebhook(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const getStatusBadge = (webhook: WebhookData) => {
    if (!webhook.ativo) {
      return <Badge variant="secondary">Inativo</Badge>;
    }
    
    if (webhook.ultimo_status === 'error') {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Erro</Badge>;
    }
    
    return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
  };

  const formatLastTrigger = (date?: string) => {
    if (!date) return 'Nunca executado';
    
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return 'Agora mesmo';
  };

  const activeWebhooks = webhooks.filter(w => w.ativo).length;
  const errorWebhooks = webhooks.filter(w => w.ultimo_status === 'error').length;

  if (loading) {
    return (
      <LaunsLayout>
        <div className="p-6">
          <div className="text-white">Carregando webhooks...</div>
        </div>
      </LaunsLayout>
    );
  }

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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                onClick={() => openDialog()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingWebhook ? 'Editar Webhook' : 'Novo Webhook'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nome" className="text-right">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo" className="text-right">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposWebhook.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url_teste" className="text-right">URL Teste</Label>
                  <Input
                    id="url_teste"
                    value={formData.url_teste}
                    onChange={(e) => setFormData({...formData, url_teste: e.target.value})}
                    className="col-span-3"
                    placeholder="https://webhook-test.com/endpoint"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url_producao" className="text-right">URL Produção</Label>
                  <Input
                    id="url_producao"
                    value={formData.url_producao}
                    onChange={(e) => setFormData({...formData, url_producao: e.target.value})}
                    className="col-span-3"
                    placeholder="https://api.escola.com/webhooks/endpoint"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="modo_producao" className="text-right">Modo Produção</Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="modo_producao"
                      checked={formData.modo_producao}
                      onCheckedChange={(checked) => setFormData({...formData, modo_producao: checked})}
                    />
                    <Label htmlFor="modo_producao" className="text-sm text-muted-foreground">
                      {formData.modo_producao ? 'Usar URL de produção' : 'Usar URL de teste'}
                    </Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ativo" className="text-right">Ativo</Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                    />
                    <Label htmlFor="ativo" className="text-sm text-muted-foreground">
                      Webhook {formData.ativo ? 'ativo' : 'inativo'}
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveWebhook}>
                  {editingWebhook ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total de Webhooks</p>
                  <p className="text-2xl font-bold">{webhooks.length}</p>
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
                  <p className="text-2xl font-bold">{activeWebhooks}</p>
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
                  <p className="text-2xl font-bold">{errorWebhooks}</p>
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
              {webhooks.length === 0 ? (
                <div className="text-center py-8">
                  <Webhook className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">Nenhum webhook configurado ainda.</p>
                  <p className="text-white/40 text-sm">Clique em "Novo Webhook" para começar.</p>
                </div>
              ) : (
                webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-white">{webhook.nome}</h3>
                        <Badge variant="outline" className="text-xs text-white/70 border-white/30">
                          {tiposWebhook.find(t => t.value === webhook.tipo)?.label || webhook.tipo}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/70 mb-1">
                        {webhook.modo_producao ? webhook.url_producao : webhook.url_teste}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span>Disparos: {webhook.total_disparos}</span>
                        <span>Modo: {webhook.modo_producao ? 'Produção' : 'Teste'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-white/80">Último disparo</p>
                        <p className="text-xs text-white/60">{formatLastTrigger(webhook.ultimo_disparo)}</p>
                      </div>
                      {getStatusBadge(webhook)}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleWebhookStatus(webhook)}
                          className="h-8 w-8 p-0"
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(webhook)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteWebhook(webhook.id)}
                          className="h-8 w-8 p-0 hover:bg-red-500/20 hover:border-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </LaunsLayout>
  );
}