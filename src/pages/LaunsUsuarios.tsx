import React from 'react';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Shield, GraduationCap, BookOpen, UserCheck } from 'lucide-react';

export default function LaunsUsuarios() {
  const userStats = [
    { title: 'Total de Usuários', value: '2,847', icon: Users, color: 'text-blue-400' },
    { title: 'Estudantes', value: '2,234', icon: GraduationCap, color: 'text-green-400' },
    { title: 'Professores', value: '456', icon: BookOpen, color: 'text-purple-400' },
    { title: 'Administradores', value: '157', icon: Shield, color: 'text-red-400' },
  ];

  const recentUsers = [
    { id: 1, name: 'Maria Silva', email: 'maria@escola1.com', role: 'Estudante', school: 'Escola ABC', joinedAt: '2 dias atrás' },
    { id: 2, name: 'João Santos', email: 'joao@escola2.com', role: 'Professor', school: 'Colégio XYZ', joinedAt: '3 dias atrás' },
    { id: 3, name: 'Ana Costa', email: 'ana@escola1.com', role: 'Administrador', school: 'Escola ABC', joinedAt: '1 semana atrás' },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Estudante':
        return <Badge className="bg-green-500 hover:bg-green-600">{role}</Badge>;
      case 'Professor':
        return <Badge className="bg-purple-500 hover:bg-purple-600">{role}</Badge>;
      case 'Administrador':
        return <Badge className="bg-red-500 hover:bg-red-600">{role}</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{role}</Badge>;
    }
  };

  return (
    <LaunsLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Gerenciar Usuários
            </h1>
            <p className="text-white/80">
              Visualize e gerencie todos os usuários da plataforma
            </p>
          </div>
          <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {userStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Usuários Recentes
            </CardTitle>
            <CardDescription className="text-white/70">
              Últimos usuários cadastrados na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{user.name}</h3>
                      <p className="text-sm text-white/60">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-white/80">{user.school}</p>
                      <p className="text-xs text-white/60">{user.joinedAt}</p>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </LaunsLayout>
  );
}