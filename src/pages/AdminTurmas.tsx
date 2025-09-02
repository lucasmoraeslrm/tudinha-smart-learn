import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import SchoolTurmasCRUD from '@/components/SchoolTurmasCRUD';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminTurmas() {
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
        <SchoolTurmasCRUD schoolId={escola.id} />
      </div>
    </AdminLayout>
  );
}