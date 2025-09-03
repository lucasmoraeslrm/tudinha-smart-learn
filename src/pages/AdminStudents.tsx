import React from 'react';
import SchoolStudentsCRUD from '@/components/SchoolStudentsCRUD';
import AdminRedacaoView from '@/components/AdminRedacaoView';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminStudents() {
  const { escola } = useAuth();

  if (!escola?.id) {
    return (
      <div className="text-center text-muted-foreground">
        Carregando dados da escola...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Alunos</h1>
        <p className="text-muted-foreground">Gerencie alunos e suas redações</p>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="redacoes">Redações ENEM</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <SchoolStudentsCRUD schoolId={escola.id} />
        </TabsContent>

        <TabsContent value="redacoes">
          <AdminRedacaoView />
        </TabsContent>
      </Tabs>
    </div>
  );
}