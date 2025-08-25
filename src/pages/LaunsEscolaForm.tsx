import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchools } from '@/hooks/useSchools';
import { ArrowLeft, Save } from 'lucide-react';

export default function LaunsEscolaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { schools, createSchool, updateSchool } = useSchools();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    dominio: '',
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
      }
    }
  }, [isEditing, id, schools]);

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

  return (
    <LaunsLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/launs/escolas')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditing ? 'Editar Escola' : 'Nova Escola'}
          </h1>
          <p className="text-white/80">
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
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="contact">Contato & Endereço</TabsTrigger>
                <TabsTrigger value="branding">Visual</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="dominio">Domínio (Opcional)</Label>
                    <Input
                      id="dominio"
                      value={formData.dominio}
                      onChange={(e) => handleInputChange('dominio', e.target.value)}
                      placeholder="Ex: colegiosojose.com.br"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
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
                <div className="grid grid-cols-3 gap-4">
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
              </TabsContent>
              
              <TabsContent value="branding" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
              </TabsContent>
              
              <div className="flex justify-end gap-4 pt-6">
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
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </LaunsLayout>
  );
}