import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { School, useSchools } from '@/hooks/useSchools';
import { 
  ArrowLeft, 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserCog,
  Crown,
  Mail,
  Calendar,
  Hash
} from 'lucide-react';

interface SchoolUsersViewProps {
  school: School;
  onBack: () => void;
}

interface UserData {
  profiles: any[];
  students: any[];
  professors: any[];
  coordinators: any[];
}

export default function SchoolUsersView({ school, onBack }: SchoolUsersViewProps) {
  const { getSchoolUsers } = useSchools();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const data = await getSchoolUsers(school.id);
      setUserData(data);
      setLoading(false);
    };

    loadUsers();
  }, [school.id, getSchoolUsers]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-white">Carregando usuários...</div>
      </div>
    );
  }

  const totalUsers = (userData?.profiles.length || 0) + 
                    (userData?.students.length || 0) + 
                    (userData?.professors.length || 0) + 
                    (userData?.coordinators.length || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">{school.nome}</h2>
          <p className="text-white/70">Usuários cadastrados na escola</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/10 border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Total</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Alunos</p>
                <p className="text-2xl font-bold">{userData?.students.length || 0}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Professores</p>
                <p className="text-2xl font-bold">{userData?.professors.length || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Coordenadores</p>
                <p className="text-2xl font-bold">{userData?.coordinators.length || 0}</p>
              </div>
              <UserCog className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Tabs */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Usuários por Categoria</CardTitle>
          <CardDescription className="text-white/70">
            Visualize todos os usuários organizados por tipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="students" className="text-white">
            <TabsList className="bg-white/5">
              <TabsTrigger value="students" className="data-[state=active]:bg-white/10">
                <GraduationCap className="w-4 h-4 mr-2" />
                Alunos ({userData?.students.length || 0})
              </TabsTrigger>
              <TabsTrigger value="professors" className="data-[state=active]:bg-white/10">
                <BookOpen className="w-4 h-4 mr-2" />
                Professores ({userData?.professors.length || 0})
              </TabsTrigger>
              <TabsTrigger value="coordinators" className="data-[state=active]:bg-white/10">
                <UserCog className="w-4 h-4 mr-2" />
                Coordenadores ({userData?.coordinators.length || 0})
              </TabsTrigger>
              <TabsTrigger value="profiles" className="data-[state=active]:bg-white/10">
                <Crown className="w-4 h-4 mr-2" />
                Perfis ({userData?.profiles.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-4 mt-4">
              {userData?.students.length === 0 ? (
                <p className="text-white/70 text-center py-8">Nenhum aluno cadastrado</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData?.students.map((student) => (
                    <Card key={student.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-white">{student.name}</h4>
                          <div className="space-y-1 text-sm text-white/70">
                            {student.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span>{student.email}</span>
                              </div>
                            )}
                            {student.codigo && (
                              <div className="flex items-center gap-2">
                                <Hash className="w-3 h-3" />
                                <span>{student.codigo}</span>
                              </div>
                            )}
                            {student.turma && (
                              <Badge variant="secondary" className="bg-white/10 text-white">
                                {student.turma}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="professors" className="space-y-4 mt-4">
              {userData?.professors.length === 0 ? (
                <p className="text-white/70 text-center py-8">Nenhum professor cadastrado</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData?.professors.map((professor) => (
                    <Card key={professor.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-white">{professor.nome}</h4>
                          <div className="space-y-1 text-sm text-white/70">
                            {professor.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span>{professor.email}</span>
                              </div>
                            )}
                            {professor.codigo && (
                              <div className="flex items-center gap-2">
                                <Hash className="w-3 h-3" />
                                <span>{professor.codigo}</span>
                              </div>
                            )}
                            {professor.materias && professor.materias.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {professor.materias.map((materia: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="bg-white/10 text-white text-xs">
                                    {materia}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Badge variant={professor.ativo ? "default" : "secondary"} className="mt-2">
                            {professor.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="coordinators" className="space-y-4 mt-4">
              {userData?.coordinators.length === 0 ? (
                <p className="text-white/70 text-center py-8">Nenhum coordenador cadastrado</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData?.coordinators.map((coordinator) => (
                    <Card key={coordinator.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-white">{coordinator.nome}</h4>
                          <div className="space-y-1 text-sm text-white/70">
                            {coordinator.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span>{coordinator.email}</span>
                              </div>
                            )}
                            {coordinator.codigo && (
                              <div className="flex items-center gap-2">
                                <Hash className="w-3 h-3" />
                                <span>{coordinator.codigo}</span>
                              </div>
                            )}
                            <Badge variant="secondary" className="bg-white/10 text-white">
                              {coordinator.funcao}
                            </Badge>
                          </div>
                          <Badge variant={coordinator.ativo ? "default" : "secondary"} className="mt-2">
                            {coordinator.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profiles" className="space-y-4 mt-4">
              {userData?.profiles.length === 0 ? (
                <p className="text-white/70 text-center py-8">Nenhum perfil cadastrado</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData?.profiles.map((profile) => (
                    <Card key={profile.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-white">{profile.full_name || 'Sem nome'}</h4>
                          <div className="space-y-1 text-sm text-white/70">
                            {profile.codigo && (
                              <div className="flex items-center gap-2">
                                <Hash className="w-3 h-3" />
                                <span>{profile.codigo}</span>
                              </div>
                            )}
                            <Badge variant="secondary" className="bg-white/10 text-white">
                              {profile.role}
                            </Badge>
                            {profile.turma && (
                              <Badge variant="outline" className="border-white/20 text-white">
                                {profile.turma}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}