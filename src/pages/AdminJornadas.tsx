import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Plus, 
  Users, 
  Clock, 
  BookOpen, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Search,
  Filter,
  Edit,
  Trash2
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  codigo: string;
  turma: string;
  ano_letivo: string;
}

interface Exercise {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
}

interface ExerciseList {
  id: string;
  title: string;
  subject: string;
  exercise_ids: string[];
}

interface Jornada {
  id: string;
  student_id: string;
  aula_titulo: string;
  materia: string;
  assunto: string;
  professor_nome: string;
  status: string;
  inicio_previsto: string;
  fim_previsto: string;
  inicio_real?: string;
  fim_real?: string;
  created_at: string;
  students?: { name: string; codigo: string; turma: string };
}

interface NovaJornada {
  studentId: string;
  aulaTitulo: string;
  materia: string;
  assunto: string;
  professorNome: string;
  inicioDate: string;
  inicioTime: string;
  duracaoMinutos: number;
  exercisesIds: string[];
}

export default function AdminJornadas() {
  const [students, setStudents] = useState<Student[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseLists, setExerciseLists] = useState<ExerciseList[]>([]);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTurma, setFilterTurma] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  
  const [novaJornada, setNovaJornada] = useState<NovaJornada>({
    studentId: '',
    aulaTitulo: '',
    materia: '',
    assunto: '',
    professorNome: '',
    inicioDate: '',
    inicioTime: '',
    duracaoMinutos: 40,
    exercisesIds: []
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar estudantes
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name, codigo, turma, ano_letivo')
        .order('name');

      // Carregar exercícios
      const { data: exercisesData } = await supabase
        .from('exercises')
        .select('id, title, subject, difficulty')
        .order('title');

      // Carregar listas de exercícios
      const { data: listsData } = await supabase
        .from('exercise_lists')
        .select('id, title, subject, exercise_ids')
        .order('title');

      // Carregar jornadas
      const { data: jornadasData } = await supabase
        .from('jornadas')
        .select(`
          *,
          students (name, codigo, turma)
        `)
        .order('created_at', { ascending: false });

      setStudents(studentsData || []);
      setExercises(exercisesData || []);
      setExerciseLists(listsData || []);
      setJornadas(jornadasData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const criarJornada = async () => {
    if (!novaJornada.studentId || !novaJornada.aulaTitulo || !novaJornada.materia) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      const inicioDateTime = new Date(`${novaJornada.inicioDate}T${novaJornada.inicioTime}`);
      const fimDateTime = new Date(inicioDateTime.getTime() + novaJornada.duracaoMinutos * 60000);

      const { data, error } = await supabase
        .from('jornadas')
        .insert({
          student_id: novaJornada.studentId,
          aula_titulo: novaJornada.aulaTitulo,
          materia: novaJornada.materia,
          assunto: novaJornada.assunto,
          professor_nome: novaJornada.professorNome,
          inicio_previsto: inicioDateTime.toISOString(),
          fim_previsto: fimDateTime.toISOString(),
          status: 'pendente'
        })
        .select()
        .single();

      if (error) throw error;

      // Se foram selecionados exercícios, associá-los à jornada
      if (novaJornada.exercisesIds.length > 0) {
        const exercisesToAssociate = {
          exercicios_selecionados: novaJornada.exercisesIds
        };

        await supabase
          .from('jornadas')
          .update({ resultado_exercicio: exercisesToAssociate })
          .eq('id', data.id);
      }

      toast({
        title: "Sucesso",
        description: "Jornada criada com sucesso!",
      });

      setOpenDialog(false);
      setNovaJornada({
        studentId: '',
        aulaTitulo: '',
        materia: '',
        assunto: '',
        professorNome: '',
        inicioDate: '',
        inicioTime: '',
        duracaoMinutos: 40,
        exercisesIds: []
      });
      loadData();

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a jornada.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const updateJornadaStatus = async (jornadaId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jornadas')
        .update({ status: newStatus })
        .eq('id', jornadaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Status da jornada atualizado para ${newStatus}`,
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const deleteJornada = async (jornadaId: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir a jornada "${titulo}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('jornadas')
        .delete()
        .eq('id', jornadaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Jornada excluída com sucesso!",
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a jornada.",
        variant: "destructive",
      });
    }
  };

  const filteredJornadas = jornadas.filter(jornada => {
    const matchesSearch = jornada.aula_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jornada.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jornada.students?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || jornada.status === filterStatus;
    const matchesTurma = filterTurma === 'all' || jornada.students?.turma === filterTurma;

    return matchesSearch && matchesStatus && matchesTurma;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'finalizada': return 'bg-green-100 text-green-800';
      case 'pausada': return 'bg-orange-100 text-orange-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="w-4 h-4" />;
      case 'em_andamento': return <Play className="w-4 h-4" />;
      case 'finalizada': return <CheckCircle className="w-4 h-4" />;
      case 'pausada': return <Pause className="w-4 h-4" />;
      case 'cancelada': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Jornadas</h1>
          <p className="text-muted-foreground">Crie e monitore jornadas de aprendizagem dos alunos</p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Jornada
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Jornada</DialogTitle>
              <DialogDescription>
                Configure uma nova jornada de aprendizagem para um aluno
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aluno*</Label>
                  <Select value={novaJornada.studentId} onValueChange={(value) => setNovaJornada({...novaJornada, studentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} - {student.codigo} ({student.turma})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Matéria*</Label>
                  <Select value={novaJornada.materia} onValueChange={(value) => setNovaJornada({...novaJornada, materia: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matemática">Matemática</SelectItem>
                      <SelectItem value="Português">Português</SelectItem>
                      <SelectItem value="História">História</SelectItem>
                      <SelectItem value="Geografia">Geografia</SelectItem>
                      <SelectItem value="Ciências">Ciências</SelectItem>
                      <SelectItem value="Física">Física</SelectItem>
                      <SelectItem value="Química">Química</SelectItem>
                      <SelectItem value="Biologia">Biologia</SelectItem>
                      <SelectItem value="Inglês">Inglês</SelectItem>
                      <SelectItem value="Educação Física">Educação Física</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título da Aula*</Label>
                <Input
                  value={novaJornada.aulaTitulo}
                  onChange={(e) => setNovaJornada({...novaJornada, aulaTitulo: e.target.value})}
                  placeholder="Ex: Introdução às equações quadráticas"
                />
              </div>

              <div className="space-y-2">
                <Label>Assunto</Label>
                <Textarea
                  value={novaJornada.assunto}
                  onChange={(e) => setNovaJornada({...novaJornada, assunto: e.target.value})}
                  placeholder="Descreva o assunto que será abordado na jornada"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Professor</Label>
                <Input
                  value={novaJornada.professorNome}
                  onChange={(e) => setNovaJornada({...novaJornada, professorNome: e.target.value})}
                  placeholder="Nome do professor responsável"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={novaJornada.inicioDate}
                    onChange={(e) => setNovaJornada({...novaJornada, inicioDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário de Início</Label>
                  <Input
                    type="time"
                    value={novaJornada.inicioTime}
                    onChange={(e) => setNovaJornada({...novaJornada, inicioTime: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duração (minutos)</Label>
                  <Input
                    type="number"
                    value={novaJornada.duracaoMinutos}
                    onChange={(e) => setNovaJornada({...novaJornada, duracaoMinutos: parseInt(e.target.value) || 40})}
                    min="10"
                    max="240"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Exercícios (Opcional)</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                  {exercises.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum exercício disponível</p>
                  ) : (
                    exercises.map((exercise) => (
                      <div key={exercise.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={exercise.id}
                          checked={novaJornada.exercisesIds.includes(exercise.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNovaJornada({
                                ...novaJornada,
                                exercisesIds: [...novaJornada.exercisesIds, exercise.id]
                              });
                            } else {
                              setNovaJornada({
                                ...novaJornada,
                                exercisesIds: novaJornada.exercisesIds.filter(id => id !== exercise.id)
                              });
                            }
                          }}
                        />
                        <label htmlFor={exercise.id} className="text-sm">
                          {exercise.title} - {exercise.subject}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={criarJornada} disabled={creating}>
                  {creating ? 'Criando...' : 'Criar Jornada'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por título, matéria ou aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="pausada">Pausada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTurma} onValueChange={setFilterTurma}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Turmas</SelectItem>
                <SelectItem value="1A">1º Ano A</SelectItem>
                <SelectItem value="1B">1º Ano B</SelectItem>
                <SelectItem value="2A">2º Ano A</SelectItem>
                <SelectItem value="2B">2º Ano B</SelectItem>
                <SelectItem value="3A">3º Ano A</SelectItem>
                <SelectItem value="3B">3º Ano B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Jornadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Jornadas ({filteredJornadas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredJornadas.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma jornada encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all' || filterTurma !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie a primeira jornada para começar'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJornadas.map((jornada) => (
                <div key={jornada.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{jornada.aula_titulo}</h3>
                        <Badge className={getStatusColor(jornada.status)}>
                          {getStatusIcon(jornada.status)}
                          <span className="ml-1 capitalize">{jornada.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {jornada.students?.name} ({jornada.students?.turma})
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {jornada.materia}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(jornada.inicio_previsto).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(jornada.inicio_previsto).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>

                      {jornada.assunto && (
                        <p className="text-sm text-muted-foreground mt-2">{jornada.assunto}</p>
                      )}

                      {jornada.professor_nome && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Professor: {jornada.professor_nome}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {jornada.status === 'pendente' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateJornadaStatus(jornada.id, 'em_andamento')}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      
                      {jornada.status === 'em_andamento' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateJornadaStatus(jornada.id, 'finalizada')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Finalizar
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteJornada(jornada.id, jornada.aula_titulo)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}