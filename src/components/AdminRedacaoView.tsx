import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Search, 
  Eye, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Star,
  User 
} from 'lucide-react';

interface Redacao {
  id: string;
  titulo: string;
  conteudo: string;
  palavras: number;
  tempo_ms: number;
  status: string;
  created_at: string;
  notas?: any;
  feedback?: any;
  user_id: string;
  student_id?: string;
  escola_id: string;
  temas_redacao?: {
    titulo: string;
    texto_motivador: string;
  };
  students?: {
    name: string;
    codigo?: string;
    ra?: string;
  };
}

export default function AdminRedacaoView() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [redacoes, setRedacoes] = useState<Redacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [correcting, setCorrecting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRedacao, setSelectedRedacao] = useState<Redacao | null>(null);

  useEffect(() => {
    if (profile?.escola_id) {
      loadRedacoes();
    }
  }, [profile]);

  const loadRedacoes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('redacoes_usuario')
        .select(`
          *,
          temas_redacao:tema_id (
            titulo,
            texto_motivador
          ),
          students:student_id (
            name,
            codigo,
            ra
          )
        `)
        .eq('escola_id', profile?.escola_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRedacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar redações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as redações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const solicitarCorrecao = async (redacaoId: string) => {
    setCorrecting(redacaoId);
    
    try {
      const { data, error } = await supabase.functions.invoke('enem-corrigir', {
        body: { 
          redacao_id: redacaoId, 
          escola_id: profile?.escola_id 
        }
      });

      if (error) throw error;

      toast({
        title: "Correção solicitada!",
        description: "A redação está sendo corrigida pela IA",
      });

      loadRedacoes();
    } catch (error: any) {
      console.error('Erro na correção:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao solicitar correção",
        variant: "destructive",
      });
    } finally {
      setCorrecting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviada': return 'default';
      case 'corrigindo': return 'secondary';
      case 'corrigida': return 'destructive';
      default: return 'outline';
    }
  };

  const getNotaFinal = (redacao: Redacao) => {
    return redacao.feedback?.nota_final || 0;
  };

  const formatTempo = (tempo_ms: number) => {
    const minutes = Math.floor(tempo_ms / 60000);
    return `${minutes} min`;
  };

  const filteredRedacoes = redacoes.filter(redacao => {
    const matchesSearch = 
      redacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redacao.students?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redacao.students?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redacao.students?.ra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redacao.temas_redacao?.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || redacao.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Gestão de Redações</h1>
          <p className="text-muted-foreground">Acompanhe e gerencie as redações dos alunos</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por título, aluno, código ou tema..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="corrigindo">Corrigindo</SelectItem>
                <SelectItem value="corrigida">Corrigida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Redações */}
      <Card>
        <CardHeader>
          <CardTitle>
            Redações ({filteredRedacoes.length})
            {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && redacoes.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Carregando redações...</p>
            </div>
          ) : filteredRedacoes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma redação encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Os alunos ainda não enviaram redações'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRedacoes.map((redacao) => (
                <div key={redacao.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{redacao.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        Tema: {redacao.temas_redacao?.titulo}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {redacao.students?.name} ({redacao.students?.codigo || redacao.students?.ra})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(redacao.created_at).toLocaleString()}
                        </span>
                        <span>{redacao.palavras} palavras</span>
                        <span>{formatTempo(redacao.tempo_ms)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {redacao.status === 'corrigida' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Star className="w-3 h-3 mr-1" />
                          {getNotaFinal(redacao)}/1000
                        </Badge>
                      )}
                      <Badge variant={getStatusColor(redacao.status)}>
                        {redacao.status === 'enviada' && <Clock className="w-3 h-3 mr-1" />}
                        {redacao.status === 'corrigida' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {redacao.status.charAt(0).toUpperCase() + redacao.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {redacao.conteudo.substring(0, 200)}...
                  </p>

                  <div className="flex justify-between items-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRedacao(redacao)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{selectedRedacao?.titulo}</DialogTitle>
                        </DialogHeader>
                        {selectedRedacao && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Aluno:</span> {selectedRedacao.students?.name}
                              </div>
                              <div>
                                <span className="font-medium">Código:</span> {selectedRedacao.students?.codigo || selectedRedacao.students?.ra}
                              </div>
                              <div>
                                <span className="font-medium">Tema:</span> {selectedRedacao.temas_redacao?.titulo}
                              </div>
                              <div>
                                <span className="font-medium">Data:</span> {new Date(selectedRedacao.created_at).toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Palavras:</span> {selectedRedacao.palavras}
                              </div>
                              <div>
                                <span className="font-medium">Tempo:</span> {formatTempo(selectedRedacao.tempo_ms)}
                              </div>
                            </div>

                            {selectedRedacao.temas_redacao?.texto_motivador && (
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-semibold mb-2">Texto Motivador</h4>
                                <p className="text-sm whitespace-pre-line">
                                  {selectedRedacao.temas_redacao.texto_motivador}
                                </p>
                              </div>
                            )}

                            <div>
                              <h4 className="font-semibold mb-2">Redação</h4>
                              <div className="p-4 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
                                <p className="text-sm whitespace-pre-line">
                                  {selectedRedacao.conteudo}
                                </p>
                              </div>
                            </div>

                            {selectedRedacao.status === 'corrigida' && selectedRedacao.feedback && selectedRedacao.notas && (
                              <div className="space-y-4">
                                <h4 className="font-semibold">Correção</h4>
                                
                                <div className="grid grid-cols-5 gap-4">
                                  {Object.entries(selectedRedacao.notas).map(([comp, dados]: [string, any]) => (
                                    <div key={comp} className="text-center p-3 border rounded-lg">
                                      <div className="text-xs text-muted-foreground font-medium mb-1">
                                        {comp.replace('competencia_', 'Competência ')}
                                      </div>
                                      <div className="text-lg font-bold">
                                        {dados.nota}/200
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-2">
                                        {dados.justificativa}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                  <div className="text-xl font-bold text-green-800">
                                    Nota Final: {selectedRedacao.feedback.nota_final}/1000
                                  </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <h5 className="font-medium mb-2">Feedback Geral</h5>
                                  <p className="text-sm">{selectedRedacao.feedback.feedback_geral}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {redacao.status === 'enviada' && (
                      <Button 
                        onClick={() => solicitarCorrecao(redacao.id)}
                        disabled={correcting === redacao.id}
                        size="sm"
                      >
                        {correcting === redacao.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Solicitar Correção
                      </Button>
                    )}
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