import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import SchoolUsersCRUD from '@/components/SchoolUsersCRUD';

export default function AdminUsuariosCRUD() {
  return (
    <AdminLayout>
      <div className="p-6">
        <SchoolUsersCRUD />
      </div>
    </AdminLayout>
  );
}