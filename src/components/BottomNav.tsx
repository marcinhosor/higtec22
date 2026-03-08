import { Link, useLocation } from "react-router-dom";
import { Home, Users, Calendar, Receipt, Package, Settings } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/orcamentos", icon: Receipt, label: "Orçam." },
  { to: "/produtos", icon: Package, label: "Produtos" },
  { to: "/configuracoes", icon: Settings, label: "Config" },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around py-2 pb-[max(env(safe-area-inset-bottom),8px)] max-w-2xl mx-auto">
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[48px] transition ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
