import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Login administrativo realizado!",
        description: "Bem-vindo ao painel admin!",
      });
      
      navigate('/admin/dashboard');
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);

    try {
      const { error } = await signUp(newEmail, newPassword, newName, 'admin');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Conta admin criada!",
        description: "Verifique seu email para confirmar a conta.",
      });
      
      // Reset form
      setNewEmail('');
      setNewPassword('');
      setNewName('');
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Não foi possível criar a conta.",
        variant: "destructive",
      });
    } finally {
      setSignupLoading(false);
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
            <Shield className="h-5 w-5" />
            Acesso Administrativo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Colégio Almeida Garrett
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="login">Login Administrativo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@colegio.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Senha</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha de admin"
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
                    'Entrar como Admin'
                  )}
                </Button>
              </form>
            </TabsContent>
            
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Acesso de aluno?
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Login Aluno
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}