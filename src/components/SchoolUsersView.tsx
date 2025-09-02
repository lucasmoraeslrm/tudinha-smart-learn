import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, GraduationCap, UserPlus, Shield, Search } from 'lucide-react';

interface User {
  id: string;
  nome: string;
  email?: string;
  codigo?: string;
  tipo: 'estudante' | 'professor' | 'coordenador' | 'tutor';
  status?: string;
  funcao?: string;
  turma?: string;
  ano_letivo?: string;
}

interface SchoolUsersViewProps {
  schoolId: string;
}

export default function SchoolUsersView({ schoolId }: SchoolUsersViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    estudantes: 0,
    professores: 0,
    coordenadores: 0,
    tutores: 0
  });

  useEffect(() => {
    fetchAllUsers();
  }, [schoolId]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const allUsers: User[] = [];

      // Buscar estudantes
      const { data: students } = await supabase
        .from('students')
        .select('id, name, email, codigo, turma, ano_letivo')
        .eq('escola_id', schoolId);

      if (students) {
        students.forEach(student => {
          allUsers.push({
            id: student.id,
            nome: student.name,
            email: student.email,
            codigo: student.codigo,
            tipo: 'estudante',
            turma: student.turma,
            ano_letivo: student.ano_letivo
          });
        });
      }

      // Buscar professores
      const { data: professors } = await supabase
        .from('professores')
        .select('id, nome, email, codigo')
        .eq('escola_id', schoolId)
        .eq('ativo', true);

      if (professors) {
        professors.forEach(professor => {
          allUsers.push({
            id: professor.id,
            nome: professor.nome,
            email: professor.email,
            codigo: professor.codigo,
            tipo: 'professor'
          });
        });
      }

      // Buscar coordenadores
      const { data: coordinators } = await supabase
        .from('coordenadores')
        .select('id, nome, email, codigo, funcao')
        .eq('escola_id', schoolId)
        .eq('ativo', true);

      if (coordinators) {
        coordinators.forEach(coordinator => {
          allUsers.push({
            id: coordinator.id,
            nome: coordinator.nome,
            email: coordinator.email,
            codigo: coordinator.codigo,
            tipo: 'coordenador',
            funcao: coordinator.funcao
          });
        });
      }

      // Buscar tutores
      const { data: tutors } = await supabase
        .from('tutores')
        .select('id, nome, email, tipo')
        .eq('escola_id', schoolId)
        .eq('ativo', true);

      if (tutors) {
        tutors.forEach(tutor => {
          allUsers.push({
            id: tutor.id,
            nome: tutor.nome,
            email: tutor.email,
            tipo: 'tutor',
            funcao: tutor.tipo
          });
        });
      }

      setUsers(allUsers);
      
      // Calcular estatísticas
      const stats = {
        total: allUsers.length,
        estudantes: allUsers.filter(u => u.tipo === 'estudante').length,
        professores: allUsers.filter(u => u.tipo === 'professor').length,
        coordenadores: allUsers.filter(u => u.tipo === 'coordenador').length,
        tutores: allUsers.filter(u => u.tipo === 'tutor').length
      };
      setStats(stats);

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserIcon = (tipo: string) => {
    switch (tipo) {
      case 'estudante':
        return <GraduationCap className="w-4 h-4" />;
      case 'professor':
        return <UserPlus className="w-4 h-4" />;
      case 'coordenador':
        return <Shield className="w-4 h-4" />;
      case 'tutor':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getUserTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'estudante':
        return 'bg-blue-100 text-blue-800';
      case 'professor':
        return 'bg-green-100 text-green-800';
      case 'coordenador':
        return 'bg-purple-100 text-purple-800';
      case 'tutor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Todos os Usuários</h2>
        <p className="text-muted-foreground">
          Visualize todos os usuários cadastrados na escola (estudantes, professores, coordenadores e tutores)
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estudantes</p>
                <p className="text-2xl font-bold text-foreground">{stats.estudantes}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Professores</p>
                <p className="text-2xl font-bold text-foreground">{stats.professores}</p>
              </div>
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coordenadores</p>
                <p className="text-2xl font-bold text-foreground">{stats.coordenadores}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tutores</p>
                <p className="text-2xl font-bold text-foreground">{stats.tutores}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar por nome, e-mail ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Usuários ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Código</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">E-mail</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Nenhum usuário encontrado com os critérios de busca.' : 'Nenhum usuário encontrado.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={`${user.tipo}-${user.id}`} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getUserIcon(user.tipo)}
                          <span className="font-medium text-foreground">{user.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getUserTypeColor(user.tipo)}>
                          {user.tipo.charAt(0).toUpperCase() + user.tipo.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-muted-foreground">
                          {user.codigo || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {user.email || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-muted-foreground">
                          {user.funcao && (
                            <div>Função: {user.funcao}</div>
                          )}
                          {user.turma && (
                            <div>Turma: {user.turma}</div>
                          )}
                          {user.ano_letivo && (
                            <div>Ano: {user.ano_letivo}</div>
                          )}
                          {!user.funcao && !user.turma && !user.ano_letivo && '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}