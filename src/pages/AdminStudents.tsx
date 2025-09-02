import React from 'react';
import SchoolStudentsCRUD from '@/components/SchoolStudentsCRUD';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminStudents() {
  const { escola } = useAuth();

  if (!escola?.id) {
    return (
      <div className="text-center text-muted-foreground">
        Carregando dados da escola...
      </div>
    );
  }

  return <SchoolStudentsCRUD schoolId={escola.id} />;
}