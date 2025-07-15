import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import ExerciciosPage from "./pages/ExerciciosPage";
import StudentLayout from "./components/StudentLayout";
import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminChat from "./pages/AdminChat";
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
            <Route path="/" element={<StudentLogin />} />
            
            {/* Student Routes with Layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <StudentLayout>
                  <DashboardPage />
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
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/chat" element={<ProtectedRoute requireAdmin><AdminChat /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
