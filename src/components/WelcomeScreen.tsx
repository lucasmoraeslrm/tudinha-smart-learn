import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BookOpen, Sparkles, Target } from 'lucide-react';
import mascotImage from '@/assets/tudinha-mascot.png';

interface WelcomeScreenProps {
  onUserSetup: (name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onUserSetup }) => {
  const [name, setName] = useState('');

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
                src={mascotImage} 
                alt="Tudinha - IA Tutora" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Welcome Text */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Tudinha
            </h1>
            <p className="text-lg text-muted-foreground">
              Sua IA tutora personalizada
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
              Começar a estudar com a Tudinha! 🚀
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeScreen;