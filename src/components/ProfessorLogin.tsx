import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';
import { supabase } from '@/integrations/supabase/client';

interface ProfessorLoginProps {
  onBack: () => void;
  onSuccess: (professorData: any) => void;
}

const ProfessorLogin: React.FC<ProfessorLoginProps> = ({ onBack, onSuccess }) => {
  const { instancia } = useParams();
  const { branding } = useSchoolBranding(instancia);
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('verify_professor_password', {
        input_codigo: codigo,
        input_password: password
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const professorData = data[0].professor_data as any;
        
        // A função verify_professor_password já verificou a senha
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, Professor ${professorData.nome}`,
        });
        
        // Salvar dados do professor no localStorage
        localStorage.setItem('professorSession', JSON.stringify({
          id: professorData.id,
          nome: professorData.nome,
          codigo: professorData.codigo,
          escola_id: professorData.escola_id,
          email: professorData.email,
          loginTime: new Date().toISOString()
        }));
        
        onSuccess(professorData);
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
                <UserCircle className="w-10 h-10" />
              </div>
            )}
            <h1 className="text-4xl font-bold mb-4">
              {branding?.nome || "Portal Educacional"}
            </h1>
            <p className="text-xl opacity-90">
              Área exclusiva para professores
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="absolute left-4 top-4 lg:left-auto lg:right-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

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
                  <UserCircle className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Portal do Professor
            </h2>
            <p className="text-muted-foreground">
              Entre com seu código e senha para acessar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Professor</Label>
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
};

export default ProfessorLogin;