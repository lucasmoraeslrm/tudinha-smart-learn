import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { History, Search, Clock, CheckCircle, XCircle, User } from 'lucide-react';

interface ProfessorHistoricoProps {
  professorData: any;
}

export default function ProfessorHistorico({ professorData }: ProfessorHistoricoProps) {
  const [jornadas, setJornadas] = useState<any[]>([]);
  const [filteredJornadas, setFilteredJornadas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarHistorico();
  }, [professorData]);

  useEffect(() => {
    filterJornadas();
  }, [searchTerm, statusFilter, jornadas]);

  const carregarHistorico = async () => {
    if (!professorData?.nome) return;

    try {
      // Buscar jornadas do professor com dados do aluno
      const { data: jornadasData, error } = await supabase
        .from('jornadas')
        .select(`
          *,
          students!inner(id, name, ra)
        `)
        .eq('professor_nome', professorData.nome)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar histórico:', error);
        return;
      }

      setJornadas(jornadasData || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJornadas = () => {
    let filtered = jornadas;

    if (searchTerm) {
      filtered = filtered.filter(jornada =>
        jornada.aula_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jornada.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jornada.assunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jornada.students?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(jornada => jornada.status === statusFilter);
    }

    setFilteredJornadas(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="w-4 h-4" />;
      case 'em_andamento': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'concluida': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelada': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluida': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-muted-foreground">
          Histórico completo das jornadas dos seus alunos
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, matéria, aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jornadas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jornadas.filter(j => j.status === 'concluida').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jornadas.filter(j => j.status === 'em_andamento').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jornadas.filter(j => j.status === 'pendente').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jornadas List */}
      <div className="space-y-4">
        {filteredJornadas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhuma jornada encontrada com os filtros aplicados' 
                  : 'Nenhuma jornada encontrada'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredJornadas.map((jornada) => (
            <Card key={jornada.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(jornada.status)}
                      {jornada.aula_titulo}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{jornada.materia}</Badge>
                      <Badge className={getStatusColor(jornada.status)}>
                        {jornada.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jornada.students && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span><strong>Aluno:</strong> {jornada.students.name}</span>
                      {jornada.students.ra && (
                        <span className="text-muted-foreground">• RA: {jornada.students.ra}</span>
                      )}
                    </div>
                  )}
                  
                  {jornada.assunto && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Assunto:</strong> {jornada.assunto}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Série/Turma:</span>
                      <div>{jornada.serie_ano_letivo} {jornada.serie_turma}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duração:</span>
                      <div>{formatDuration(jornada.tempo_resumo_segundos)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Criado em:</span>
                      <div>{new Date(jornada.created_at).toLocaleDateString('pt-BR')}</div>
                    </div>
                    {jornada.fim_real && (
                      <div>
                        <span className="text-muted-foreground">Finalizado em:</span>
                        <div>{new Date(jornada.fim_real).toLocaleDateString('pt-BR')}</div>
                      </div>
                    )}
                  </div>

                  {jornada.resultado_exercicio && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Resultado dos Exercícios</h4>
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(jornada.resultado_exercicio, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}