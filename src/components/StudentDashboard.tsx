import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, MessageSquare, BookOpen, User } from 'lucide-react';
import Chat from '@/components/Chat';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { studentSession, signOut, getStudentName } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Get student name from session or fallback to localStorage for compatibility
  const studentName = studentSession?.full_name || studentSession?.name || getStudentName() || 'Estudante';

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header */}
      <div className="bg-background/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 p-2">
              <img 
                src="https://storange.tudinha.com.br/colag.png" 
                alt="Colégio Almeida Garrett" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Colégio Almeida Garrett</h1>
              <p className="text-white/80 text-sm">Sistema de Estudos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {studentSession && (
              <div className="text-white text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{studentName}</span>
                  {studentSession.codigo && (
                    <span className="text-white/60">• {studentSession.codigo}</span>
                  )}
                </div>
                {studentSession.turma && (
                  <div className="text-white/60 text-xs mt-1">
                    {studentSession.turma} - {studentSession.ano_letivo}
                  </div>
                )}
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="chat" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-400">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat com Tudinha
              </TabsTrigger>
              <TabsTrigger value="exercises" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Exercícios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Converse com a Tudinha
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-80px)] p-0">
                  <Chat userName={studentName} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Exercícios e Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Exercícios em Breve</h3>
                    <p className="text-muted-foreground">
                      Esta seção estará disponível em breve com exercícios personalizados.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}