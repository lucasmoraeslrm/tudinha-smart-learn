import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Clock, Trophy, Users, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EmptyExerciseState from './EmptyExerciseState';

interface ExerciseCollection {
  id: string;
  materia: string;
  serie_escolar: string;
  created_at: string;
  topics_count: number;
  total_exercises: number;
}

interface ExerciseCollectionsListProps {
  onSelectCollection: (collection: ExerciseCollection) => void;
  onManageCollection: (collection: ExerciseCollection) => void;
}

export default function ExerciseCollectionsList({ onSelectCollection, onManageCollection }: ExerciseCollectionsListProps) {
  const [collections, setCollections] = useState<ExerciseCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCollection, setEditingCollection] = useState<ExerciseCollection | null>(null);
  const [editForm, setEditForm] = useState({ materia: '', serie_escolar: '' });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_collections')
        .select(`
          *,
          exercise_topics (
            id,
            topic_exercises (
              id
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const collectionsWithCounts = data.map(collection => ({
        ...collection,
        topics_count: collection.exercise_topics?.length || 0,
        total_exercises: collection.exercise_topics?.reduce((total: number, topic: any) => 
          total + (topic.topic_exercises?.length || 0), 0) || 0
      }));

      setCollections(collectionsWithCounts);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as coleções de exercícios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (collection: ExerciseCollection) => {
    setEditingCollection(collection);
    setEditForm({
      materia: collection.materia,
      serie_escolar: collection.serie_escolar
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCollection) return;

    try {
      const { error } = await supabase
        .from('exercise_collections')
        .update({
          materia: editForm.materia,
          serie_escolar: editForm.serie_escolar
        })
        .eq('id', editingCollection.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Coleção atualizada com sucesso",
      });

      setIsEditDialogOpen(false);
      loadCollections();
    } catch (error) {
      console.error('Error updating collection:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a coleção",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (collectionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('exercise_collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Coleção excluída com sucesso",
      });

      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a coleção",
        variant: "destructive"
      });
    }
  };

  const totalCollections = collections.length;
  const totalTopics = collections.reduce((sum, collection) => sum + collection.topics_count, 0);
  const totalExercises = collections.reduce((sum, collection) => sum + collection.total_exercises, 0);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Carregando exercícios...</p>
      </div>
    );
  }

  if (collections.length === 0) {
    return <EmptyExerciseState onDataAdded={loadCollections} />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Coleções</p>
                <p className="text-2xl font-bold text-foreground">{totalCollections}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Tópicos</p>
                <p className="text-2xl font-bold text-foreground">{totalTopics}</p>
              </div>
              <Trophy className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Exercícios</p>
                <p className="text-2xl font-bold text-foreground">{totalExercises}</p>
              </div>
              <Users className="h-8 w-8 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Card key={collection.id} className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground">{collection.materia}</CardTitle>
                  <CardDescription>{collection.serie_escolar}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {collection.topics_count} tópicos
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(collection)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(collection.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{collection.total_exercises} exercícios</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>~{collection.total_exercises * 2} min estimados</span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => onSelectCollection(collection)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Iniciar Exercícios
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onManageCollection(collection)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Gerenciar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Coleção</DialogTitle>
            <DialogDescription>
              Edite as informações da coleção de exercícios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-materia">Matéria</Label>
              <Input
                id="edit-materia"
                value={editForm.materia}
                onChange={(e) => setEditForm(prev => ({ ...prev, materia: e.target.value }))}
                placeholder="Ex: Matemática"
              />
            </div>
            <div>
              <Label htmlFor="edit-serie">Série Escolar</Label>
              <Input
                id="edit-serie"
                value={editForm.serie_escolar}
                onChange={(e) => setEditForm(prev => ({ ...prev, serie_escolar: e.target.value }))}
                placeholder="Ex: 7º Ano"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}