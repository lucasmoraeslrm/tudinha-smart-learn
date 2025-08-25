import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import JornadaPage from "./pages/JornadaPage";
import ChatPage from "./pages/ChatPage";
import ExerciciosPage from "./pages/ExerciciosPage";
import ExerciseListView from "./pages/ExerciseListView";
import ExerciseView from "./pages/ExerciseView";
import StudentLayout from "./components/StudentLayout";
import AdminLayout from "./components/AdminLayout";
import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminChat from "./pages/AdminChat";
import AdminStudents from "./pages/AdminStudents";
import AdminJornadas from "./pages/AdminJornadas";
import AdminExercises from "./pages/AdminExercises";
import AdminLists from "./pages/AdminLists";
import AdminProfessores from "./pages/AdminProfessores";
import ProfessorLayout from "./components/ProfessorLayout";
import ProfessorDashboardPage from "./pages/ProfessorDashboardPage";
import LaunsLogin from "./pages/LaunsLogin";
import LaunsDashboard from "./pages/LaunsDashboard";
import ParentLogin from "./pages/ParentLogin";
import ParentDashboard from "./pages/ParentDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
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
            <Route path="/lista/:listId" element={
              <ProtectedRoute>
                <StudentLayout>
                  <ExerciseListView />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/exercicio/:exerciseId" element={
              <ProtectedRoute>
                <StudentLayout>
                  <ExerciseView />
                </StudentLayout>
              </ProtectedRoute>
            } />
            
            {/* Launs/Developer Routes */}
            <Route path="/launs" element={<LaunsLogin />} />
            <Route path="/launs/dashboard" element={
              <ProtectedRoute requireLauns>
                <LaunsDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin/Direção/Coordenação Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/chat" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminChat />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminStudents />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/jornadas" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminJornadas />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/exercises" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminExercises />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/lists" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminLists />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/professores" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminProfessores />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            {/* Professor Routes */}
            <Route path="/professor" element={<ProfessorLayout />} />
            <Route path="/professor/dashboard" element={
              <ProtectedRoute requireProfessor>
                <ProfessorDashboardPage />
              </ProtectedRoute>
            } />
            
            {/* Parent Routes */}
            <Route path="/pais" element={<ParentLogin />} />
            <Route path="/pais/dashboard" element={
              <ProtectedRoute requireParent>
                <ParentDashboard />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
