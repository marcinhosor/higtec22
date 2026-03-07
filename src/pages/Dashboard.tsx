import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan, PLAN_FEATURES } from "@/hooks/useCompanyPlan";
import { Link } from "react-router-dom";
import PlanBadge from "@/components/PlanBadge";
import LimitAlert from "@/components/LimitAlert";
import {
  Calendar, Users, FileText, Settings, Wrench, FlaskConical,
  ArrowRight, BarChart3, TrendingUp, Calculator, Store,
  Lock
} from "lucide-react";

const allCards = [
  { to: "/clientes", module: "clientes", icon: Users, label: "Clientes", desc: "Gerencie seus clientes", color: "from-sky-400 to-sky-500" },
  { to: "/agenda", module: "agenda", icon: Calendar, label: "Agenda", desc: "Agendamentos e serviços", color: "from-blue-400 to-blue-500" },
  { to: "/orcamentos", module: "orcamentos", icon: FileText, label: "Orçamentos", desc: "Propostas e vendas", color: "from-indigo-400 to-indigo-500" },
  { to: "/calculadora", module: "calculadora", icon: Calculator, label: "Calculadora", desc: "Diluição de produtos", color: "from-cyan-400 to-cyan-500" },
  { to: "/produtos", module: "produtos", icon: FlaskConical, label: "Produtos", desc: "Cadastro e estoque", color: "from-teal-400 to-teal-500" },
  { to: "/equipamentos", module: "equipamentos", icon: Wrench, label: "Equipamentos", desc: "Manutenção", color: "from-slate-500 to-slate-600" },
  { to: "/relatorios", module: "relatorios", icon: BarChart3, label: "Relatórios", desc: "Análises e PDF", color: "from-violet-400 to-violet-500" },
  { to: "/painel", module: "painel", icon: TrendingUp, label: "Painel", desc: "Visão executiva", color: "from-amber-400 to-amber-500" },
  { to: "/marketplace", module: "marketplace", icon: Store, label: "Marketplace", desc: "Lojas parceiras", color: "from-emerald-400 to-emerald-500" },
  { to: "/configuracoes", module: "configuracoes", icon: Settings, label: "Configurações", desc: "Dados e tema", color: "from-gray-400 to-gray-500" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { companyName, logoUrl, planTier, limits, usage } = useCompanyPlan();
  const allowedModules = PLAN_FEATURES[planTier].modules;

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-5 mb-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="w-12 h-12 rounded-xl object-cover border-2 border-white/20" />
          ) : (
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-black backdrop-blur-sm">
              H
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{companyName}</h1>
            <p className="text-sky-100 text-xs">Bem-vindo de volta!</p>
          </div>
          <PlanBadge tier={planTier} size="md" />
        </div>
      </div>

      {/* Usage alerts */}
      <LimitAlert current={usage.clientCount} max={limits.maxClients} label="clientes" />
      <LimitAlert current={usage.quotesThisMonth} max={limits.maxQuotesPerMonth} label="orçamentos este mês" />

      {/* Module cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {allCards.map(({ to, module, icon: Icon, label, desc, color }) => {
          const isLocked = !allowedModules.includes(module);
          return (
            <Link
              key={to}
              to={isLocked ? "/checkout" : to}
              className={`relative bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center text-center transition shadow-sm ${
                isLocked ? "opacity-50" : "hover:shadow-md active:scale-[0.98]"
              }`}
            >
              {isLocked && (
                <div className="absolute top-2 right-2">
                  <Lock size={12} className="text-slate-400" />
                </div>
              )}
              <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-2 shadow-sm`}>
                <Icon className="text-white" size={20} />
              </div>
              <h3 className="font-semibold text-slate-700 text-[13px] leading-tight">{label}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {isLocked ? "Upgrade" : desc}
              </p>
            </Link>
          );
        })}
      </div>

      {planTier === "free" && (
        <div className="mt-5 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200 p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-slate-700 text-sm">Desbloqueie mais recursos</p>
            <p className="text-xs text-slate-500 mt-0.5">Upgrade para Pro ou Premium</p>
          </div>
          <Link to="/checkout" className="px-4 py-2 bg-gradient-to-r from-sky-400 to-sky-500 text-white text-xs font-semibold rounded-lg hover:from-sky-500 hover:to-sky-600 transition flex items-center gap-1 shadow-sm">
            Ver planos <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
