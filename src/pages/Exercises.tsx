import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

const Exercises = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar automaticamente para a nova página de exercícios
    navigate('/exercicios', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Redirecionando...</h2>
          <p className="text-muted-foreground mb-4">
            Você será redirecionado para a nova página de exercícios.
          </p>
          <Button onClick={() => navigate('/exercicios')}>
            Ir para Exercícios
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Exercises;