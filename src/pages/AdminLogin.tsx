import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, User, GraduationCap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AdminLogin() {
  // School Admin/Coordinator (Supabase Auth)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Professor login
  const [professorCodigo, setProfessorCodigo] = useState('');
  const [professorPassword, setProfessorPassword] = useState('');
  
  // Student login
  const [studentCodigo, setStudentCodigo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [maquinaCodigo, setMaquinaCodigo] = useState('');
  
  // Parent login
  const [parentCodigo, setParentCodigo] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const { signIn, signInStudent, user, profile, studentSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check existing sessions and redirect
  useEffect(() => {
    const professorSession = localStorage.getItem('professorSession');
    const parentSession = localStorage.getItem('parentSession');
    
    if (user && profile) {
      if (profile.role === 'school_admin' || profile.role === 'coordinator') {
        navigate('/admin/dashboard');
      } else if (profile.role === 'admin') {
        navigate('/launs/dashboard');
      }
    } else if (studentSession) {
      navigate('/dashboard');
    } else if (professorSession) {
      navigate('/professor/dashboard');
    } else if (parentSession) {
      navigate('/pais/dashboard');
    }
  }, [user, profile, studentSession, navigate]);

  const clearOtherSessions = () => {
    localStorage.removeItem('professorSession');
    localStorage.removeItem('parentSession');
  };

  const handleSchoolLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      clearOtherSessions();
      
      // First, try regular Supabase Auth login
      const { error } = await signIn(email, password);
      
      if (error) {
        // If login failed, try to provision coordinator
        console.log('Auth login failed, checking coordinator provisioning...');
        
        const { data: provisionResult, error: provisionError } = await supabase.functions.invoke(
          'provision-coordinator-auth',
          {
            body: { email, password }
          }
        );

        if (provisionError) {
          console.error('Provision error:', provisionError);
          throw new Error(error.message || "Credenciais inválidas. Verifique seu email e senha.");
        }

        if (provisionResult?.success) {
          // Provisioning successful, retry login
          console.log('Coordinator provisioned, retrying login...');
          const { error: retryError } = await signIn(email, password);
          
          if (retryError) {
            throw new Error("Usuário provisionado mas falha no login. Tente novamente.");
          }
        } else {
          throw new Error(error.message || "Credenciais inválidas. Tente novamente.");
        }
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Portal da Escola!",
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

  const handleProfessorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      clearOtherSessions();
      const { data, error } = await supabase.rpc('verify_professor_password', {
        input_codigo: professorCodigo,
        input_password: professorPassword
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const professorData = data[0].professor_data as any;
        
        if (professorPassword === professorData.password_hash) {
          localStorage.setItem('professorSession', JSON.stringify({
            id: professorData.id,
            nome: professorData.nome,
            codigo: professorData.codigo,
            materias: professorData.materias,
            loginTime: new Date().toISOString()
          }));
          
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, Professor ${professorData.nome}`,
          });
          
          navigate('/professor/dashboard');
        } else {
          throw new Error('Código ou senha incorretos');
        }
      } else {
        throw new Error('Professor não encontrado');
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Código ou senha incorretos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      clearOtherSessions();
      const { error } = await signInStudent(studentCodigo, studentPassword);
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Código ou senha incorretos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      clearOtherSessions();
      // TODO: Implement parent authentication via database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const parentData = {
        id: '1',
        codigo: parentCodigo,
        nome: 'Responsável',
        role: 'parent'
      };
      
      localStorage.setItem('parentSession', JSON.stringify(parentData));
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao Portal dos Pais!"
      });
      
      navigate('/pais/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: "Código ou senha incorretos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
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
          <CardTitle className="text-2xl">
            Hub de Acesso
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Colégio Almeida Garrett - Escolha seu tipo de acesso
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="escola" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="escola" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Escola
              </TabsTrigger>
              <TabsTrigger value="professor" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Professor
              </TabsTrigger>
              <TabsTrigger value="aluno" className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                Aluno
              </TabsTrigger>
              <TabsTrigger value="pais" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Pais
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="escola">
              <div className="text-center mb-4">
                <h3 className="font-semibold">Portal da Escola</h3>
                <p className="text-sm text-muted-foreground">Direção e Coordenação</p>
              </div>
              <form onSubmit={handleSchoolLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school-email">Email</Label>
                  <Input
                    id="school-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@escola.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="school-password">Senha</Label>
                  <Input
                    id="school-password"
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
                    'Acessar Portal da Escola'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="professor">
              <div className="text-center mb-4">
                <h3 className="font-semibold">Portal do Professor</h3>
                <p className="text-sm text-muted-foreground">Acesso com código e senha</p>
              </div>
              <form onSubmit={handleProfessorLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prof-codigo">Código do Professor</Label>
                  <Input
                    id="prof-codigo"
                    type="text"
                    value={professorCodigo}
                    onChange={(e) => setProfessorCodigo(e.target.value)}
                    placeholder="Ex: PROF001"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prof-password">Senha</Label>
                  <Input
                    id="prof-password"
                    type="password"
                    value={professorPassword}
                    onChange={(e) => setProfessorPassword(e.target.value)}
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
                    'Entrar como Professor'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="aluno">
              <div className="text-center mb-4">
                <h3 className="font-semibold">Portal do Aluno</h3>
                <p className="text-sm text-muted-foreground">Entre com seu código e senha</p>
              </div>
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-codigo">Código do Aluno</Label>
                  <Input
                    id="student-codigo"
                    type="text"
                    value={studentCodigo}
                    onChange={(e) => setStudentCodigo(e.target.value)}
                    placeholder="Digite seu código"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="student-password">Senha</Label>
                  <Input
                    id="student-password"
                    type="password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-maquina">Código da Máquina</Label>
                  <Input
                    id="student-maquina"
                    type="text"
                    value={maquinaCodigo}
                    onChange={(e) => setMaquinaCodigo(e.target.value)}
                    placeholder="Ex: LAB01-PC05"
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
                    'Entrar como Aluno'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="pais">
              <div className="text-center mb-4">
                <h3 className="font-semibold">Portal dos Pais</h3>
                <p className="text-sm text-muted-foreground">Acompanhe o desenvolvimento do seu filho</p>
              </div>
              <form onSubmit={handleParentLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parent-codigo">Código do Responsável</Label>
                  <Input
                    id="parent-codigo"
                    type="text"
                    value={parentCodigo}
                    onChange={(e) => setParentCodigo(e.target.value)}
                    placeholder="Digite seu código"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parent-password">Senha</Label>
                  <Input
                    id="parent-password"
                    type="password"
                    value={parentPassword}
                    onChange={(e) => setParentPassword(e.target.value)}
                    placeholder="Digite sua senha"
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
                    'Entrar como Responsável'
                  )}
                </Button>
              </form>
            </TabsContent>
            
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}