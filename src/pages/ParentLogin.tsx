import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';

export default function ParentLogin() {
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement parent authentication
      // For now, just simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const parentData = {
        id: '1',
        codigo,
        nome: 'Responsável',
        role: 'parent'
      };
      
      localStorage.setItem('parentSession', JSON.stringify(parentData));
      
      toast({
        title: "Login realizado com sucesso",
        description: "Redirecionando para o painel..."
      });
      
      navigate('/pais/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: "Credenciais inválidas"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Painel dos Pais</CardTitle>
          <CardDescription>
            Acompanhe o desenvolvimento do seu filho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="codigo" className="text-sm font-medium">
                Código do Responsável
              </label>
              <Input
                id="codigo"
                type="text"
                placeholder="Digite seu código"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
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
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="text-sm"
            >
              ← Voltar para login do aluno
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}