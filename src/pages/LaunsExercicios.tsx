import React, { useState } from 'react';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Search, Filter } from 'lucide-react';
import ImportExerciseJSON from '@/components/ImportExerciseJSON';
import ExerciseCollectionsList from '@/components/ExerciseCollectionsList';
import ExercisePlayer from '@/components/ExercisePlayer';

export default function LaunsExercicios() {
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectCollection = (collection: any) => {
    setSelectedCollection(collection);
  };

  const handleBack = () => {
    setSelectedCollection(null);
    setRefreshKey(prev => prev + 1); // Refresh the collections list
  };

  if (selectedCollection) {
    return (
      <LaunsLayout>
        <div className="p-6">
          <ExercisePlayer
            collectionId={selectedCollection.id}
            collectionName={`${selectedCollection.materia} - ${selectedCollection.serie_escolar}`}
            onBack={handleBack}
          />
        </div>
      </LaunsLayout>
    );
  }

  return (
    <LaunsLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Lista de Exercícios
            </h1>
            <p className="text-muted-foreground">
              Gerencie e importe exercícios organizados por matéria e assunto
            </p>
          </div>
          <ImportExerciseJSON onImportSuccess={() => setRefreshKey(prev => prev + 1)} />
        </div>

        <ExerciseCollectionsList 
          key={refreshKey}
          onSelectCollection={handleSelectCollection}
        />
      </div>
    </LaunsLayout>
  );
}