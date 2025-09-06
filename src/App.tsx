import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ProtectedLaunsRoute } from "./components/ProtectedLaunsRoute";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import JornadaPage from "./pages/JornadaPage";
import ChatPage from "./pages/ChatPage";
import ExerciciosPage from "./pages/ExerciciosPage";
import StudentRedacao from "./pages/StudentRedacao";
import ExerciseCollectionView from "./pages/ExerciseCollectionView";
import TopicExerciseView from "./pages/TopicExerciseView";
import StudentLayout from "./components/StudentLayout";
import AdminLayout from "./components/AdminLayout";
import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminChat from "./pages/AdminChat";
import AdminStudents from "./pages/AdminStudents";
import AdminJornadas from "./pages/AdminJornadas";
import AdminProfessores from "./pages/AdminProfessores";
import AdminUsuariosCRUD from "./pages/AdminUsuariosCRUD";
import AdminMaterias from "./pages/AdminMaterias";
import AdminTurmas from "./pages/AdminTurmas";
import ProfessorLayout from "./components/ProfessorLayout";
import ProfessorDashboardPage from "./pages/ProfessorDashboardPage";
import ProfessorStudents from "./pages/ProfessorStudents";
import ProfessorJornadas from "./pages/ProfessorJornadas";
import ProfessorHistorico from "./pages/ProfessorHistorico";
import ProfessorExercicios from "./pages/ProfessorExercicios";
import LaunsLogin from "./pages/LaunsLogin";
import LaunsDashboard from "./pages/LaunsDashboard";
import LaunsEscolas from "./pages/LaunsEscolas";
import LaunsEscolaForm from "./pages/LaunsEscolaForm";
import LaunsEscolaDetails from "./pages/LaunsEscolaDetails";
import LaunsEscolaConfig from "./pages/LaunsEscolaConfig";
import LaunsExercicios from "./pages/LaunsExercicios";
import LaunsSystemStatus from "./pages/LaunsSystemStatus";
import LaunsWebhooks from "./pages/LaunsWebhooks";
import LaunsUsuarios from "./pages/LaunsUsuarios";
import ProjectStatus from "./pages/ProjectStatus";
import ParentLogin from "./pages/ParentLogin";
import ParentDashboard from "./pages/ParentDashboard";
import PublicStatus from "./pages/PublicStatus";
import DocsAcessos from "./pages/DocsAcessos";
import LaunsIAEnem from "./pages/LaunsIAEnem";
import ProfessorPageWrapper from "@/components/ProfessorPageWrapper";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log("App component rendering, React:", React);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            {/* Instance-based routes */}
            <Route path="/:instancia" element={<Index />} />
            <Route path="/:instancia/admin" element={<AdminLogin />} />
            <Route path="/:instancia/professor" element={<ProfessorLayout />} />
            <Route path="/:instancia/pais" element={<ParentLogin />} />
            
            {/* Instance-based Student Routes */}
            <Route path="/:instancia/dashboard" element={
              <ProtectedRoute>
                <StudentLayout>
                  <DashboardPage />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/:instancia/jornada" element={
              <ProtectedRoute>
                <StudentLayout>
                  <JornadaPage />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/:instancia/chat" element={
              <ProtectedRoute>
                <StudentLayout>
                  <ChatPage />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/:instancia/exercicios" element={
              <ProtectedRoute>
                <StudentLayout>
                  <ExerciciosPage />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/:instancia/redacao" element={
              <ProtectedRoute>
                <StudentLayout>
                  <StudentRedacao />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/:instancia/colecao/:collectionId" element={
              <ProtectedRoute>
                <StudentLayout>
                  <ExerciseCollectionView />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/:instancia/topico/:topicId" element={
              <ProtectedRoute>
                <StudentLayout>
                  <TopicExerciseView />
                </StudentLayout>
              </ProtectedRoute>
            } />
            
            {/* Main Student Access */}
            <Route path="/" element={<Index />} />
            
            {/* Student Routes with Layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <StudentLayout>
                  <DashboardPage />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/jornada" element={
              <ProtectedRoute>
                <StudentLayout>
                  <JornadaPage />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <StudentLayout>
                  <ChatPage />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/exercicios" element={
              <ProtectedRoute>
                <StudentLayout>
                  <ExerciciosPage />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/redacao" element={
              <ProtectedRoute>
                <StudentLayout>
                  <StudentRedacao />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/colecao/:collectionId" element={
              <ProtectedRoute>
                <StudentLayout>
                  <ExerciseCollectionView />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/topico/:topicId" element={
              <ProtectedRoute>
                <StudentLayout>
                  <TopicExerciseView />
                </StudentLayout>
              </ProtectedRoute>
            } />
            
            {/* Launs/Developer Routes */}
            <Route path="/launs" element={<LaunsLogin />} />
            <Route path="/launs/login" element={<LaunsLogin />} />
            <Route path="/launs/dashboard" element={
              <ProtectedLaunsRoute>
                <LaunsDashboard />
              </ProtectedLaunsRoute>
            } />
            <Route path="/launs/escolas" element={
              <ProtectedLaunsRoute>
                <LaunsEscolas />
              </ProtectedLaunsRoute>
            } />
            <Route path="/launs/escolas/nova" element={
              <ProtectedLaunsRoute>
                <LaunsEscolaForm />
              </ProtectedLaunsRoute>
            } />
            <Route path="/launs/escolas/editar/:id" element={
              <ProtectedLaunsRoute>
                <LaunsEscolaForm />
              </ProtectedLaunsRoute>
            } />
            <Route path="/launs/escolas/detalhes/:id" element={
              <ProtectedLaunsRoute>
                <LaunsEscolaDetails />
              </ProtectedLaunsRoute>
            } />
            <Route path="/launs/escolas/config/:id" element={
              <ProtectedLaunsRoute>
                <LaunsEscolaConfig />
              </ProtectedLaunsRoute>
            } />
            <Route path="/launs/exercicios" element={
              <ProtectedLaunsRoute>
                <LaunsExercicios />
              </ProtectedLaunsRoute>
            } />
            <Route path="/launs/ia-enem" element={
              <ProtectedLaunsRoute>
                <LaunsIAEnem />
              </ProtectedLaunsRoute>
            } />
            <Route path="/launs/sistema" element={
              <ProtectedLaunsRoute>
                <LaunsSystemStatus />
              </ProtectedLaunsRoute>
            } />
            <Route path="/launs/webhooks" element={
              <ProtectedLaunsRoute>
                <LaunsWebhooks />
              </ProtectedLaunsRoute>
            } />
            <Route path="/launs/usuarios" element={
              <ProtectedLaunsRoute>
                <LaunsUsuarios />
              </ProtectedLaunsRoute>
            } />
            <Route path="/launs/status" element={
              <ProtectedLaunsRoute>
                <ProjectStatus />
              </ProtectedLaunsRoute>
            } />
            <Route path="/admin/status" element={
              <ProtectedRoute requireSchoolAdmin>
                <ProjectStatus />
              </ProtectedRoute>
            } />
            
            
            {/* Admin/Direção/Coordenação Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireSchoolAdmin>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/chat" element={
              <ProtectedRoute requireSchoolAdmin>
                <AdminLayout>
                  <AdminChat />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute requireSchoolAdmin>
                <AdminLayout>
                  <AdminStudents />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/jornadas" element={
              <ProtectedRoute requireSchoolAdmin>
                <AdminLayout>
                  <AdminJornadas />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/professores" element={
              <ProtectedRoute requireSchoolAdmin>
                <AdminLayout>
                  <AdminProfessores />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios-crud" element={
              <ProtectedRoute requireSchoolAdmin>
                <AdminUsuariosCRUD />
              </ProtectedRoute>
            } />
            <Route path="/admin/materias" element={
              <ProtectedRoute requireSchoolAdmin>
                <AdminMaterias />
              </ProtectedRoute>
            } />
            <Route path="/admin/turmas" element={
              <ProtectedRoute requireSchoolAdmin>
                <AdminTurmas />
              </ProtectedRoute>
            } />
            
            {/* Professor Routes */}
            <Route path="/professor" element={<ProfessorLayout />} />
            <Route path="/professor/dashboard" element={<ProfessorDashboardPage />} />
            <Route path="/professor/students" element={
              <ProfessorPageWrapper>
                {(professorData) => <ProfessorStudents professorData={professorData} />}
              </ProfessorPageWrapper>
            } />
            <Route path="/professor/jornadas" element={
              <ProfessorPageWrapper>
                {(professorData) => <ProfessorJornadas professorData={professorData} />}
              </ProfessorPageWrapper>
            } />
            <Route path="/professor/historico" element={
              <ProfessorPageWrapper>
                {(professorData) => <ProfessorHistorico professorData={professorData} />}
              </ProfessorPageWrapper>
            } />
            <Route path="/professor/exercicios" element={
              <ProfessorPageWrapper>
                {(professorData) => <ProfessorExercicios professorData={professorData} />}
              </ProfessorPageWrapper>
            } />
            
            {/* Parent Routes */}
            <Route path="/pais" element={<ParentLogin />} />
            <Route path="/pais/dashboard" element={
              <ProtectedRoute requireParent>
                <ParentDashboard />
              </ProtectedRoute>
            } />
            
            {/* Documentation Route */}
            <Route path="/docs/acessos" element={<DocsAcessos />} />
            
            {/* Public Status Route */}
            <Route path="/status-public" element={<PublicStatus />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
};

export default App;
