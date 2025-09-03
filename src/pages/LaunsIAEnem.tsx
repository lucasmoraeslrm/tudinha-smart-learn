import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Key, Settings, School, Save, RefreshCw } from 'lucide-react';

interface AIEnemConfig {
  id: string;
  escola_id: string;
  prompt_correcao: string;
  modelo_openai: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  escolas?: {
    id: string;
    nome: string;
    codigo: string;
  };
}

const openaiModels = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Rápido e Econômico)' },
  { value: 'gpt-4o', label: 'GPT-4o (Padrão)' },
  { value: 'gpt-4.1-2025-04-14', label: 'GPT-4.1 (Confiável)' },
  { value: 'gpt-5-mini-2025-08-07', label: 'GPT-5 Mini (Eficiente)' },
  { value: 'gpt-5-2025-08-07', label: 'GPT-5 (Melhor Performance)' }
];

export default function LaunsIAEnem() {
  const [configs, setConfigs] = useState<AIEnemConfig[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'configured' | 'missing'>('checking');
  
  // Form states
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultPrompt = `Analise esta redação seguindo os critérios do ENEM:

Competência I (0-200): Demonstrar domínio da modalidade escrita formal da língua portuguesa.
Competência II (0-200): Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento para desenvolver o tema.
Competência III (0-200): Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista.
Competência IV (0-200): Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.
Competência V (0-200): Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.

Para cada competência, avalie cuidadosamente e forneça uma nota de 0 a 200 e uma justificativa detalhada.`;

  useEffect(() => {
    checkApiKey();
    loadData();
  }, []);

  const checkApiKey = async () => {
    try {
      // Test if OpenAI API key is working by making a simple API call
      const response = await supabase.functions.invoke('enem-config', {
        method: 'GET'
      });
      
      if (response.error) {
        setApiKeyStatus('missing');
      } else {
        setApiKeyStatus('configured');
      }
    } catch (error) {
      setApiKeyStatus('missing');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('escolas')
        .select('id, nome, codigo')
        .eq('ativa', true)
        .order('nome');

      if (schoolsError) {
        toast.error('Erro ao carregar escolas: ' + schoolsError.message);
        return;
      }

      setSchools(schoolsData || []);

      // Load configurations
      const { data: configsData, error: configsError } = await supabase.functions.invoke('enem-config');

      if (configsError) {
        toast.error('Erro ao carregar configurações: ' + configsError.message);
        return;
      }

      setConfigs(configsData.data || []);

    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSchool || !prompt || !model) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);

      const method = editingId ? 'PUT' : 'POST';
      const payload = editingId 
        ? { id: editingId, prompt_correcao: prompt, modelo_openai: model }
        : { escola_id: selectedSchool, prompt_correcao: prompt, modelo_openai: model };

      const { data, error } = await supabase.functions.invoke('enem-config', {
        method,
        body: payload
      });

      if (error) {
        toast.error('Erro ao salvar: ' + error.message);
        return;
      }

      toast.success(editingId ? 'Configuração atualizada!' : 'Configuração criada!');
      
      // Reset form
      setSelectedSchool('');
      setPrompt('');
      setModel('gpt-4o-mini');
      setEditingId(null);
      
      // Reload data
      loadData();

    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (config: AIEnemConfig) => {
    setSelectedSchool(config.escola_id);
    setPrompt(config.prompt_correcao);
    setModel(config.modelo_openai);
    setEditingId(config.id);
  };

  const handleToggleActive = async (config: AIEnemConfig) => {
    try {
      const { error } = await supabase.functions.invoke('enem-config', {
        method: 'PUT',
        body: { id: config.id, ativo: !config.ativo }
      });

      if (error) {
        toast.error('Erro ao atualizar status: ' + error.message);
        return;
      }

      toast.success('Status atualizado!');
      loadData();

    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  };

  const resetForm = () => {
    setSelectedSchool('');
    setPrompt('');
    setModel('gpt-4o-mini');
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">IA ENEM - Configuração</h1>
          <p className="text-muted-foreground">Configure a correção automática de redações usando OpenAI</p>
        </div>
      </div>

      {/* API Key Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Status da API OpenAI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant={apiKeyStatus === 'configured' ? 'default' : 'destructive'}>
              {apiKeyStatus === 'configured' ? 'Configurada' : 'Não Configurada'}
            </Badge>
            <Button variant="outline" size="sm" onClick={checkApiKey}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar
            </Button>
          </div>
          {apiKeyStatus === 'missing' && (
            <p className="text-sm text-muted-foreground mt-2">
              Configure a chave da API OpenAI nas configurações do Supabase.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {editingId ? 'Editar' : 'Nova'} Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school">Escola</Label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma escola" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.nome} ({school.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo OpenAI</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {openaiModels.map((modelOption) => (
                    <SelectItem key={modelOption.value} value={modelOption.value}>
                      {modelOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt">Prompt de Correção</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setPrompt(defaultPrompt)}
              >
                Usar Padrão
              </Button>
            </div>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Digite o prompt para correção das redações..."
              rows={8}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={saving || !selectedSchool || !prompt || !model}
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingId ? 'Atualizar' : 'Salvar'}
            </Button>
            
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Configurations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="w-5 h-5" />
            Configurações Existentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma configuração encontrada. Crie a primeira configuração acima.
            </p>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => (
                <div key={config.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{config.escolas?.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        Modelo: {config.modelo_openai}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.ativo}
                        onCheckedChange={() => handleToggleActive(config)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(config)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="line-clamp-2">{config.prompt_correcao}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
