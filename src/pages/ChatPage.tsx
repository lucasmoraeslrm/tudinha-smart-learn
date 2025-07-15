import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import Chat from '@/components/Chat';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatPage() {
  const { getStudentName } = useAuth();
  const studentName = getStudentName() || 'Estudante';

  return (
    <div className="h-full">
      <Card className="h-[calc(100vh-8rem)]">
        <CardContent className="h-full p-0">
          <Chat userName={studentName} />
        </CardContent>
      </Card>
    </div>
  );
}