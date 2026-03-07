import { Link, useLocation } from "react-router-dom";
import { Users, Calendar, Calculator, FlaskConical, Settings } from "lucide-react";

const items = [
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/calculadora", icon: Calculator, label: "Cálculo" },
  { to: "/produtos", icon: FlaskConical, label: "Produtos" },
  { to: "/configuracoes", icon: Settings, label: "Config" },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-1.5 pb-[env(safe-area-inset-bottom,4px)]">
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition ${
                active ? "text-blue-600" : "text-slate-400"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
