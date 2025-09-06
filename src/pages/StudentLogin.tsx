import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';
import { Loader2, ArrowLeft, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentLoginProps {
  onBack?: () => void;
}

export default function StudentLogin({ onBack }: StudentLoginProps) {
  const { instancia } = useParams();
  const { branding } = useSchoolBranding(instancia);
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

  const primaryColor = branding?.cor_primaria || '#3B82F6';
  const secondaryColor = branding?.cor_secundaria || '#1E40AF';

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Gradient */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: branding?.login_image_url 
            ? `linear-gradient(135deg, ${primaryColor}AA, ${secondaryColor}AA), url(${branding.login_image_url})`
            : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: branding?.login_image_url ? 'overlay' : 'normal'
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            {branding?.logo_url ? (
              <img 
                src={branding.logo_url} 
                alt={branding.nome}
                className="mx-auto h-20 w-auto mb-6 filter brightness-0 invert"
              />
            ) : (
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10" />
              </div>
            )}
            <h1 className="text-4xl font-bold mb-4">
              {branding?.nome || "Portal Educacional"}
            </h1>
            <p className="text-xl opacity-90">
              Bem-vindo ao seu ambiente de aprendizado
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="absolute left-4 top-4 lg:left-auto lg:right-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}

          <div className="text-center mb-8">
            {/* Mobile logo */}
            <div className="lg:hidden mb-6">
              {branding?.logo_url ? (
                <img 
                  src={branding.logo_url} 
                  alt={branding.nome}
                  className="mx-auto h-16 w-auto"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Portal do Aluno
            </h2>
            <p className="text-muted-foreground">
              Entre com seu código e senha para acessar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Aluno</Label>
              <Input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Digite seu código"
                className="h-12"
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
                className="h-12"
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
                className="h-12"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg" 
              disabled={loading}
              style={{ 
                backgroundColor: primaryColor,
                borderColor: primaryColor 
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}