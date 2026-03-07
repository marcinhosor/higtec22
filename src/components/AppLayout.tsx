import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar, Users, FileText, Settings, LogOut, Menu, X,
  LayoutDashboard, Package, Wrench, FlaskConical
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/orcamentos", icon: FileText, label: "Orçamentos" },
  { to: "/produtos", icon: FlaskConical, label: "Produtos" },
  { to: "/equipamentos", icon: Wrench, label: "Equipamentos" },
  { to: "/configuracoes", icon: Settings, label: "Configurações" },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h1 className="text-2xl font-black tracking-tight">
            Hig<span className="text-blue-400">Tec</span>
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 truncate mb-2">{user?.email}</p>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition w-full"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">
            Hig<span className="text-blue-600">Tec</span>
          </h1>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
