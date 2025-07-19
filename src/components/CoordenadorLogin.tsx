import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CoordenadorLoginProps {
  onBack: () => void;
  onSuccess: (coordenadorData: any) => void;
}

const CoordenadorLogin: React.FC<CoordenadorLoginProps> = ({ onBack, onSuccess }) => {
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('verify_coordenador_password', {
        input_codigo: codigo,
        input_password: password
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const coordenadorData = data[0].coordenador_data as any;
        
        // Verificar senha simples (em produção usar hash)
        if (password === coordenadorData.password_hash) {
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, ${coordenadorData.nome}`,
          });
          
          // Salvar dados do coordenador no localStorage
          localStorage.setItem('coordenadorSession', JSON.stringify({
            id: coordenadorData.id,
            nome: coordenadorData.nome,
            codigo: coordenadorData.codigo,
            funcao: coordenadorData.funcao,
            loginTime: new Date().toISOString()
          }));
          
          onSuccess(coordenadorData);
        } else {
          throw new Error('Código ou senha incorretos');
        }
      } else {
        throw new Error('Coordenador não encontrado');
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
          
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl">Painel da Coordenação</CardTitle>
          <CardDescription>
            Acesso para coordenadores e diretores
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código de Acesso</Label>
              <Input
                id="codigo"
                type="text"
                placeholder="Ex: COORD001"
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

export default CoordenadorLogin;