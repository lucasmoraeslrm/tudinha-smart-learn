import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfessorLoginProps {
  onBack: () => void;
  onSuccess: (professorData: any) => void;
}

const ProfessorLogin: React.FC<ProfessorLoginProps> = ({ onBack, onSuccess }) => {
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
        
        // Verificar senha simples (em produção usar hash)
        if (password === professorData.password_hash) {
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, Professor ${professorData.nome}`,
          });
          
          // Salvar dados do professor no localStorage
          localStorage.setItem('professorSession', JSON.stringify({
            id: professorData.id,
            nome: professorData.nome,
            codigo: professorData.codigo,
            materias: professorData.materias,
            loginTime: new Date().toISOString()
          }));
          
          onSuccess(professorData);
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

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-secondary" />
          </div>
          <CardTitle className="text-2xl">Painel do Professor</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o painel
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Professor</Label>
              <Input
                id="codigo"
                type="text"
                placeholder="Ex: PROF001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessorLogin;