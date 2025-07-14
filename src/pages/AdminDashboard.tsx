import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminChat } from '@/components/AdminChat';
import { ManageStudents } from '@/components/ManageStudents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, MessageCircle, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img 
                  src="https://storange.tudinha.com.br/colag.png" 
                  alt="Colégio Almeida Garrett" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Painel Administrativo
                </h1>
                <p className="text-sm text-gray-500">
                  Bem-vindo, {profile?.full_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Admin</span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat com IA
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gerenciar Alunos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="max-w-4xl mx-auto">
            <AdminChat />
          </TabsContent>
          
          <TabsContent value="students" className="max-w-4xl mx-auto">
            <ManageStudents />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}