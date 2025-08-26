import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSchools } from '@/hooks/useSchools';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Save, 
  Upload,
  Palette,
  Eye,
  Globe,
  Image
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function LaunsEscolaConfig() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { schools, updateSchool } = useSchools();
  const { toast } = useToast();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [configData, setConfigData] = useState({
    cor_primaria: '#3B82F6',
    cor_secundaria: '#1E40AF',
    cor_primaria_texto: '#FFFFFF',
    cor_secundaria_texto: '#FFFFFF',
    cor_primaria_bg: '#3B82F6',
    cor_secundaria_bg: '#1E40AF',
    logo_url: '',
    dominio: ''
  });

  useEffect(() => {
    if (schools.length > 0 && id) {
      const foundSchool = schools.find(s => s.id === id);
      if (foundSchool) {
        setSchool(foundSchool);
        setConfigData({
          cor_primaria: foundSchool.cor_primaria || '#3B82F6',
          cor_secundaria: foundSchool.cor_secundaria || '#1E40AF',
          cor_primaria_texto: foundSchool.cor_primaria_texto || '#FFFFFF',
          cor_secundaria_texto: foundSchool.cor_secundaria_texto || '#FFFFFF',
          cor_primaria_bg: foundSchool.cor_primaria_bg || foundSchool.cor_primaria || '#3B82F6',
          cor_secundaria_bg: foundSchool.cor_secundaria_bg || foundSchool.cor_secundaria || '#1E40AF',
          logo_url: foundSchool.logo_url || '',
          dominio: foundSchool.dominio || ''
        });
      }
    }
  }, [schools, id]);

  const handleInputChange = (field: string, value: string) => {
    setConfigData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${school?.codigo}-logo.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-uploads')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('chat-uploads')
        .getPublicUrl(filePath);

      setConfigData(prev => ({ ...prev, logo_url: data.publicUrl }));
      
      toast({
        title: "Logo enviado com sucesso",
        description: "O logo da escola foi atualizado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar logo",
        description: "Ocorreu um erro ao fazer upload do logo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      await updateSchool(id!, {
        cor_primaria: configData.cor_primaria_bg,
        cor_secundaria: configData.cor_secundaria_bg,
        logo_url: configData.logo_url,
        dominio: configData.dominio
      });

      toast({
        title: "Configurações salvas",
        description: "As configurações da escola foram atualizadas com sucesso.",
      });

      navigate(`/launs/escolas/detalhes/${id}`);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!school) {
    return (
      <LaunsLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-foreground mb-2">Escola não encontrada</h3>
            <p className="text-muted-foreground mb-6">A escola solicitada não foi encontrada ou não existe.</p>
            <Button 
              onClick={() => navigate('/launs/escolas')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Escolas
            </Button>
          </div>
        </div>
      </LaunsLayout>
    );
  }

  return (
    <LaunsLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/launs/escolas/detalhes/${id}`)}
              className="text-foreground hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Configurações Visuais</h1>
          </div>
          <p className="text-muted-foreground">
            Configure a identidade visual da escola {school.nome}
          </p>
        </div>

        <div className="space-y-6">
          {/* Logo da Escola */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Logo da Escola
              </CardTitle>
              <CardDescription>
                Faça upload do logo que será exibido na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {configData.logo_url && (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <img 
                    src={configData.logo_url} 
                    alt="Logo da escola" 
                    className="w-16 h-16 object-contain rounded"
                  />
                  <div>
                    <p className="text-sm font-medium">Logo atual</p>
                    <p className="text-xs text-muted-foreground">{configData.logo_url}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="logo">Novo Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground">Enviando logo...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Domínio de Acesso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                URL de Acesso
              </CardTitle>
              <CardDescription>
                Configure o domínio personalizado para acesso da escola
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="dominio">Domínio</Label>
                <Input
                  id="dominio"
                  value={configData.dominio}
                  onChange={(e) => handleInputChange('dominio', e.target.value)}
                  placeholder="Ex: escola.meudominio.com.br"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cores Primárias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Cores Primárias
              </CardTitle>
              <CardDescription>
                Configure as cores primárias da identidade visual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cor_primaria_bg">Background Primário</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cor_primaria_bg"
                      type="color"
                      value={configData.cor_primaria_bg}
                      onChange={(e) => handleInputChange('cor_primaria_bg', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={configData.cor_primaria_bg}
                      onChange={(e) => handleInputChange('cor_primaria_bg', e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cor_primaria_texto">Texto Primário</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cor_primaria_texto"
                      type="color"
                      value={configData.cor_primaria_texto}
                      onChange={(e) => handleInputChange('cor_primaria_texto', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={configData.cor_primaria_texto}
                      onChange={(e) => handleInputChange('cor_primaria_texto', e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview das cores primárias */}
              <div className="mt-4 p-4 rounded border">
                <Label className="text-sm font-medium mb-2 block">Preview:</Label>
                <div 
                  className="px-4 py-2 rounded text-center font-medium"
                  style={{ 
                    backgroundColor: configData.cor_primaria_bg,
                    color: configData.cor_primaria_texto 
                  }}
                >
                  Exemplo com cores primárias
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cores Secundárias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Cores Secundárias
              </CardTitle>
              <CardDescription>
                Configure as cores secundárias da identidade visual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cor_secundaria_bg">Background Secundário</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cor_secundaria_bg"
                      type="color"
                      value={configData.cor_secundaria_bg}
                      onChange={(e) => handleInputChange('cor_secundaria_bg', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={configData.cor_secundaria_bg}
                      onChange={(e) => handleInputChange('cor_secundaria_bg', e.target.value)}
                      placeholder="#1E40AF"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cor_secundaria_texto">Texto Secundário</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cor_secundaria_texto"
                      type="color"
                      value={configData.cor_secundaria_texto}
                      onChange={(e) => handleInputChange('cor_secundaria_texto', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      value={configData.cor_secundaria_texto}
                      onChange={(e) => handleInputChange('cor_secundaria_texto', e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview das cores secundárias */}
              <div className="mt-4 p-4 rounded border">
                <Label className="text-sm font-medium mb-2 block">Preview:</Label>
                <div 
                  className="px-4 py-2 rounded text-center font-medium"
                  style={{ 
                    backgroundColor: configData.cor_secundaria_bg,
                    color: configData.cor_secundaria_texto 
                  }}
                >
                  Exemplo com cores secundárias
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/launs/escolas/detalhes/${id}`)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </div>
      </div>
    </LaunsLayout>
  );
}