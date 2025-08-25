import React, { useState } from 'react';
import { LaunsLayout } from '@/components/LaunsLayout';
import SchoolManager from '@/components/SchoolManager';
import SchoolUsersView from '@/components/SchoolUsersView';
import { School } from '@/hooks/useSchools';

export default function LaunsEscolas() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  if (selectedSchool) {
    return (
      <LaunsLayout>
        <div className="p-6">
          <SchoolUsersView 
            school={selectedSchool} 
            onBack={() => setSelectedSchool(null)} 
          />
        </div>
      </LaunsLayout>
    );
  }

  return (
    <LaunsLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gerenciar Escolas
          </h1>
          <p className="text-white/80">
            Visualize e gerencie todas as escolas da plataforma
          </p>
        </div>
        
        <SchoolManager onViewUsers={setSelectedSchool} />
      </div>
    </LaunsLayout>
  );
}