import { Link, useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // Derive page title from route
  const titles: Record<string, string> = {
    "/": "Início",
    "/agenda": "Agenda",
    "/clientes": "Clientes",
    "/orcamentos": "Orçamentos",
    "/execucao": "Execução",
    "/produtos": "Produtos",
    "/calculadora": "Calculadora",
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      {!isHome && (
        <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <h1 className="text-lg font-bold text-slate-800">{pageTitle}</h1>
          <Link to="/" className="text-sm font-black text-slate-400 hover:text-sky-500 transition">
            Hig<span className="text-sky-500">Tec</span>
          </Link>
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
