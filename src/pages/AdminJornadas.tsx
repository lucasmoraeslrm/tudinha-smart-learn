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
import { useEscola } from '@/hooks/useEscola';
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
  Trash2,
  GraduationCap,
  Copy
} from 'lucide-react';

interface Professor {
  id: string;
  nome: string;
  codigo: string;
  ativo: boolean;
}

interface Serie {
  ano_letivo: string;
  turma: string;
  student_count: number;
}

interface JornadaExercise {
  id: string;
  title: string;
  question: string;
  options: any;
  correct_answer: string;
  explanation: string;
  subject: string;
  difficulty: string;
  ordem: number;
}

interface Jornada {
  id: string;
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
  serie_ano_letivo: string;
  serie_turma: string;
  exercise_ids: string[];
}

interface NovaJornada {
  serieAnoLetivo: string;
  serieTurma: string;
  aulaTitulo: string;
  materia: string;
  assunto: string;
  professorNome: string;
  inicioDate: string;
  inicioTime: string;
  duracaoMinutos: number;
  exercisesIds: string[];
}

interface NovoExercicio {
  title: string;
  question: string;
  options: { text: string; }[];
  correct_answer: string;
  explanation: string;
  subject: string;
  difficulty: string;
}

export default function AdminJornadas() {
  const { escola } = useEscola();
  const [series, setSeries] = useState<Serie[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [jornadaExercises, setJornadaExercises] = useState<JornadaExercise[]>([]);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [creatingExercise, setCreatingExercise] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSerie, setFilterSerie] = useState('all');
  const [openJornadaDialog, setOpenJornadaDialog] = useState(false);
  const [openExerciseDialog, setOpenExerciseDialog] = useState(false);
  const [editingJornada, setEditingJornada] = useState<Jornada | null>(null);
  
  const [novaJornada, setNovaJornada] = useState<NovaJornada>({
    serieAnoLetivo: '',
    serieTurma: '',
    aulaTitulo: '',
    materia: '',
    assunto: '',
    professorNome: '',
    inicioDate: '',
    inicioTime: '',
    duracaoMinutos: 40,
    exercisesIds: []
  });

  const [novoExercicio, setNovoExercicio] = useState<NovoExercicio>({
    title: '',
    question: '',
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
    correct_answer: '',
    explanation: '',
    subject: '',
    difficulty: 'medium'
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar séries (agrupamento de estudantes por ano_letivo e turma)
      let studentsQuery = supabase
        .from('students')
        .select('ano_letivo, turma');
      
      if (escola?.id) {
        studentsQuery = studentsQuery.eq('escola_id', escola.id);
      }
      
      const { data: studentsData } = await studentsQuery
        .order('ano_letivo')
        .order('turma');

      // Agrupar por série
      const seriesMap = new Map();
      studentsData?.forEach(student => {
        if (student.ano_letivo && student.turma) {
          const key = `${student.ano_letivo}-${student.turma}`;
          if (seriesMap.has(key)) {
            seriesMap.get(key).student_count++;
          } else {
            seriesMap.set(key, {
              ano_letivo: student.ano_letivo,
              turma: student.turma,
              student_count: 1
            });
          }
        }
      });

      // Carregar professores ativos
      let professoresQuery = supabase
        .from('professores')
        .select('id, nome, codigo, ativo')
        .eq('ativo', true);
      
      if (escola?.id) {
        professoresQuery = professoresQuery.eq('escola_id', escola.id);
      }
      
      const { data: professoresData } = await professoresQuery.order('nome');

      // Carregar exercícios específicos de jornada
      const { data: exercisesData } = await supabase
        .from('jornada_exercises')
        .select('*')
        .order('subject')
        .order('ordem');

      // Carregar jornadas filtradas por escola
      let jornadasQuery = supabase
        .from('jornadas')
        .select(`
          *,
          students!inner(escola_id)
        `)
        .order('created_at', { ascending: false });
      
      if (escola?.id) {
        jornadasQuery = jornadasQuery.eq('students.escola_id', escola.id);
      }
      
      const { data: jornadasData } = await jornadasQuery;

      setSeries(Array.from(seriesMap.values()));
      setProfessores(professoresData || []);
      setJornadaExercises(exercisesData || []);
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

  const criarExercicio = async () => {
    if (!novoExercicio.title || !novoExercicio.question || !novoExercicio.correct_answer || !novoExercicio.subject) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios do exercício.",
        variant: "destructive",
      });
      return;
    }

    setCreatingExercise(true);

    try {
      const { data, error } = await supabase
        .from('jornada_exercises')
        .insert({
          title: novoExercicio.title,
          question: novoExercicio.question,
          options: novoExercicio.options.filter(opt => opt.text.trim() !== ''),
          correct_answer: novoExercicio.correct_answer,
          explanation: novoExercicio.explanation,
          subject: novoExercicio.subject,
          difficulty: novoExercicio.difficulty,
          ordem: jornadaExercises.length + 1
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Exercício criado com sucesso!",
      });

      setOpenExerciseDialog(false);
      setNovoExercicio({
        title: '',
        question: '',
        options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        correct_answer: '',
        explanation: '',
        subject: '',
        difficulty: 'medium'
      });
      loadData();

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o exercício.",
        variant: "destructive",
      });
    } finally {
      setCreatingExercise(false);
    }
  };

  const criarJornada = async () => {
    if (!novaJornada.serieAnoLetivo || !novaJornada.serieTurma || !novaJornada.aulaTitulo || !novaJornada.materia) {
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
          serie_ano_letivo: novaJornada.serieAnoLetivo,
          serie_turma: novaJornada.serieTurma,
          aula_titulo: novaJornada.aulaTitulo,
          materia: novaJornada.materia,
          assunto: novaJornada.assunto,
          professor_nome: novaJornada.professorNome,
          inicio_previsto: inicioDateTime.toISOString(),
          fim_previsto: fimDateTime.toISOString(),
          exercise_ids: novaJornada.exercisesIds,
          status: 'pendente'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Jornada criada para a série ${novaJornada.serieAnoLetivo} - ${novaJornada.serieTurma}!`,
      });

      setOpenJornadaDialog(false);
      setNovaJornada({
        serieAnoLetivo: '',
        serieTurma: '',
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

  const deleteExercise = async (exerciseId: string, title: string) => {
    console.log('Tentando excluir exercício:', exerciseId, title);
    
    if (!confirm(`Tem certeza que deseja excluir o exercício "${title}"?`)) {
      console.log('Usuário cancelou a exclusão');
      return;
    }

    try {
      console.log('Enviando requisição de exclusão para o Supabase...');
      const { error, data } = await supabase
        .from('jornada_exercises')
        .delete()
        .eq('id', exerciseId);

      console.log('Resposta da exclusão:', { error, data });

      if (error) {
        console.error('Erro na exclusão:', error);
        throw error;
      }

      // Remover o exercício do estado local imediatamente
      setJornadaExercises(prevExercises => 
        prevExercises.filter(ex => ex.id !== exerciseId)
      );

      toast({
        title: "Sucesso",
        description: "Exercício excluído com sucesso!",
      });

      console.log('Exercício removido do estado local com sucesso');
      
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o exercício.",
        variant: "destructive",
      });
    }
  };

  const editarJornada = (jornada: Jornada) => {
    const inicioDate = new Date(jornada.inicio_previsto);
    const fimDate = new Date(jornada.fim_previsto);
    const duracaoMinutos = Math.round((fimDate.getTime() - inicioDate.getTime()) / (1000 * 60));

    setNovaJornada({
      serieAnoLetivo: jornada.serie_ano_letivo,
      serieTurma: jornada.serie_turma,
      aulaTitulo: jornada.aula_titulo,
      materia: jornada.materia,
      assunto: jornada.assunto || '',
      professorNome: jornada.professor_nome || '',
      inicioDate: inicioDate.toISOString().split('T')[0],
      inicioTime: inicioDate.toTimeString().slice(0, 5),
      duracaoMinutos,
      exercisesIds: jornada.exercise_ids || []
    });
    setEditingJornada(jornada);
    setOpenJornadaDialog(true);
  };

  const duplicarJornada = (jornada: Jornada) => {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    const inicioDate = new Date(jornada.inicio_previsto);
    const fimDate = new Date(jornada.fim_previsto);
    const duracaoMinutos = Math.round((fimDate.getTime() - inicioDate.getTime()) / (1000 * 60));

    setNovaJornada({
      serieAnoLetivo: jornada.serie_ano_letivo,
      serieTurma: jornada.serie_turma,
      aulaTitulo: `${jornada.aula_titulo} (Cópia)`,
      materia: jornada.materia,
      assunto: jornada.assunto || '',
      professorNome: jornada.professor_nome || '',
      inicioDate: amanha.toISOString().split('T')[0],
      inicioTime: inicioDate.toTimeString().slice(0, 5),
      duracaoMinutos,
      exercisesIds: jornada.exercise_ids || []
    });
    setEditingJornada(null);
    setOpenJornadaDialog(true);
  };

  const salvarJornada = async () => {
    if (!novaJornada.serieAnoLetivo || !novaJornada.serieTurma || !novaJornada.aulaTitulo || !novaJornada.materia) {
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

      const jornadaData = {
        serie_ano_letivo: novaJornada.serieAnoLetivo,
        serie_turma: novaJornada.serieTurma,
        aula_titulo: novaJornada.aulaTitulo,
        materia: novaJornada.materia,
        assunto: novaJornada.assunto,
        professor_nome: novaJornada.professorNome,
        inicio_previsto: inicioDateTime.toISOString(),
        fim_previsto: fimDateTime.toISOString(),
        exercise_ids: novaJornada.exercisesIds,
        status: 'pendente'
      };

      let error;
      if (editingJornada) {
        // Editando jornada existente
        const { error: updateError } = await supabase
          .from('jornadas')
          .update(jornadaData)
          .eq('id', editingJornada.id);
        error = updateError;
      } else {
        // Criando nova jornada
        const { error: insertError } = await supabase
          .from('jornadas')
          .insert(jornadaData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: editingJornada 
          ? "Jornada atualizada com sucesso!"
          : `Jornada criada para a série ${novaJornada.serieAnoLetivo} - ${novaJornada.serieTurma}!`,
      });

      setOpenJornadaDialog(false);
      setEditingJornada(null);
      setNovaJornada({
        serieAnoLetivo: '',
        serieTurma: '',
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
        description: error.message || "Não foi possível salvar a jornada.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredJornadas = jornadas.filter(jornada => {
    const matchesSearch = jornada.aula_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jornada.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${jornada.serie_ano_letivo} ${jornada.serie_turma}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || jornada.status === filterStatus;
    const matchesSerie = filterSerie === 'all' || `${jornada.serie_ano_letivo}-${jornada.serie_turma}` === filterSerie;

    return matchesSearch && matchesStatus && matchesSerie;
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
          <p className="text-muted-foreground">Crie jornadas por série e gerencie exercícios específicos</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={openExerciseDialog} onOpenChange={setOpenExerciseDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Novo Exercício
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Exercício de Jornada</DialogTitle>
                <DialogDescription>
                  Crie exercícios específicos para usar nas jornadas
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título*</Label>
                    <Input
                      value={novoExercicio.title}
                      onChange={(e) => setNovoExercicio({...novoExercicio, title: e.target.value})}
                      placeholder="Ex: Equações do 2º grau"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Matéria*</Label>
                    <Select value={novoExercicio.subject} onValueChange={(value) => setNovoExercicio({...novoExercicio, subject: value})}>
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pergunta*</Label>
                  <Textarea
                    value={novoExercicio.question}
                    onChange={(e) => setNovoExercicio({...novoExercicio, question: e.target.value})}
                    placeholder="Digite a pergunta do exercício"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Opções de Resposta</Label>
                  {novoExercicio.options.map((option, index) => (
                    <Input
                      key={index}
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...novoExercicio.options];
                        newOptions[index] = { text: e.target.value };
                        setNovoExercicio({...novoExercicio, options: newOptions});
                      }}
                      placeholder={`Opção ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resposta Correta*</Label>
                    <Input
                      value={novoExercicio.correct_answer}
                      onChange={(e) => setNovoExercicio({...novoExercicio, correct_answer: e.target.value})}
                      placeholder="Digite a resposta correta"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dificuldade</Label>
                    <Select value={novoExercicio.difficulty} onValueChange={(value) => setNovoExercicio({...novoExercicio, difficulty: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Fácil</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="hard">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Explicação</Label>
                  <Textarea
                    value={novoExercicio.explanation}
                    onChange={(e) => setNovoExercicio({...novoExercicio, explanation: e.target.value})}
                    placeholder="Explicação da resposta (opcional)"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setOpenExerciseDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={criarExercicio} disabled={creatingExercise}>
                    {creatingExercise ? 'Criando...' : 'Criar Exercício'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openJornadaDialog} onOpenChange={(open) => {
            setOpenJornadaDialog(open);
            if (!open) {
              setEditingJornada(null);
              setNovaJornada({
                serieAnoLetivo: '',
                serieTurma: '',
                aulaTitulo: '',
                materia: '',
                assunto: '',
                professorNome: '',
                inicioDate: '',
                inicioTime: '',
                duracaoMinutos: 40,
                exercisesIds: []
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Jornada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingJornada ? 'Editar Jornada' : 'Criar Nova Jornada por Série'}
                </DialogTitle>
                <DialogDescription>
                  {editingJornada 
                    ? 'Atualize as informações da jornada existente'
                    : 'Configure uma nova jornada de aprendizagem para uma série inteira'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Série*</Label>
                    <Select 
                      value={`${novaJornada.serieAnoLetivo}-${novaJornada.serieTurma}`} 
                      onValueChange={(value) => {
                        const [ano, turma] = value.split('-');
                        setNovaJornada({...novaJornada, serieAnoLetivo: ano, serieTurma: turma});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a série" />
                      </SelectTrigger>
                      <SelectContent>
                        {series.map((serie) => (
                          <SelectItem key={`${serie.ano_letivo}-${serie.turma}`} value={`${serie.ano_letivo}-${serie.turma}`}>
                            {serie.ano_letivo} - {serie.turma} ({serie.student_count} alunos)
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
                  <Select 
                    value={novaJornada.professorNome} 
                    onValueChange={(value) => setNovaJornada({...novaJornada, professorNome: value})}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione um professor" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {loading ? (
                        <SelectItem value="" disabled>Carregando professores...</SelectItem>
                      ) : professores.length === 0 ? (
                        <SelectItem value="" disabled>Nenhum professor ativo encontrado</SelectItem>
                      ) : (
                        professores.map((professor) => (
                          <SelectItem 
                            key={professor.id} 
                            value={professor.nome}
                            className="hover:bg-muted cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{professor.nome}</span>
                              <span className="text-sm text-muted-foreground">
                                {professor.codigo}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!loading && professores.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      ⚠️ Nenhum professor ativo cadastrado. Cadastre professores na seção "Gerenciar Professores".
                    </p>
                  )}
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
                  <Label>Exercícios da Jornada</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                    {jornadaExercises.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum exercício disponível</p>
                    ) : (
                      jornadaExercises.map((exercise) => (
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
                            {exercise.title} - {exercise.subject} ({exercise.difficulty})
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setOpenJornadaDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={salvarJornada} disabled={creating}>
                    {creating ? 'Salvando...' : editingJornada ? 'Salvar Alterações' : 'Criar Jornada'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="jornadas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jornadas">Jornadas</TabsTrigger>
          <TabsTrigger value="exercicios">Exercícios</TabsTrigger>
        </TabsList>

        <TabsContent value="jornadas" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por título, matéria ou série..."
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
                <Select value={filterSerie} onValueChange={setFilterSerie}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Séries</SelectItem>
                    {series.map((serie) => (
                      <SelectItem key={`${serie.ano_letivo}-${serie.turma}`} value={`${serie.ano_letivo}-${serie.turma}`}>
                        {serie.ano_letivo} - {serie.turma}
                      </SelectItem>
                    ))}
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
                    {searchTerm || filterStatus !== 'all' || filterSerie !== 'all' 
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
                              <GraduationCap className="w-4 h-4" />
                              {jornada.serie_ano_letivo} - {jornada.serie_turma}
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

                          {jornada.exercise_ids && jornada.exercise_ids.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Exercícios: {jornada.exercise_ids.length}
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
                            variant="outline"
                            onClick={() => editarJornada(jornada)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => duplicarJornada(jornada)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>

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
        </TabsContent>

        <TabsContent value="exercicios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Exercícios de Jornada ({jornadaExercises.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jornadaExercises.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
                  <p className="text-muted-foreground">
                    Crie o primeiro exercício para usar nas jornadas
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jornadaExercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{exercise.title}</h3>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteExercise(exercise.id, exercise.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Matéria:</strong> {exercise.subject}</p>
                        <p><strong>Dificuldade:</strong> {exercise.difficulty}</p>
                        <p><strong>Pergunta:</strong> {exercise.question.substring(0, 100)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}