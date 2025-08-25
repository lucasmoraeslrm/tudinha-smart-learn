import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchools } from '@/hooks/useSchools';
import SchoolStudentsCRUD from '@/components/SchoolStudentsCRUD';
import SchoolProfessorsCRUD from '@/components/SchoolProfessorsCRUD';
import SchoolCoordinatorsCRUD from '@/components/SchoolCoordinatorsCRUD';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  UserPlus, 
  GraduationCap,
  Settings,
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  Palette,
  Shield,
  UserCheck
} from 'lucide-react';

export default function LaunsEscolaDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { schools, loading } = useSchools();
  const [school, setSchool] = useState(null);

  useEffect(() => {
    if (schools.length > 0 && id) {
      const foundSchool = schools.find(s => s.id === id);
      setSchool(foundSchool || null);
    }
  }, [schools, id]);

  if (loading) {
    return (
      <LaunsLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dados da escola...</p>
            </div>
          </div>
        </div>
      </LaunsLayout>
    );
  }

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
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">{school.nome}</h1>
                <Badge variant={school.ativa ? "default" : "secondary"} 
                       className={school.ativa ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                  {school.ativa ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {school.nome_fantasia && `${school.nome_fantasia} • `}
                Código: {school.codigo}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => navigate(`/launs/escolas/editar/${school.id}`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Escola
              </Button>
              <Button 
                onClick={() => navigate(`/launs/escolas/config/${school.id}`)}
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Usuários
            </TabsTrigger>
            <TabsTrigger value="access" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Acessos
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Configurações
            </TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Módulos
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome da Escola</label>
                    <p className="text-sm">{school.nome}</p>
                  </div>
                  {school.nome_fantasia && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome Fantasia</label>
                      <p className="text-sm">{school.nome_fantasia}</p>
                    </div>
                  )}
                  {school.razao_social && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Razão Social</label>
                      <p className="text-sm">{school.razao_social}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Código</label>
                    <p className="text-sm font-mono">{school.codigo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plano</label>
                    <p className="text-sm capitalize">{school.plano}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {school.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{school.email}</span>
                    </div>
                  )}
                  {school.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{school.telefone}</span>
                    </div>
                  )}
                  {school.celular && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{school.celular}</span>
                    </div>
                  )}
                  {school.dominio && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{school.dominio}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Endereço */}
              {(school.endereco || school.cidade || school.uf) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Endereço
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      {school.endereco && (
                        <p>{school.endereco}{school.numero && `, ${school.numero}`}</p>
                      )}
                      {school.complemento && <p>{school.complemento}</p>}
                      {school.bairro && <p>{school.bairro}</p>}
                      {(school.cidade || school.uf) && (
                        <p>
                          {school.cidade}{school.uf && `, ${school.uf}`}
                          {school.cep && ` - ${school.cep}`}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Visual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Identidade Visual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cor Primária</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-6 h-6 rounded border border-border"
                          style={{ backgroundColor: school.cor_primaria }}
                        />
                        <span className="text-sm font-mono">{school.cor_primaria}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cor Secundária</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-6 h-6 rounded border border-border"
                          style={{ backgroundColor: school.cor_secundaria }}
                        />
                        <span className="text-sm font-mono">{school.cor_secundaria}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              <SchoolStudentsCRUD schoolId={school.id} />
              <SchoolProfessorsCRUD schoolId={school.id} />
              <SchoolCoordinatorsCRUD schoolId={school.id} />
            </div>
          </TabsContent>

          {/* Acessos */}
          <TabsContent value="access" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Controle de Acessos
                </CardTitle>
                <CardDescription>
                  Configure permissões e acessos para diferentes tipos de usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Sistema de controle de acessos em desenvolvimento
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Esta funcionalidade permitirá configurar permissões específicas para cada tipo de usuário
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="config" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações da Escola
                </CardTitle>
                <CardDescription>
                  Configure parâmetros específicos da escola
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Painel de configurações em desenvolvimento
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aqui você poderá configurar parâmetros específicos como horários, períodos letivos, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Módulos */}
          <TabsContent value="modules" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Módulos da Escola
                </CardTitle>
                <CardDescription>
                  Configure quais módulos estão ativos para esta escola
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Configuração de módulos em desenvolvimento
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aqui você poderá ativar/desativar módulos específicos para a escola
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LaunsLayout>
  );
}