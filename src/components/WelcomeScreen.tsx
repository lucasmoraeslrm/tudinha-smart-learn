import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BookOpen, Sparkles, Target, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface WelcomeScreenProps {
  onUserSetup: (name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onUserSetup }) => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUserSetup(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-float border-0 bg-card/80 backdrop-blur-sm">
        <div className="text-center space-y-6">
          {/* Mascot */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-primary p-4 animate-float">
              <img 
                src="https://storange.tudinha.com.br/colag.png" 
                alt="Colégio Almeida Garrett" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Welcome Text */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Colégio Almeida Garrett
            </h1>
            <p className="text-lg text-muted-foreground">
              Sua plataforma de estudos personalizada
            </p>
            <p className="text-sm text-muted-foreground">
              Vou te ajudar com seus estudos, exercícios e a alcançar seus objetivos acadêmicos!
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Explicações</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-success-light rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-success" />
              </div>
              <p className="text-xs text-muted-foreground">Exercícios</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-accent-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Progresso</p>
            </div>
          </div>

          {/* Name Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Como você gostaria de ser chamado(a)?
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center border-2 border-primary/20 focus:border-primary rounded-xl"
                required
              />
            </div>
            <Button 
              type="submit" 
              variant="educational"
              className="w-full h-12"
              disabled={!name.trim()}
            >
              Continuar como visitante 🚀
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Já tem uma conta? Faça login para acessar recursos completos
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 flex-1"
              >
                <User className="h-4 w-4" />
                Login Aluno
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/login')}
                className="flex items-center gap-2 flex-1"
              >
                <Shield className="h-4 w-4" />
                Acesso Admin
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeScreen;