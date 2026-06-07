import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { TechnicianProvider } from "@/contexts/TechnicianContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import InstallAppBanner from "@/components/InstallAppBanner";

// Regular imports
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Agenda from "@/pages/Agenda";
import Clientes from "@/pages/Clientes";
import Orcamentos from "@/pages/Orcamentos";
import Produtos from "@/pages/Produtos";
import Calculadora from "@/pages/Calculadora";
import Relatorios from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import Execucao from "@/pages/Execucao";
import Checkout from "@/pages/Checkout";
import Painel from "@/pages/Painel";
import Equipamentos from "@/pages/Equipamentos";
import Marketplace from "@/pages/Marketplace";
import Deslocamentos from "@/pages/Deslocamentos";
import PainelAdmin from "@/pages/PainelAdmin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      <p className="text-sm text-muted-foreground mt-3">Carregando...</p>
    </div>
  </div>
);

const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <TechnicianProvider>
          <AuthProvider>
            <InstallAppBanner />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Signup />} />
              <Route path="/esqueci-senha" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
              <Route path="/agenda" element={<ProtectedPage><Agenda /></ProtectedPage>} />
              <Route path="/clientes" element={<ProtectedPage><Clientes /></ProtectedPage>} />
              <Route path="/orcamentos" element={<ProtectedPage><Orcamentos /></ProtectedPage>} />
              <Route path="/produtos" element={<ProtectedPage><Produtos /></ProtectedPage>} />
              <Route path="/calculadora" element={<ProtectedPage><Calculadora /></ProtectedPage>} />
              <Route path="/relatorios" element={<ProtectedPage><Relatorios /></ProtectedPage>} />
              <Route path="/configuracoes" element={<ProtectedPage><Configuracoes /></ProtectedPage>} />
              <Route path="/execucao" element={<ProtectedPage><Execucao /></ProtectedPage>} />
              <Route path="/checkout" element={<ProtectedPage><Checkout /></ProtectedPage>} />
              <Route path="/painel" element={<ProtectedPage><Painel /></ProtectedPage>} />
              <Route path="/equipamentos" element={<ProtectedPage><Equipamentos /></ProtectedPage>} />
              <Route path="/marketplace" element={<ProtectedPage><Marketplace /></ProtectedPage>} />
              <Route path="/deslocamentos" element={<ProtectedPage><Deslocamentos /></ProtectedPage>} />
              <Route path="/x9k2m" element={<ProtectedPage><PainelAdmin /></ProtectedPage>} />
              <Route path="/painel-admin" element={<ProtectedPage><PainelAdmin /></ProtectedPage>} />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </TechnicianProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
