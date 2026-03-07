import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { TechnicianProvider } from "@/contexts/TechnicianContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import InstallAppBanner from "@/components/InstallAppBanner";

// Lazy-loaded pages
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Agenda = lazy(() => import("@/pages/Agenda"));
const Clientes = lazy(() => import("@/pages/Clientes"));
const Orcamentos = lazy(() => import("@/pages/Orcamentos"));
const Produtos = lazy(() => import("@/pages/Produtos"));
const Calculadora = lazy(() => import("@/pages/Calculadora"));
const Relatorios = lazy(() => import("@/pages/Relatorios"));
const Configuracoes = lazy(() => import("@/pages/Configuracoes"));
const Execucao = lazy(() => import("@/pages/Execucao"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Painel = lazy(() => import("@/pages/Painel"));
const Equipamentos = lazy(() => import("@/pages/Equipamentos"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const Deslocamentos = lazy(() => import("@/pages/Deslocamentos"));
const PainelAdmin = lazy(() => import("@/pages/PainelAdmin"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      <p className="text-sm text-slate-500 mt-3">Carregando...</p>
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
            <Suspense fallback={<Loading />}>
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
            </Suspense>
          </AuthProvider>
        </TechnicianProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
