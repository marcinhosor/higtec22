import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import {
  Calendar, Users, FileText, Settings, LogOut, Menu, X,
  LayoutDashboard, FlaskConical, Wrench, BarChart3,
  Play, TrendingUp, Store, MapPin, Calculator
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/orcamentos", icon: FileText, label: "Orçamentos" },
  { to: "/execucao", icon: Play, label: "Execução" },
  { to: "/produtos", icon: FlaskConical, label: "Produtos" },
  { to: "/calculadora", icon: Calculator, label: "Calculadora" },
  { to: "/equipamentos", icon: Wrench, label: "Equipamentos" },
  { to: "/relatorios", icon: BarChart3, label: "Relatórios" },
  { to: "/painel", icon: TrendingUp, label: "Painel Estratégico" },
  { to: "/deslocamentos", icon: MapPin, label: "Deslocamentos" },
  { to: "/marketplace", icon: Store, label: "Marketplace" },
  { to: "/configuracoes", icon: Settings, label: "Configurações" },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f5fa] flex">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 shadow-lg transform transition-transform lg:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <Link to="/" className="text-2xl font-black tracking-tight text-slate-800">
            Hig<span className="text-sky-500">Tec</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? "bg-sky-50 text-sky-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 truncate mb-2">{user?.email}</p>
          <button onClick={signOut} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition w-full">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 lg:hidden shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-500">
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-black text-slate-800">
            Hig<span className="text-sky-500">Tec</span>
          </h1>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 overflow-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
