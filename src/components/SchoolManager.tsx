import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { School, useSchools, SchoolModule } from '@/hooks/useSchools';
import { 
  Plus, 
  School as SchoolIcon, 
  Settings, 
  Users, 
  Palette,
  Globe,
  Edit,
  Eye
} from 'lucide-react';

interface SchoolManagerProps {
  onViewUsers: (school: School) => void;
}

export default function SchoolManager({ onViewUsers }: SchoolManagerProps) {
  const { schools, modules, loading, createSchool, updateSchool, fetchSchoolModules, toggleSchoolModule } = useSchools();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolModules, setSchoolModules] = useState<SchoolModule[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [newSchool, setNewSchool] = useState({
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

  const handleCreateSchool = async () => {
    try {
      await createSchool({
        ...newSchool,
        ativa: true
      });
      setNewSchool({
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
      setShowCreateDialog(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleViewSchool = async (school: School) => {
    setSelectedSchool(school);
    const modules = await fetchSchoolModules(school.id);
    setSchoolModules(modules);
  };

  const handleModuleToggle = async (moduleId: string, ativo: boolean) => {
    if (!selectedSchool) return;
    
    await toggleSchoolModule(selectedSchool.id, moduleId, ativo);
    
    // Atualizar estado local
    setSchoolModules(prev => 
      prev.map(sm => 
        sm.modulo_id === moduleId ? { ...sm, ativo } : sm
      )
    );
  };

  const handleUpdateSchool = async () => {
    if (!selectedSchool) return;
    
    try {
      await updateSchool(selectedSchool.id, selectedSchool);
      setShowEditDialog(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando escolas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Escolas</h2>
          <p className="text-muted-foreground">Controle todas as escolas cadastradas no sistema</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Escola
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Escola</DialogTitle>
              <DialogDescription>
                Adicione uma nova escola ao sistema SAAS
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="mt-4">
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
                      value={newSchool.nome}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Colégio São José"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                    <Input
                      id="nome_fantasia"
                      value={newSchool.nome_fantasia}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                      placeholder="Ex: São José"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razao_social">Razão Social</Label>
                  <Input
                    id="razao_social"
                    value={newSchool.razao_social}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, razao_social: e.target.value }))}
                    placeholder="Ex: Colégio São José LTDA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código Único *</Label>
                  <Input
                    id="codigo"
                    value={newSchool.codigo}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Ex: sao-jose"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dominio">Domínio (Opcional)</Label>
                  <Input
                    id="dominio"
                    value={newSchool.dominio}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, dominio: e.target.value }))}
                    placeholder="Ex: colegiosojose.com.br"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={newSchool.telefone}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="Ex: (11) 3456-7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      value={newSchool.celular}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, celular: e.target.value }))}
                      placeholder="Ex: (11) 99999-9999"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSchool.email}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Ex: contato@colegiosojose.com.br"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={newSchool.endereco}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, endereco: e.target.value }))}
                      placeholder="Ex: Rua das Flores"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={newSchool.numero}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, numero: e.target.value }))}
                      placeholder="Ex: 123"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={newSchool.complemento}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, complemento: e.target.value }))}
                    placeholder="Ex: Sala 101"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={newSchool.bairro}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, bairro: e.target.value }))}
                      placeholder="Ex: Centro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={newSchool.cidade}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, cidade: e.target.value }))}
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uf">UF</Label>
                    <Input
                      id="uf"
                      value={newSchool.uf}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, uf: e.target.value }))}
                      placeholder="Ex: SP"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={newSchool.cep}
                    onChange={(e) => setNewSchool(prev => ({ ...prev, cep: e.target.value }))}
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
                      value={newSchool.cor_primaria}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, cor_primaria: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cor_secundaria">Cor Secundária</Label>
                    <Input
                      id="cor_secundaria"
                      type="color"
                      value={newSchool.cor_secundaria}
                      onChange={(e) => setNewSchool(prev => ({ ...prev, cor_secundaria: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <div className="flex justify-end pt-4">
                <Button onClick={handleCreateSchool} className="w-full">
                  Criar Escola
                </Button>
              </div>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {schools.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <SchoolIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma escola cadastrada</h3>
          <p className="text-muted-foreground mb-6">Comece criando sua primeira escola no sistema SAAS</p>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar primeira escola
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {schools.map((school) => (
            <Card key={school.id} className="border shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SchoolIcon className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg text-foreground font-semibold">{school.nome}</CardTitle>
                  </div>
                  <Badge variant={school.ativa ? "default" : "secondary"} 
                         className={school.ativa ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                    {school.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <CardDescription className="text-muted-foreground">
                  Código: {school.codigo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{school.dominio || "Sem domínio personalizado"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <div className="flex gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: school.cor_primaria }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: school.cor_secundaria }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">Cores da marca</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewSchool(school)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewUsers(school)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Usuários
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedSchool(school);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de visualização da escola */}
      <Dialog open={!!selectedSchool && !showEditDialog} onOpenChange={() => setSelectedSchool(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSchool?.nome}</DialogTitle>
            <DialogDescription>
              Configurações e módulos da escola
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="modules" className="mt-4">
            <TabsList>
              <TabsTrigger value="modules">Módulos</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="modules" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {schoolModules.map((schoolModule) => (
                  <div key={schoolModule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{schoolModule.modulos.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {schoolModule.modulos.descricao}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={schoolModule.ativo}
                      onCheckedChange={(checked) => 
                        handleModuleToggle(schoolModule.modulo_id, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Domínio</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSchool?.dominio || "Nenhum domínio configurado"}
                  </p>
                </div>
                <div>
                  <Label>Plano</Label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedSchool?.plano}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Escola</DialogTitle>
            <DialogDescription>
              Atualize as informações da escola
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="contact">Contato & Endereço</TabsTrigger>
                <TabsTrigger value="branding">Visual</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nome">Nome da Escola *</Label>
                    <Input
                      id="edit-nome"
                      value={selectedSchool.nome}
                      onChange={(e) => setSelectedSchool(prev => 
                        prev ? { ...prev, nome: e.target.value } : null
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nome-fantasia">Nome Fantasia</Label>
                    <Input
                      id="edit-nome-fantasia"
                      value={selectedSchool.nome_fantasia || ''}
                      onChange={(e) => setSelectedSchool(prev => 
                        prev ? { ...prev, nome_fantasia: e.target.value } : null
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-razao-social">Razão Social</Label>
                  <Input
                    id="edit-razao-social"
                    value={selectedSchool.razao_social || ''}
                    onChange={(e) => setSelectedSchool(prev => 
                      prev ? { ...prev, razao_social: e.target.value } : null
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dominio">Domínio</Label>
                  <Input
                    id="edit-dominio"
                    value={selectedSchool.dominio || ''}
                    onChange={(e) => setSelectedSchool(prev => 
                      prev ? { ...prev, dominio: e.target.value } : null
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-telefone">Telefone</Label>
                    <Input
                      id="edit-telefone"
                      value={selectedSchool.telefone || ''}
                      onChange={(e) => setSelectedSchool(prev => 
                        prev ? { ...prev, telefone: e.target.value } : null
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-celular">Celular</Label>
                    <Input
                      id="edit-celular"
                      value={selectedSchool.celular || ''}
                      onChange={(e) => setSelectedSchool(prev => 
                        prev ? { ...prev, celular: e.target.value } : null
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedSchool.email || ''}
                    onChange={(e) => setSelectedSchool(prev => 
                      prev ? { ...prev, email: e.target.value } : null
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="edit-endereco">Endereço</Label>
                    <Input
                      id="edit-endereco"
                      value={selectedSchool.endereco || ''}
                      onChange={(e) => setSelectedSchool(prev => 
                        prev ? { ...prev, endereco: e.target.value } : null
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-numero">Número</Label>
                    <Input
                      id="edit-numero"
                      value={selectedSchool.numero || ''}
                      onChange={(e) => setSelectedSchool(prev => 
                        prev ? { ...prev, numero: e.target.value } : null
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-complemento">Complemento</Label>
                  <Input
                    id="edit-complemento"
                    value={selectedSchool.complemento || ''}
                    onChange={(e) => setSelectedSchool(prev => 
                      prev ? { ...prev, complemento: e.target.value } : null
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-bairro">Bairro</Label>
                    <Input
                      id="edit-bairro"
                      value={selectedSchool.bairro || ''}
                      onChange={(e) => setSelectedSchool(prev => 
                        prev ? { ...prev, bairro: e.target.value } : null
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cidade">Cidade</Label>
                    <Input
                      id="edit-cidade"
                      value={selectedSchool.cidade || ''}
                      onChange={(e) => setSelectedSchool(prev => 
                        prev ? { ...prev, cidade: e.target.value } : null
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-uf">UF</Label>
                    <Input
                      id="edit-uf"
                      value={selectedSchool.uf || ''}
                      onChange={(e) => setSelectedSchool(prev => 
                        prev ? { ...prev, uf: e.target.value } : null
                      )}
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cep">CEP</Label>
                  <Input
                    id="edit-cep"
                    value={selectedSchool.cep || ''}
                    onChange={(e) => setSelectedSchool(prev => 
                      prev ? { ...prev, cep: e.target.value } : null
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="branding" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-cor-primaria">Cor Primária</Label>
                    <Input
                      id="edit-cor-primaria"
                      type="color"
                      value={selectedSchool.cor_primaria}
                      onChange={(e) => setSelectedSchool(prev => 
                        prev ? { ...prev, cor_primaria: e.target.value } : null
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cor-secundaria">Cor Secundária</Label>
                    <Input
                      id="edit-cor-secundaria"
                      type="color"
                      value={selectedSchool.cor_secundaria}
                      onChange={(e) => setSelectedSchool(prev => 
                        prev ? { ...prev, cor_secundaria: e.target.value } : null
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <div className="flex justify-end pt-4">
                <Button onClick={handleUpdateSchool} className="w-full">
                  Salvar Alterações
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}