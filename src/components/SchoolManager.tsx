import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { School, useSchools, SchoolModule } from '@/hooks/useSchools';
import { 
  Plus, 
  School as SchoolIcon, 
  Settings, 
  Users, 
  Palette,
  Globe,
  Edit,
  Eye
} from 'lucide-react';

interface SchoolManagerProps {
  onViewUsers: (school: School) => void;
}

export default function SchoolManager({ onViewUsers }: SchoolManagerProps) {
  const navigate = useNavigate();
  const { schools, modules, loading, fetchSchoolModules, toggleSchoolModule } = useSchools();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolModules, setSchoolModules] = useState<SchoolModule[]>([]);


  const handleViewSchool = async (school: School) => {
    setSelectedSchool(school);
    const modules = await fetchSchoolModules(school.id);
    setSchoolModules(modules);
  };

  const handleModuleToggle = async (moduleId: string, ativo: boolean) => {
    if (!selectedSchool) return;
    
    await toggleSchoolModule(selectedSchool.id, moduleId, ativo);
    
    // Atualizar estado local
    setSchoolModules(prev => 
      prev.map(sm => 
        sm.modulo_id === moduleId ? { ...sm, ativo } : sm
      )
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando escolas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Escolas</h2>
          <p className="text-muted-foreground">Controle todas as escolas cadastradas no sistema</p>
        </div>
        
        <Button 
          onClick={() => navigate('/launs/escolas/nova')}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Escola
        </Button>
      </div>

      {schools.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <SchoolIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma escola cadastrada</h3>
          <p className="text-muted-foreground mb-6">Comece criando sua primeira escola no sistema SAAS</p>
          <Button 
            onClick={() => navigate('/launs/escolas/nova')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar primeira escola
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {schools.map((school) => (
            <Card key={school.id} className="border shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SchoolIcon className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg text-foreground font-semibold">{school.nome}</CardTitle>
                  </div>
                  <Badge variant={school.ativa ? "default" : "secondary"} 
                         className={school.ativa ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                    {school.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <CardDescription className="text-muted-foreground">
                  Código: {school.codigo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{school.dominio || "Sem domínio personalizado"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <div className="flex gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: school.cor_primaria }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: school.cor_secundaria }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">Cores da marca</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewSchool(school)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewUsers(school)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Usuários
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/launs/escolas/editar/${school.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de visualização da escola */}
      <Dialog open={!!selectedSchool} onOpenChange={() => setSelectedSchool(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSchool?.nome}</DialogTitle>
            <DialogDescription>
              Configurações e módulos da escola
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {schoolModules.map((schoolModule) => (
                  <div key={schoolModule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{schoolModule.modulos.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {schoolModule.modulos.descricao}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={schoolModule.ativo}
                      onCheckedChange={(checked) => 
                        handleModuleToggle(schoolModule.modulo_id, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}