import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock, 
  Award, 
  MessageCircle,
  Star,
  Calendar,
  List
} from 'lucide-react';

interface DashboardProps {
  userName: string;
  onStartChat: () => void;
  onViewExercises?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userName, onStartChat, onViewExercises }) => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    exercisesCompleted: 0,
    correctAnswers: 0,
    listsCompleted: 0,
    favoriteSubjects: [] as string[],
    weeklyProgress: 0,
    recentTopics: [] as string[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const studentId = localStorage.getItem('tudinha_student_id');
      const userId = `user_${userName.toLowerCase().replace(/\s+/g, '_')}`;
      
      // Load message count
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id')
        .eq('user_id', userId);
      
      // Load exercise stats if student exists
      let exerciseStats = { 
        completed: 0, 
        correct: 0, 
        listsCompleted: 0,
        subjectCounts: {} as Record<string, number>,
        recentTopics: [] as string[]
      };
      
      if (studentId) {
        const { data: answersData } = await supabase
          .from('student_answers')
          .select(`
            is_correct, 
            list_id,
            exercises!exercise_id(subject, title)
          `)
          .eq('student_id', studentId)
          .order('answered_at', { ascending: false })
          .limit(50);
        
        if (answersData) {
          exerciseStats.completed = answersData.length;
          exerciseStats.correct = answersData.filter(a => a.is_correct).length;
          
          // Count unique lists completed
          const uniqueLists = new Set(answersData.map(a => a.list_id).filter(Boolean));
          exerciseStats.listsCompleted = uniqueLists.size;
          
          // Count by subject for favorites
          answersData.forEach(answer => {
            const subject = answer.exercises?.subject;
            if (subject) {
              exerciseStats.subjectCounts[subject] = (exerciseStats.subjectCounts[subject] || 0) + 1;
            }
          });
          
          // Get recent topics
          exerciseStats.recentTopics = answersData
            .slice(0, 10)
            .map(a => a.exercises?.title)
            .filter(Boolean)
            .slice(0, 4);
        }
      }
      
      // Get favorite subjects (top 3 by exercise count)
      const favoriteSubjects = Object.entries(exerciseStats.subjectCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([subject]) => subject);
      
      const weeklyProgress = Math.min(Math.round((exerciseStats.completed / 10) * 100), 100);
      
      setStats({
        totalMessages: messagesData?.length || 0,
        exercisesCompleted: exerciseStats.completed,
        correctAnswers: exerciseStats.correct,
        listsCompleted: exerciseStats.listsCompleted,
        favoriteSubjects,
        weeklyProgress,
        recentTopics: exerciseStats.recentTopics
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const accuracy = stats.exercisesCompleted > 0 ? Math.round((stats.correctAnswers / stats.exercisesCompleted) * 100) : 0;

  const goals = [
    { id: 1, text: 'Completar 10 exercícios', progress: Math.min((stats.exercisesCompleted / 10) * 100, 100), subject: 'Geral' },
    { id: 2, text: 'Atingir 80% de acertos', progress: accuracy > 80 ? 100 : (accuracy / 80) * 100, subject: 'Precisão' },
    { id: 3, text: 'Explorar 3 listas diferentes', progress: Math.min((stats.listsCompleted / 3) * 100, 100), subject: 'Variedade' }
  ];

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Olá, {userName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Vamos continuar seus estudos com a Tudinha
            </p>
          </div>
          <Button onClick={onStartChat} variant="educational" className="h-12">
            <MessageCircle className="w-5 h-5 mr-2" />
            Conversar com Tudinha
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 hover:shadow-soft transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalMessages}</p>
                <p className="text-sm text-muted-foreground">Mensagens</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-soft transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.exercisesCompleted}</p>
                <p className="text-sm text-muted-foreground">Exercícios</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-soft transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Acertos</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-soft transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
               <div>
                 <p className="text-2xl font-bold text-foreground">{stats.listsCompleted}</p>
                 <p className="text-sm text-muted-foreground">Listas</p>
               </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-6 hover:shadow-soft transition-all duration-300 cursor-pointer" onClick={onViewExercises}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Exercícios</h3>
                <p className="text-sm text-muted-foreground">Pratique com exercícios interativos</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-soft transition-all duration-300 cursor-pointer" onClick={onStartChat}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-success-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Chat com Tudinha</h3>
                <p className="text-sm text-muted-foreground">Tire suas dúvidas em tempo real</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Progress */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Progresso Semanal</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meta: 10 exercícios</span>
                <span className="font-medium text-foreground">{stats.weeklyProgress}%</span>
              </div>
              <Progress value={stats.weeklyProgress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Continue assim! Você está indo muito bem esta semana 🎉
              </p>
            </div>
          </Card>

          {/* Favorite Subjects */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Matérias Favoritas</h3>
            </div>
            <div className="space-y-3">
              {stats.favoriteSubjects.map((subject, index) => (
                <div key={subject} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                  </div>
                  <span className="text-foreground">{subject}</span>
                  <Star className="w-4 h-4 text-primary ml-auto" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Goals */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Seus Objetivos de Estudo</h3>
          </div>
           <div className="space-y-4">
             {goals.map((goal) => (
               <div key={goal.id} className="space-y-2">
                 <div className="flex justify-between items-center">
                   <div>
                     <p className="font-medium text-foreground">{goal.text}</p>
                     <p className="text-sm text-muted-foreground">{goal.subject}</p>
                   </div>
                   <span className="text-sm font-medium text-primary">{Math.round(goal.progress)}%</span>
                 </div>
                 <Progress value={goal.progress} className="h-2" />
               </div>
             ))}
           </div>
          <Button variant="outline" className="w-full mt-4">
            Adicionar novo objetivo
          </Button>
        </Card>

        {/* Recent Topics */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Tópicos Recentes</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.recentTopics.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-light text-primary rounded-full text-sm hover:bg-primary-glow transition-colors cursor-pointer"
              >
                {topic}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;