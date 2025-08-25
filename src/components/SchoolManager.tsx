import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { School, useSchools } from '@/hooks/useSchools';
import { 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Settings,
  Users,
  Download
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface SchoolManagerProps {
  onViewUsers: (school: School) => void;
}

export default function SchoolManager({ onViewUsers }: SchoolManagerProps) {
  const navigate = useNavigate();
  const { schools, loading } = useSchools();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      const matchesSearch = school.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           school.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (school.email && school.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && school.ativa) ||
                           (statusFilter === 'inactive' && !school.ativa);
      
      return matchesSearch && matchesStatus;
    });
  }, [schools, searchTerm, statusFilter]);


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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Escolas</h1>
          <p className="text-muted-foreground">Visualize e gerencie todas as escolas da plataforma</p>
        </div>
        <Button 
          onClick={() => navigate('/launs/escolas/nova')}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Escola
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Pesquisa de Escola..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Aplicar Filtro
            </Button>
          </div>
          
          <div className="mt-4">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar para Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma escola encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchools.map((school, index) => (
                  <TableRow key={school.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{school.nome}</div>
                        {school.nome_fantasia && (
                          <div className="text-sm text-muted-foreground">{school.nome_fantasia}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{school.codigo}</TableCell>
                    <TableCell>{school.email || '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={school.ativa ? "default" : "secondary"}
                        className={school.ativa ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}
                      >
                        {school.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(school.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/launs/escolas/detalhes/${school.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/launs/escolas/editar/${school.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewUsers(school)}>
                            <Users className="mr-2 h-4 w-4" />
                            Usuários
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/launs/escolas/config/${school.id}`)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Configurações
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}