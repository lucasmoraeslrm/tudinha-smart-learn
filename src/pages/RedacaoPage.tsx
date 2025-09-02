import React, { useState } from 'react';
import TemasRedacaoList from '@/components/TemasRedacaoList';
import RedacaoEditor from '@/components/RedacaoEditor';
import MinhasRedacoes from '@/components/MinhasRedacoes';

interface TemaRedacao {
  id: string;
  titulo: string;
  texto_motivador: string;
  competencias: any;
}

export default function RedacaoPage() {
  const [currentView, setCurrentView] = useState<'temas' | 'editor' | 'minhas'>('minhas');
  const [selectedTema, setSelectedTema] = useState<TemaRedacao | null>(null);
  const [editingRedacaoId, setEditingRedacaoId] = useState<string | null>(null);

  const handleSelectTema = (tema: TemaRedacao) => {
    setSelectedTema(tema);
    setEditingRedacaoId(null);
    setCurrentView('editor');
  };

  const handleEditRedacao = (redacaoId: string, tema: any) => {
    setSelectedTema(tema);
    setEditingRedacaoId(redacaoId);
    setCurrentView('editor');
  };

  const handleBack = () => {
    setSelectedTema(null);
    setEditingRedacaoId(null);
    setCurrentView('minhas');
  };

  const handleNewRedacao = () => {
    setCurrentView('temas');
  };

  return (
    <div className="container mx-auto p-6">
      {currentView === 'minhas' && (
        <MinhasRedacoes
          onEditRedacao={handleEditRedacao}
          onNewRedacao={handleNewRedacao}
        />
      )}

      {currentView === 'temas' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('minhas')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Voltar para Minhas Redações
            </button>
          </div>
          <TemasRedacaoList onSelectTema={handleSelectTema} />
        </div>
      )}

      {currentView === 'editor' && selectedTema && (
        <RedacaoEditor
          tema={selectedTema}
          onBack={handleBack}
          redacaoId={editingRedacaoId || undefined}
        />
      )}
    </div>
  );
}