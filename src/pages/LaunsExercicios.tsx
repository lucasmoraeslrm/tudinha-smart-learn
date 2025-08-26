import React from 'react';
import { LaunsLayout } from '@/components/LaunsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Search, Filter } from 'lucide-react';

export default function LaunsExercicios() {
  return (
    <LaunsLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Lista de Exercícios
            </h1>
            <p className="text-muted-foreground">
              Gerencie todos os exercícios disponíveis na plataforma
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Novo Exercício
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Exercícios</p>
                  <p className="text-2xl font-bold text-foreground">247</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Exercícios Ativos</p>
                  <p className="text-2xl font-bold text-foreground">198</p>
                </div>
                <BookOpen className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Em Revisão</p>
                  <p className="text-2xl font-bold text-foreground">49</p>
                </div>
                <BookOpen className="h-8 w-8 text-accent-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BookOpen className="h-5 w-5" />
              Exercícios Recentes
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Últimos exercícios adicionados à plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
              <p className="text-muted-foreground/60 text-sm">Em breve você poderá gerenciar todos os exercícios aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </LaunsLayout>
  );
}