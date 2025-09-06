import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentLoginProps {
  onBack?: () => void;
}

export default function StudentLogin({ onBack }: StudentLoginProps) {
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [maquinaCodigo, setMaquinaCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInStudent, user, profile, studentSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redireciona usuários já logados
  useEffect(() => {
    if (user && profile?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (studentSession) {
      navigate('/dashboard');
    }
  }, [user, profile, studentSession, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signInStudent(codigo, password);
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error,
          variant: "destructive",
        });
        return;
      }

      // TODO: Registrar login com código da máquina
      // Para implementar depois: salvar log de login com maquinaCodigo

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
      
      if (!onBack) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Portal do Aluno</CardTitle>
          <p className="text-sm text-muted-foreground">
            Entre com seu código e senha para acessar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Aluno</Label>
              <Input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Digite seu código"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maquina">Código da Máquina</Label>
              <Input
                id="maquina"
                type="text"
                placeholder="Ex: LAB01-PC05"
                value={maquinaCodigo}
                onChange={(e) => setMaquinaCodigo(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}