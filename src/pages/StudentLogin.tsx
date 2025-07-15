import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentLogin() {
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redireciona admin logado para dashboard admin
  useEffect(() => {
    if (user && profile?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(codigo, password);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas. Tente novamente.",
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
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-primary p-3">
              <img 
                src="https://storange.tudinha.com.br/colag.png" 
                alt="Colégio Almeida Garrett" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <User className="h-5 w-5" />
            Login do Aluno
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Colégio Almeida Garrett
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
                placeholder="Sua senha"
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

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Acesso administrativo?
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Login Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}