import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Shield } from 'lucide-react';

interface UserTypeSelectorProps {
  onSelectUserType: (type: 'student' | 'professor' | 'coordenador') => void;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ onSelectUserType }) => {
  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <img 
            src="/src/assets/colegio-almeida-garrett.png" 
            alt="Colégio Almeida Garrett" 
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground mb-2">Portal Educacional</h1>
          <p className="text-muted-foreground">Selecione seu tipo de acesso</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" 
                onClick={() => onSelectUserType('student')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Portal do Aluno</CardTitle>
              <CardDescription>
                Acesse suas jornadas, exercícios e chat com IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Acessar Portal
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => onSelectUserType('professor')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-xl">Painel do Professor</CardTitle>
              <CardDescription>
                Monitore alunos e gerencie jornadas em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Acessar Painel
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => onSelectUserType('coordenador')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-xl">Coordenação</CardTitle>
              <CardDescription>
                Relatórios, estatísticas e gestão pedagógica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Acessar Sistema
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;