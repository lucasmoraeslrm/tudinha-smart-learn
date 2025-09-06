import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { useSchools } from '@/hooks/useSchools';
import { ArrowLeft, Save } from 'lucide-react';

export default function LaunsEscolaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { schools, modules, createSchool, updateSchool, fetchSchoolModules, toggleSchoolModule } = useSchools();
  const isEditing = !!id;
  
  const [schoolModules, setSchoolModules] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    dominio: '',
    instancia: '',
    logo_url: '',
    login_image_url: '',
    cor_primaria: '#3B82F6',
    cor_secundaria: '#1E40AF',
    plano: 'basico',
    nome_fantasia: '',
    razao_social: '',
    telefone: '',
    celular: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    email: ''
  });

  useEffect(() => {
    if (isEditing && schools.length > 0) {
      const school = schools.find(s => s.id === id);
      if (school) {
        setFormData({
          nome: school.nome || '',
          codigo: school.codigo || '',
          dominio: school.dominio || '',
          instancia: school.instancia || '',
          logo_url: school.logo_url || '',
          login_image_url: school.login_image_url || '',
          cor_primaria: school.cor_primaria || '#3B82F6',
          cor_secundaria: school.cor_secundaria || '#1E40AF',
          plano: school.plano || 'basico',
          nome_fantasia: school.nome_fantasia || '',
          razao_social: school.razao_social || '',
          telefone: school.telefone || '',
          celular: school.celular || '',
          endereco: school.endereco || '',
          numero: school.numero || '',
          complemento: school.complemento || '',
          bairro: school.bairro || '',
          cidade: school.cidade || '',
          uf: school.uf || '',
          cep: school.cep || '',
          email: school.email || ''
        });
        
        // Fetch school modules
        loadSchoolModules(school.id);
      }
    }
  }, [isEditing, id, schools]);

  const loadSchoolModules = async (schoolId: string) => {
    try {
      const modules = await fetchSchoolModules(schoolId);
      setSchoolModules(modules);
    } catch (error) {
      console.error('Error loading school modules:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateSchool(id!, formData);
      } else {
        await createSchool({
          ...formData,
          ativa: true
        });
      }
      navigate('/launs/escolas');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModuleToggle = async (moduleId: string, active: boolean) => {
    if (!id) return;
    
    try {
      await toggleSchoolModule(id, moduleId, active);
      // Reload school modules
      await loadSchoolModules(id);
    } catch (error) {
      console.error('Error toggling module:', error);
    }
  };

  return (
    <LaunsLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/launs/escolas')}
              className="text-foreground hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isEditing ? 'Editar Escola' : 'Nova Escola'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações da escola' : 'Cadastre uma nova escola na plataforma'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Editar Informações da Escola' : 'Cadastrar Nova Escola'}
            </CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Informações Básicas</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Escola *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Ex: Colégio São José"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                  <Input
                    id="nome_fantasia"
                    value={formData.nome_fantasia}
                    onChange={(e) => handleInputChange('nome_fantasia', e.target.value)}
                    placeholder="Ex: São José"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input
                  id="razao_social"
                  value={formData.razao_social}
                  onChange={(e) => handleInputChange('razao_social', e.target.value)}
                  placeholder="Ex: Colégio São José LTDA"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código Único *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    placeholder="Ex: sao-jose"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instancia">Instância (Slug) *</Label>
                  <Input
                    id="instancia"
                    value={formData.instancia}
                    onChange={(e) => handleInputChange('instancia', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="Ex: colegiosaojose"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL de acesso: www.exemplo.com.br/<span className="font-semibold">{formData.instancia || 'instancia'}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dominio">Domínio Personalizado (Opcional)</Label>
                <Input
                  id="dominio"
                  value={formData.dominio}
                  onChange={(e) => handleInputChange('dominio', e.target.value)}
                  placeholder="Ex: colegiosojose.com.br"
                />
                <p className="text-xs text-muted-foreground">
                  Se configurado, permitirá acesso direto via domínio personalizado
                </p>
              </div>
            </div>

            {/* Branding Visual */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Branding Visual</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL do Logo</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    placeholder="https://exemplo.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL da imagem do logo da escola
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login_image_url">Imagem de Fundo do Login</Label>
                  <Input
                    id="login_image_url"
                    value={formData.login_image_url}
                    onChange={(e) => handleInputChange('login_image_url', e.target.value)}
                    placeholder="https://exemplo.com/login-bg.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL da imagem que aparecerá no lado esquerdo da tela de login
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cor_primaria">Cor Primária</Label>
                  <Input
                    id="cor_primaria"
                    type="color"
                    value={formData.cor_primaria}
                    onChange={(e) => handleInputChange('cor_primaria', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cor_secundaria">Cor Secundária</Label>
                  <Input
                    id="cor_secundaria"
                    type="color"
                    value={formData.cor_secundaria}
                    onChange={(e) => handleInputChange('cor_secundaria', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Contato & Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Contato & Endereço</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="Ex: (11) 3456-7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.celular}
                    onChange={(e) => handleInputChange('celular', e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Ex: contato@colegiosojose.com.br"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    placeholder="Ex: Rua das Flores"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    placeholder="Ex: 123"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                  placeholder="Ex: Sala 101"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    placeholder="Ex: Centro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    value={formData.uf}
                    onChange={(e) => handleInputChange('uf', e.target.value)}
                    placeholder="Ex: SP"
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  placeholder="Ex: 01234-567"
                />
              </div>
            </div>

            {/* Módulos da Escola - Only show when editing */}
            {isEditing && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Módulos da Escola</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione quais módulos estarão disponíveis para os estudantes desta escola
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.map((module) => {
                    const schoolModule = schoolModules.find(sm => sm.modulo_id === module.id);
                    const isActive = schoolModule?.ativo || false;
                    
                    return (
                      <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {module.icone && (
                            <div className="w-8 h-8 flex items-center justify-center text-lg">
                              {module.icone}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{module.nome}</div>
                            <div className="text-sm text-muted-foreground">{module.codigo}</div>
                            {module.descricao && (
                              <div className="text-xs text-muted-foreground mt-1">{module.descricao}</div>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) => handleModuleToggle(module.id, checked)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => navigate('/launs/escolas')}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Salvar Alterações' : 'Criar Escola'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </LaunsLayout>
  );
}