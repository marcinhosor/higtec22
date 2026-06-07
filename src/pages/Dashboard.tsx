import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan, PLAN_FEATURES } from "@/hooks/useCompanyPlan";
import { Link } from "react-router-dom";
import PlanBadge from "@/components/PlanBadge";
import LimitAlert from "@/components/LimitAlert";
import {
  Calendar, Users, FileText, Settings, Wrench, FlaskConical,
  ArrowRight, BarChart3, TrendingUp, Calculator, Store,
  Lock, Package,
} from "lucide-react";

const allCards = [
  { to: "/clientes", module: "clientes", icon: Users, label: "Clientes", desc: "Gerencie seus clientes" },
  { to: "/agenda", module: "agenda", icon: Calendar, label: "Agenda", desc: "Agendamentos e serviços" },
  { to: "/orcamentos", module: "orcamentos", icon: FileText, label: "Orçamentos", desc: "Crie orçamentos e propostas" },
  { to: "/calculadora", module: "calculadora", icon: Calculator, label: "Calculadora de Diluição", desc: "Calcule dosagens" },
  { to: "/produtos", module: "produtos", icon: Package, label: "Produtos", desc: "Cadastro de produtos" },
  { to: "/equipamentos", module: "equipamentos", icon: Wrench, label: "Equipamentos", desc: "Manutenção (PREMIUM)", badge: "PREMIUM" },
  { to: "/relatorios", module: "relatorios", icon: BarChart3, label: "Relatórios", desc: "Gerar relatórios PDF" },
  { to: "/painel", module: "painel", icon: TrendingUp, label: "Painel Estratégico", desc: "Visão executiva (PREMIUM)", badge: "PREMIUM" },
  { to: "/marketplace", module: "marketplace", icon: Store, label: "Marketplace", desc: "Lojas parceiras" },
  { to: "/configuracoes", module: "configuracoes", icon: Settings, label: "Configurações", desc: "Dados e backup" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { companyName, logoUrl, planTier, limits, usage } = useCompanyPlan();
  const allowedModules = PLAN_FEATURES[planTier].modules;

  return (
    <div className="pb-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-6 pb-2">
        <div className="relative mb-4">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="w-24 h-24 rounded-full object-cover shadow-xl border-4 border-white" />
          ) : (
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-white">
              {companyName?.charAt(0) || "H"}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
            <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{companyName || "MP Clean Sorocaba"}</h1>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Gestão Profissional</p>
        <div className="mt-3">
          <PlanBadge tier={planTier} size="md" />
        </div>
      </div>

      {/* Onboarding / Banner */}
      <div className="bg-[#004A8D] rounded-3xl p-6 text-white shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 relative z-10">
          🚀 Bem-vindo! Configure sua empresa.
        </h2>
        <div className="space-y-3 relative z-10">
          <Link to="/configuracoes" className="flex items-center justify-between bg-white/15 hover:bg-white/25 p-4 rounded-2xl transition-all border border-white/10 group">
            <span className="text-sm font-semibold">Cadastrar empresa</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/agenda" className="flex items-center justify-between bg-white/15 hover:bg-white/25 p-4 rounded-2xl transition-all border border-white/10 group">
            <span className="text-sm font-semibold">Cadastrar primeiro serviço</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-2 gap-4">
        {allCards.map(({ to, module, icon: Icon, label, desc, badge }) => {
          const isLocked = !allowedModules.includes(module);
          return (
            <Link
              key={to}
              to={isLocked ? "/checkout" : to}
              className={`relative bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center text-center transition-all shadow-sm active:scale-95 ${
                isLocked ? "opacity-60" : "hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              {isLocked && (
                <div className="absolute top-3 right-3 bg-slate-100 p-1.5 rounded-full">
                  <Lock size={12} className="text-slate-400" />
                </div>
              )}
              {badge && (
                <div className="absolute top-3 left-3 bg-blue-100 text-[#004A8D] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {badge}
                </div>
              )}
              <div className="w-16 h-16 bg-[#F0F7FF] text-[#004A8D] rounded-2xl flex items-center justify-center mb-4 transition-colors group-hover:bg-[#004A8D] group-hover:text-white">
                <Icon size={28} strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{label}</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-tight">
                {isLocked ? "Premium" : desc}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      {planTier === "free" && (
        <div className="bg-[#F0F7FF] rounded-3xl border-2 border-blue-50 p-5 flex items-center gap-4 shadow-inner">
          <div className="flex-1">
            <p className="font-bold text-[#004A8D] text-sm">Desbloqueie mais recursos</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-wider">Upgrade para Pro ou Premium</p>
          </div>
          <Link to="/checkout" className="px-5 py-3 bg-[#004A8D] text-white text-xs font-black rounded-2xl hover:bg-[#003d75] transition-all shadow-lg active:shadow-md">
            PLANOS
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
