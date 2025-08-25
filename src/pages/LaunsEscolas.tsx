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
      <div className="p-6 bg-background min-h-screen">
        <SchoolManager onViewUsers={setSelectedSchool} />
      </div>
    </LaunsLayout>
  );
}