import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import SchoolProfessorsCRUD from '@/components/SchoolProfessorsCRUD';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminProfessores() {
  const { escola } = useAuth();

  if (!escola?.id) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            Carregando dados da escola...
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <SchoolProfessorsCRUD schoolId={escola.id} />
      </div>
    </AdminLayout>
  );
}