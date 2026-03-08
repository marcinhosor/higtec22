import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan, PLAN_FEATURES } from "@/hooks/useCompanyPlan";
import { Link } from "react-router-dom";
import PlanBadge from "@/components/PlanBadge";
import LimitAlert from "@/components/LimitAlert";
import {
  Calendar, Users, FileText, Settings, Wrench, FlaskConical,
  ArrowRight, BarChart3, TrendingUp, Calculator, Store,
  Lock, Building2, ListPlus, Package, ChevronRight,
} from "lucide-react";

const allCards = [
  { to: "/clientes", module: "clientes", icon: Users, label: "Clientes", desc: "Gerencie seus clientes", color: "from-sky-400 to-sky-500" },
  { to: "/agenda", module: "agenda", icon: Calendar, label: "Agenda", desc: "Agendamentos e serviços", color: "from-blue-400 to-blue-500" },
  { to: "/orcamentos", module: "orcamentos", icon: FileText, label: "Orçamentos", desc: "Crie orçamentos e propostas", color: "from-indigo-400 to-indigo-500" },
  { to: "/calculadora", module: "calculadora", icon: Calculator, label: "Calculadora de Diluição", desc: "Calcule dosagens", color: "from-cyan-400 to-cyan-500" },
  { to: "/produtos", module: "produtos", icon: FlaskConical, label: "Produtos", desc: "Cadastro de produtos", color: "from-teal-400 to-teal-500" },
  { to: "/equipamentos", module: "equipamentos", icon: Wrench, label: "Equipamentos", desc: "Manutenção", color: "from-slate-500 to-slate-600", badge: "PREMIUM" },
  { to: "/relatorios", module: "relatorios", icon: BarChart3, label: "Relatórios", desc: "Gerar relatórios PDF", color: "from-violet-400 to-violet-500" },
  { to: "/painel", module: "painel", icon: TrendingUp, label: "Painel Estratégico", desc: "Visão executiva", color: "from-amber-400 to-amber-500", badge: "PREMIUM" },
  { to: "/marketplace", module: "marketplace", icon: Store, label: "Marketplace", desc: "Lojas parceiras", color: "from-emerald-400 to-emerald-500" },
  { to: "/configuracoes", module: "configuracoes", icon: Settings, label: "Configurações", desc: "Dados e backup", color: "from-gray-400 to-gray-500" },
];

const onboardingActions = [
  { icon: Building2, label: "Cadastrar empresa", to: "/configuracoes" },
  { icon: ListPlus, label: "Cadastrar primeiro serviço", to: "/agenda" },
  { icon: Package, label: "Cadastrar primeiro produto", to: "/produtos" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { companyName, logoUrl, planTier, limits, usage } = useCompanyPlan();
  const allowedModules = PLAN_FEATURES[planTier].modules;

  return (
    <div className="pb-4 space-y-5">
      {/* Header */}
      <div className="text-center pt-2">
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 shadow-md border-2 border-white" />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-3 shadow-md">
            {companyName?.charAt(0) || "H"}
          </div>
        )}
        <h1 className="text-xl font-bold text-slate-800">{companyName}</h1>
        <p className="text-sm text-slate-400 mt-0.5">Gestão Profissional</p>
        <div className="mt-2">
          <PlanBadge tier={planTier} size="md" />
        </div>
      </div>

      {/* Welcome message */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl border border-sky-100 p-4 text-center">
        <p className="text-sm text-slate-600">Bem-vindo! Configure sua empresa para começar.</p>
      </div>

      {/* Usage alerts */}
      <LimitAlert current={usage.clientCount} max={limits.maxClients} label="clientes" />
      <LimitAlert current={usage.quotesThisMonth} max={limits.maxQuotesPerMonth} label="orçamentos este mês" />

      {/* Onboarding */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">Primeiros passos</h2>
        <div className="space-y-2">
          {onboardingActions.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon className="text-white" size={18} />
              </div>
              <span className="text-sm font-medium text-slate-700 flex-1">{label}</span>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-sky-400 transition" />
            </Link>
          ))}
        </div>
      </div>

      {/* Module cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">Módulos</h2>
        <div className="grid grid-cols-2 gap-3">
          {allCards.map(({ to, module, icon: Icon, label, desc, color, badge }) => {
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
                {badge && (
                  <div className="absolute top-2 left-2">
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold uppercase">
                      {badge}
                    </span>
                  </div>
                )}
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-2.5 shadow-sm`}>
                  <Icon className="text-white" size={22} />
                </div>
                <h3 className="font-semibold text-slate-700 text-[13px] leading-tight">{label}</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {isLocked ? "Upgrade necessário" : desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Upgrade CTA */}
      {planTier === "free" && (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl border border-sky-200 p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-slate-700 text-sm">Desbloqueie mais recursos</p>
            <p className="text-xs text-slate-500 mt-0.5">Upgrade para Pro ou Premium</p>
          </div>
          <Link to="/checkout" className="px-4 py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 text-white text-xs font-semibold rounded-xl hover:from-sky-500 hover:to-sky-600 transition flex items-center gap-1 shadow-sm">
            Ver planos <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
