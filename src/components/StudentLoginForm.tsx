import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';
import { Loader2, GraduationCap } from 'lucide-react';

interface StudentLoginFormProps {
  onBack?: () => void;
  showMobileLogo?: boolean;
}

export default function StudentLoginForm({ onBack, showMobileLogo = true }: StudentLoginFormProps) {
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
          variant: "destructive"
        });
        return;
      }

      // TODO: Registrar login com código da máquina
      // Para implementar depois: salvar log de login com maquinaCodigo

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!"
      });
      
      if (!onBack) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = branding?.cor_primaria || '#3B82F6';

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        {/* Mobile logo */}
        {showMobileLogo && (
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
        )}
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Portal do Aluno
          </h2>
          <p className="text-muted-foreground">
            Entre com seu código e senha para acessar
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="codigo" className="text-sm font-medium">
            Código do Aluno
          </Label>
          <Input 
            id="codigo" 
            type="text" 
            value={codigo} 
            onChange={e => setCodigo(e.target.value)} 
            placeholder="Digite seu código" 
            className="h-11 text-base" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Senha
          </Label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Digite sua senha" 
            className="h-11 text-base" 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maquina" className="text-sm font-medium">
            Código da Máquina
          </Label>
          <Input 
            id="maquina" 
            type="text" 
            placeholder="Ex: LAB01-PC05" 
            value={maquinaCodigo} 
            onChange={e => setMaquinaCodigo(e.target.value)} 
            className="h-11 text-base" 
            required 
          />
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full h-11 text-base font-semibold" 
            disabled={loading}
            style={{
              backgroundColor: primaryColor,
              borderColor: primaryColor
            }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}