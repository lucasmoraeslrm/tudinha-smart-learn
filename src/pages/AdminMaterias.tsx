import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import SchoolMateriasCRUD from '@/components/SchoolMateriasCRUD';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminMaterias() {
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
        <SchoolMateriasCRUD schoolId={escola.id} />
      </div>
    </AdminLayout>
  );
}