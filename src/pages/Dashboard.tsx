import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan, PLAN_FEATURES } from "@/hooks/useCompanyPlan";
import { Link } from "react-router-dom";
import PlanBadge from "@/components/PlanBadge";
import LimitAlert from "@/components/LimitAlert";
import {
  Calendar, Users, FileText, Settings, Wrench, FlaskConical,
  ArrowRight, Play, BarChart3, TrendingUp, Calculator, MapPin, Store,
  Lock
} from "lucide-react";

const allCards = [
  { to: "/clientes", module: "clientes", icon: Users, label: "Clientes", desc: "Gerencie seus clientes" },
  { to: "/agenda", module: "agenda", icon: Calendar, label: "Agenda", desc: "Agendamentos e serviços" },
  { to: "/orcamentos", module: "orcamentos", icon: FileText, label: "Orçamentos", desc: "Propostas e vendas" },
  { to: "/calculadora", module: "calculadora", icon: Calculator, label: "Calculadora", desc: "Diluição de produtos" },
  { to: "/produtos", module: "produtos", icon: FlaskConical, label: "Produtos", desc: "Cadastro e estoque" },
  { to: "/equipamentos", module: "equipamentos", icon: Wrench, label: "Equipamentos", desc: "Manutenção" },
  { to: "/relatorios", module: "relatorios", icon: BarChart3, label: "Relatórios", desc: "Análises e PDF" },
  { to: "/painel", module: "painel", icon: TrendingUp, label: "Painel", desc: "Visão executiva" },
  { to: "/marketplace", module: "marketplace", icon: Store, label: "Marketplace", desc: "Lojas parceiras" },
  { to: "/configuracoes", module: "configuracoes", icon: Settings, label: "Configurações", desc: "Dados e tema" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { companyName, logoUrl, planTier, limits, usage } = useCompanyPlan();

  const allowedModules = PLAN_FEATURES[planTier].modules;

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-5 mb-5 text-white">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-xl font-black">
              H
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{companyName}</h1>
            <p className="text-blue-200 text-xs">Bem-vindo de volta!</p>
          </div>
          <PlanBadge tier={planTier} size="md" />
        </div>
      </div>

      {/* Usage alerts */}
      <LimitAlert current={usage.clientCount} max={limits.maxClients} label="clientes" />
      <LimitAlert current={usage.quotesThisMonth} max={limits.maxQuotesPerMonth} label="orçamentos este mês" />

      {/* Module cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {allCards.map(({ to, module, icon: Icon, label, desc }) => {
          const isLocked = !allowedModules.includes(module);
          return (
            <Link
              key={to}
              to={isLocked ? "/checkout" : to}
              className={`relative bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center text-center transition shadow-sm ${
                isLocked ? "opacity-60" : "hover:shadow-md active:scale-[0.98]"
              }`}
            >
              {isLocked && (
                <div className="absolute top-2 right-2">
                  <Lock size={12} className="text-slate-400" />
                </div>
              )}
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-2">
                <Icon className="text-white" size={22} />
              </div>
              <h3 className="font-bold text-slate-800 text-[13px] leading-tight">{label}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {isLocked ? "Upgrade" : desc}
              </p>
            </Link>
          );
        })}
      </div>

      {planTier === "free" && (
        <div className="mt-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-slate-800 text-sm">Desbloqueie mais</p>
            <p className="text-xs text-slate-500 mt-0.5">Upgrade para Pro ou Premium</p>
          </div>
          <Link to="/checkout" className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 transition flex items-center gap-1">
            Ver planos <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
