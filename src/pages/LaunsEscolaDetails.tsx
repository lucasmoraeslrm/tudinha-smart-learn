import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useSchools } from '@/hooks/useSchools';
import SchoolStudentsCRUD from '@/components/SchoolStudentsCRUD';
import SchoolProfessorsCRUD from '@/components/SchoolProfessorsCRUD';
import SchoolMateriasCRUD from '@/components/SchoolMateriasCRUD';
import SchoolTurmasCRUD from '@/components/SchoolTurmasCRUD';
import SchoolTutoresCRUD from '@/components/SchoolTutoresCRUD';
import SchoolCoordinatorsCRUD from '@/components/SchoolCoordinatorsCRUD';
import { 
  ArrowLeft, 
  Edit, 
  Settings,
  Users,
  GraduationCap,
  UserPlus,
  BookOpen,
  Shield,
  Activity
} from 'lucide-react';

export default function LaunsEscolaDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { schools, loading } = useSchools();
  const [school, setSchool] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

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
      <div className="p-6 max-w-7xl mx-auto bg-background min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/launs/escolas')}
                className="text-foreground hover:bg-accent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/launs/escolas">Escolas</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Detalhes</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">DETALHES DA ESCOLA</h1>
        </div>

        {/* School Information Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome da Escola:</label>
                  <p className="text-base font-medium text-foreground">{school.nome}</p>
                </div>
                
                {school.razao_social && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Razão Social:</label>
                    <p className="text-base text-foreground">{school.razao_social}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código:</label>
                  <p className="text-base font-mono text-foreground">{school.codigo}</p>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-4">
                {school.nome_fantasia && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome Fantasia:</label>
                    <p className="text-base text-foreground">{school.nome_fantasia}</p>
                  </div>
                )}
                
                {school.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-mail:</label>
                    <p className="text-base text-foreground">{school.email}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plano:</label>
                  <p className="text-base capitalize text-foreground">{school.plano}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status:</label>
                  <div className="mt-1">
                    <Badge 
                      variant={school.ativa ? "default" : "secondary"}
                      className={school.ativa ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-gray-100 text-gray-800"}
                    >
                      {school.ativa ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Situação:</label>
                  <div className="mt-1">
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                      Confiável
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data Cadastro:</label>
                  <p className="text-base text-foreground">
                    {new Date(school.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => navigate(`/launs/escolas/editar/${school.id}`)}
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-600 hover:bg-slate-50"
                onClick={() => setActiveSection('professores')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Professores
              </Button>
              
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-600 hover:bg-slate-50"
                onClick={() => setActiveSection('turmas')}
              >
                <Users className="w-4 h-4 mr-2" />
                Turmas
              </Button>
              
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-600 hover:bg-slate-50"
                onClick={() => setActiveSection('alunos')}
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Alunos
              </Button>
              
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-600 hover:bg-slate-50"
                onClick={() => setActiveSection('materias')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Matérias
              </Button>
              
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-600 hover:bg-slate-50"
                onClick={() => navigate(`/launs/escolas/config/${school.id}`)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-600 hover:bg-slate-50"
                onClick={() => setActiveSection('tutores')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Tutores
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Management Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => setActiveSection('overview')}
                variant={activeSection === 'overview' ? 'default' : 'outline'}
                className={activeSection === 'overview' ? '' : 'border-primary text-primary hover:bg-primary/10'}
              >
                <Activity className="w-4 h-4 mr-2" />
                Visão Geral
              </Button>
              
              <Button 
                onClick={() => setActiveSection('coordenadores')}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Users className="w-4 h-4 mr-2" />
                Coordenadores
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Content Based on Active Section */}
        {activeSection === 'overview' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Logs da Escola</h3>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p>Sistema de logs em desenvolvimento</p>
                <p className="text-sm">Aqui serão exibidos os logs de atividade da escola</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'materias' && (
          <Card>
            <CardContent className="p-6">
              <SchoolMateriasCRUD schoolId={school.id} />
            </CardContent>
          </Card>
        )}

        {activeSection === 'turmas' && (
          <Card>
            <CardContent className="p-6">
              <SchoolTurmasCRUD schoolId={school.id} />
            </CardContent>
          </Card>
        )}

        {activeSection === 'alunos' && (
          <Card>
            <CardContent className="p-6">
              <SchoolStudentsCRUD schoolId={school.id} />
            </CardContent>
          </Card>
        )}

        {activeSection === 'professores' && (
          <Card>
            <CardContent className="p-6">
              <SchoolProfessorsCRUD schoolId={school.id} />
            </CardContent>
          </Card>
        )}

        {activeSection === 'tutores' && (
          <Card>
            <CardContent className="p-6">
              <SchoolTutoresCRUD schoolId={school.id} />
            </CardContent>
          </Card>
        )}

        {activeSection === 'coordenadores' && (
          <Card>
            <CardContent className="p-6">
              <SchoolCoordinatorsCRUD schoolId={school.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </LaunsLayout>
  );
}