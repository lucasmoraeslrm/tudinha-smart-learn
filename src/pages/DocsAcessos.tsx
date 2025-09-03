import React from 'react';
import { ArrowLeft, FileText, Users, Key, Shield, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

export default function DocsAcessos() {
  const navigate = useNavigate();

  const accessProfiles = [
    {
      title: "Público (sem login)",
      route: "/",
      icon: FileText,
      description: "Hub de acesso com abas para diferentes perfis",
      color: "bg-slate-100 text-slate-800",
      features: ["Formulários de login por perfil", "Tela inicial de navegação"]
    },
    {
      title: "Launs Admin (admin global)",
      route: "/launs/*",
      icon: Shield,
      description: "Administração global da plataforma",
      color: "bg-purple-100 text-purple-800",
      features: [
        "Gerenciamento de escolas",
        "Catálogo global de exercícios", 
        "Status do sistema",
        "Webhooks",
        "Usuários globais"
      ]
    },
    {
      title: "Direção/Coordenação da Escola",
      route: "/admin/*",
      icon: Users,
      description: "Administração escolar (school_admin/coordinator)",
      color: "bg-blue-100 text-blue-800",
      features: [
        "Gestão de alunos",
        "Gestão de professores",
        "Chat com IA",
        "Jornadas",
        "Exercícios e listas",
        "Matérias e turmas"
      ]
    },
    {
      title: "Professor",
      route: "/professor/*",
      icon: Users,
      description: "Painel do professor (RPC + localStorage)",
      color: "bg-green-100 text-green-800",
      features: [
        "Alunos das turmas atribuídas",
        "Jornadas dos alunos",
        "Histórico de interações",
        "Exercícios disponíveis"
      ]
    },
    {
      title: "Aluno",
      route: "/dashboard, /jornada, /chat...",
      icon: Users,
      description: "Área do estudante (Edge Function + localStorage)",
      color: "bg-yellow-100 text-yellow-800",
      features: [
        "Dashboard pessoal",
        "Execução de jornadas",
        "Chat de estudos",
        "Exercícios e listas"
      ]
    },
    {
      title: "Pais/Responsáveis",
      route: "/pais/*",
      icon: Users,
      description: "Área dos pais (placeholder - a implementar)",
      color: "bg-orange-100 text-orange-800",
      features: [
        "Dashboard do responsável",
        "Acompanhamento do filho (planejado)"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Documentação de Acessos
            </h1>
            <p className="text-xl text-muted-foreground">
              Guia completo dos perfis, rotas, funcionalidades e autenticação da plataforma
            </p>
          </div>
        </div>

        {/* Mapa de Acessos */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Key className="w-6 h-6" />
            Mapa de Acessos e Perfis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {accessProfiles.map((profile, index) => (
              <Card key={index} className="h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <profile.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <CardTitle className="text-lg leading-tight">
                        {profile.title}
                      </CardTitle>
                      <Badge variant="outline" className={`text-xs ${profile.color} border-0`}>
                        {profile.route}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm mt-2">
                    {profile.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {profile.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* Fluxos de Login */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Fluxos de Login
          </h2>
          
          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="text-sm text-muted-foreground space-y-4">
              <h4 className="font-medium text-foreground">Fluxo de Autenticação por Perfil:</h4>
              
              <div className="space-y-4">
                <div className="bg-background/50 p-4 rounded border-l-4 border-yellow-400">
                  <h5 className="font-medium text-yellow-800">Aluno</h5>
                  <p className="text-sm">
                    Usuário → Frontend → Edge Function (student-auth) → Banco (verify_student_login) → Sessão local → /dashboard
                  </p>
                </div>
                
                <div className="bg-background/50 p-4 rounded border-l-4 border-green-400">
                  <h5 className="font-medium text-green-800">Professor</h5>
                  <p className="text-sm">
                    Usuário → Frontend → RPC (verify_professor_password) → Sessão localStorage → /professor/dashboard
                  </p>
                </div>
                
                <div className="bg-background/50 p-4 rounded border-l-4 border-blue-400">
                  <h5 className="font-medium text-blue-800">Direção/Coordenação</h5>
                  <p className="text-sm">
                    Usuário → Frontend → Supabase Auth → Profile (school_admin/coordinator) → /admin/dashboard
                  </p>
                </div>
                
                <div className="bg-background/50 p-4 rounded border-l-4 border-purple-400">
                  <h5 className="font-medium text-purple-800">Launs Admin</h5>
                  <p className="text-sm">
                    Usuário → Frontend → Supabase Auth → Profile (admin) → /launs/dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Proteção de Rotas */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Como a Aplicação Protege as Rotas
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ProtectedRoute</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Checa sessão do AuthContext e flags específicas para diferentes tipos de usuário.
                </p>
                <div className="space-y-2">
                  <Badge variant="secondary">requireSchoolAdmin</Badge>
                  <Badge variant="secondary">requireParent</Badge>
                  <Badge variant="secondary">Rotas do aluno</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ProtectedLaunsRoute</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Permite acesso às rotas /launs/* apenas se profile.role === 'admin'.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ProfessorPageWrapper</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Valida sessão do professor via localStorage (professorSession), senão redireciona para /professor.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* RLS e Banco de Dados */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Database className="w-6 h-6" />
            RLS (Row Level Security) - Quem Vê o Quê
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Global (Launs)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Acesso total às entidades globais e às escolas via políticas específicas.
                </p>
                <div className="text-xs space-y-1">
                  <div><strong>Tabelas:</strong> escolas, modulos, webhooks, exercises, exercise_collections</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Direção/Coordenação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Acesso apenas à própria escola (restrição por profiles.escola_id).
                </p>
                <div className="text-xs space-y-1">
                  <div><strong>Tabelas:</strong> students, professores, turmas, materias, jornadas</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Professor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Acesso apenas a alunos das turmas/matérias atribuídas.
                </p>
                <div className="text-xs space-y-1">
                  <div><strong>Controle:</strong> professor_materia_turma</div>
                  <div><strong>Funções:</strong> get_professor_students, professor_can_view_student</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aluno</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Acesso apenas aos próprios dados e jornadas.
                </p>
                <div className="text-xs space-y-1">
                  <div><strong>Tabelas:</strong> students (próprio), jornadas, student_answers</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Endpoints Principais */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Principais Endpoints e Functions</h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">RPCs (rest/v1/rpc)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Autenticação:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• verify_professor_password</li>
                      <li>• verify_student_password (via student-auth)</li>
                      <li>• verify_coordenador_password</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Acesso de Dados:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• get_professor_students</li>
                      <li>• professor_can_view_student</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Views Otimizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Exercícios:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• v_exercises_catalog (catálogo otimizado)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Jornadas:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• v_jornadas_overview (panorama com contexto)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Limitações Conhecidas */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Observações e Limitações Conhecidas</h2>
          
          <div className="space-y-4">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-800 text-sm font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">ProfessorLogin - Segurança</h4>
                    <p className="text-sm text-yellow-700">
                      O sistema deve confiar no sucesso da RPC verify_professor_password. A função não retorna hash de senha por segurança.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-800 text-sm font-bold">⚠</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-800 mb-2">Pais/Responsáveis - Placeholder</h4>
                    <p className="text-sm text-orange-700">
                      Autenticação atual é placeholder. Para produção, implementar tabela de pais com RLS vinculando a alunos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-800 text-sm font-bold">i</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">RLS e Visibilidade</h4>
                    <p className="text-sm text-blue-700">
                      Se algum perfil "não vê dados", geralmente é RLS: perfis precisam do profiles.escola_id correto e role adequado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm">
          <p>
            Esta documentação é mantida atualizada com a evolução da plataforma.
            <br />
            Para dúvidas ou sugestões de melhoria, entre em contato com a equipe de desenvolvimento.
          </p>
        </div>
      </div>
    </div>
  );
}