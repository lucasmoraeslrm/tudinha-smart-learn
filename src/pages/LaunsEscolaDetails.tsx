import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useSchools } from '@/hooks/useSchools';
import { supabase } from '@/integrations/supabase/client';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('overview');
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalStudents: 0,
    totalInteractions: 0,
    correctAnswersPercentage: 0,
    loading: true
  });

  useEffect(() => {
    if (schools.length > 0 && id) {
      const foundSchool = schools.find(s => s.id === id);
      if (foundSchool) {
        setSchool(foundSchool);
        fetchDashboardMetrics();
      }
    }
  }, [schools, id]);

  const fetchDashboardMetrics = async () => {
    try {
      setDashboardMetrics(prev => ({ ...prev, loading: true }));

      // Buscar total de alunos ativos
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('escola_id', id);

      if (studentsError) throw studentsError;

      // Buscar total de interações com admin chat
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('admin_chat_logs')
        .select('id')
        .in('student_id', studentsData?.map(s => s.id) || []);

      if (interactionsError) throw interactionsError;

      // Buscar taxa de acertos dos exercícios
      const { data: answersData, error: answersError } = await supabase
        .from('student_answers')
        .select('is_correct')
        .in('student_id', studentsData?.map(s => s.id) || []);

      if (answersError) throw answersError;

      const totalAnswers = answersData?.length || 0;
      const correctAnswers = answersData?.filter(a => a.is_correct).length || 0;
      const correctPercentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      setDashboardMetrics({
        totalStudents: studentsData?.length || 0,
        totalInteractions: interactionsData?.length || 0,
        correctAnswersPercentage: correctPercentage,
        loading: false
      });

    } catch (error) {
      console.error('Erro ao buscar métricas do dashboard:', error);
      setDashboardMetrics({
        totalStudents: 0,
        totalInteractions: 0,
        correctAnswersPercentage: 0,
        loading: false
      });
    }
  };

  // Sincroniza a seção ativa com a URL (?tab=...)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeSection) {
      setActiveSection(tab);
    }
  }, [searchParams]);

  const setSection = (section: string) => {
    setActiveSection(section);
    const params = new URLSearchParams(searchParams);
    params.set('tab', section);
    setSearchParams(params);
  };

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
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start gap-6 mb-6">
              {/* Logo Section */}
              <div className="flex-shrink-0">
                {school.logo_url ? (
                  <img 
                    src={school.logo_url} 
                    alt={`Logo da ${school.nome}`}
                    className="w-20 h-20 object-contain rounded-lg border border-border/50"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center border border-border/50">
                    <span className="text-2xl font-bold text-primary">
                      {school.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Header Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground mb-2">{school.nome}</h2>
                <div className="flex items-center gap-4 mb-4">
                  <Badge 
                    variant={school.ativa ? "default" : "secondary"}
                    className={school.ativa ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : "bg-gray-100 text-gray-800"}
                  >
                    {school.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    Cadastrada em {new Date(school.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
                  Informações Básicas
                </h3>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código:</label>
                  <p className="text-base font-mono text-foreground bg-muted/30 px-2 py-1 rounded mt-1">
                    {school.codigo}
                  </p>
                </div>
                
                {school.dominio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">URL/Domínio:</label>
                    <p className="text-base text-foreground break-all">
                      <a 
                        href={`https://${school.dominio}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {school.dominio}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
                  Contato
                </h3>
                
                {school.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-mail:</label>
                    <p className="text-base text-foreground">
                      <a href={`mailto:${school.email}`} className="text-primary hover:underline">
                        {school.email}
                      </a>
                    </p>
                  </div>
                )}
                
                {school.telefone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone:</label>
                    <p className="text-base text-foreground">{school.telefone}</p>
                  </div>
                )}
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
                  Localização
                </h3>
                
                {(school.cidade || school.uf) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cidade/Estado:</label>
                    <p className="text-base text-foreground">
                      {[school.cidade, school.uf].filter(Boolean).join(' / ')}
                    </p>
                  </div>
                )}
                
                {school.endereco && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Endereço:</label>
                    <p className="text-base text-foreground">
                      {school.endereco}
                      {school.numero && `, ${school.numero}`}
                      {school.complemento && `, ${school.complemento}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => setSection('overview')}
                className={activeSection === 'overview' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent'}
              >
                <Activity className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              
              <Button 
                onClick={() => navigate(`/launs/escolas/editar/${school.id}`)}
                className="border border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              
              <Button 
                onClick={() => navigate(`/launs/escolas/config/${school.id}`)}
                className="border border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              
              <Button 
                onClick={() => setSection('coordenadores')}
                className={activeSection === 'coordenadores' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent'}
              >
                <Shield className="w-4 h-4 mr-2" />
                Direção
              </Button>
              
              <Button 
                onClick={() => setSection('materias')}
                className={activeSection === 'materias' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent'}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Matérias
              </Button>
              
              <Button 
                onClick={() => setSection('turmas')}
                className={activeSection === 'turmas' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent'}
              >
                <Users className="w-4 h-4 mr-2" />
                Turmas
              </Button>
              
              <Button 
                onClick={() => setSection('professores')}
                className={activeSection === 'professores' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent'}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Professores
              </Button>
              
              <Button 
                onClick={() => setSection('alunos')}
                className={activeSection === 'alunos' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent'}
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Alunos
              </Button>
              
              <Button 
                onClick={() => setSection('tutores')}
                className={activeSection === 'tutores' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent'}
              >
                <Shield className="w-4 h-4 mr-2" />
                Responsável do Aluno
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Content Based on Active Section */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total de Alunos Ativos */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Alunos Ativos</p>
                    {dashboardMetrics.loading ? (
                      <div className="w-12 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{dashboardMetrics.totalStudents}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">cadastrados na escola</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total de Interações com Tudinha */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Interações com Tudinha</p>
                    {dashboardMetrics.loading ? (
                      <div className="w-16 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{dashboardMetrics.totalInteractions.toLocaleString()}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">interações registradas</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* % Exercícios Acertados */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Acertos</p>
                    {dashboardMetrics.loading ? (
                      <div className="w-12 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{dashboardMetrics.correctAnswersPercentage}%</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">dos exercícios respondidos</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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