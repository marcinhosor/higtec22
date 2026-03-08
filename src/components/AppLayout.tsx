import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const titles: Record<string, string> = {
    "/": "Início",
    "/agenda": "Agenda",
    "/clientes": "Clientes",
    "/orcamentos": "Orçamentos",
    "/execucao": "Execução",
    "/produtos": "Produtos",
    "/calculadora": "Calculadora de Diluição",
    "/equipamentos": "Equipamentos",
    "/relatorios": "Relatórios",
    "/painel": "Painel Estratégico",
    "/deslocamentos": "Deslocamentos",
    "/marketplace": "Marketplace",
    "/configuracoes": "Configurações",
    "/checkout": "Planos",
  };
  const pageTitle = titles[location.pathname] || "HigTec";
  const isHome = location.pathname === "/";

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      {!isHome && (
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary transition">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-foreground">{pageTitle}</h1>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition">
            <LogOut size={20} />
          </button>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-24 overflow-auto max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
