import React, { useState } from 'react';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Button } from '@/components/ui/button';
import SchoolManager from '@/components/SchoolManager';
import SchoolUsersView from '@/components/SchoolUsersView';
import { School } from '@/hooks/useSchools';
import { ArrowLeft } from 'lucide-react';

export default function LaunsEscolas() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  if (selectedSchool) {
    return (
      <LaunsLayout>
        <div className="p-6">
          <div className="mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedSchool(null)}
              className="text-foreground hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          <SchoolUsersView 
            schoolId={selectedSchool.id} 
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