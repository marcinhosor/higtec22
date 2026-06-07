import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Calendar, Receipt, Package, Settings, Wrench } from "lucide-react";
import { useTechnician } from "@/contexts/TechnicianContext";

const adminNavItems = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/clientes", icon: Users, label: "Clientes" },
  { path: "/agenda", icon: Calendar, label: "Agenda" },
  { path: "/orcamentos", icon: Receipt, label: "Orçam." },
  { path: "/produtos", icon: Package, label: "Produtos" },
  { path: "/configuracoes", icon: Settings, label: "Config" },
];

const techNavItems = [
  { path: "/orcamentos", icon: Receipt, label: "Orçam." },
  { path: "/agenda", icon: Calendar, label: "Agenda" },
  { path: "/execucao", icon: Wrench, label: "Execução" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTechnician } = useTechnician();

  const navItems = isTechnician ? techNavItems : adminNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/80 backdrop-blur-xl safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl px-3 py-1 text-[10px] font-bold transition-all ${
                active ? "text-[#004A8D] scale-110" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${active ? "bg-[#F0F7FF]" : ""}`}>
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="uppercase tracking-tighter">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}