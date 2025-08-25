import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Code2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function LaunsLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { signIn, signUp, user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && profile && profile.role === 'admin') {
      navigate('/launs/dashboard');
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        const { error } = await signUp(
          email,
          password,
          fullName || (email.split('@')[0] || 'Admin Launs'),
          'admin'
        );
        if (error) {
          toast({
            variant: "destructive",
            title: "Erro no cadastro",
            description: error.message || "Não foi possível criar a conta"
          });
        } else {
          toast({
            title: "Conta criada",
            description: "Faça login agora com seu email e senha"
          });
          setIsSignup(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Erro no login",
            description: error.message || "Credenciais inválidas"
          });
        } else {
          // Garante que o usuário tenha permissão de admin
          await supabase.rpc('promote_to_admin', { user_email: email });
          toast({
            title: "Login realizado com sucesso",
            description: "Redirecionando para o painel..."
          });
          navigate('/launs/dashboard');
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: isSignup ? "Erro no cadastro" : "Erro no login",
        description: "Ocorreu um erro inesperado"
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
            <Code2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Painel do Desenvolvedor</CardTitle>
          <CardDescription>
            Acesso exclusivo para desenvolvedores Launs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="dev@launs.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {isSignup && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Nome completo
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
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
                  {isSignup ? 'Criando...' : 'Entrando...'}
                </>
              ) : (
                isSignup ? 'Criar conta' : 'Entrar'
              )}
            </Button>
          </form>
          
          <div className="mt-6 flex items-center justify-between">
            <Button 
              variant="ghost"
              onClick={() => setIsSignup((v) => !v)}
              className="text-sm"
            >
              {isSignup ? 'Já tem conta? Entrar' : 'Não tem conta? Criar conta'}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')} 
              className="text-sm"
            >
              ← Voltar para seleção de usuário
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}