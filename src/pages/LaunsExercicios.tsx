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
            <h1 className="text-3xl font-bold text-white mb-2">
              Lista de Exercícios
            </h1>
            <p className="text-white/80">
              Gerencie todos os exercícios disponíveis na plataforma
            </p>
          </div>
          <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
            <Plus className="w-4 h-4 mr-2" />
            Novo Exercício
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total de Exercícios</p>
                  <p className="text-2xl font-bold">247</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Exercícios Ativos</p>
                  <p className="text-2xl font-bold">198</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Em Revisão</p>
                  <p className="text-2xl font-bold">49</p>
                </div>
                <BookOpen className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Exercícios Recentes
            </CardTitle>
            <CardDescription className="text-white/70">
              Últimos exercícios adicionados à plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Funcionalidade em desenvolvimento</p>
              <p className="text-white/40 text-sm">Em breve você poderá gerenciar todos os exercícios aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </LaunsLayout>
  );
}