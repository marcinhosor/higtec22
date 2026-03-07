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
  { to: "/orcamentos", module: "orcamentos", icon: FileText, label: "Orçamentos", desc: "Crie orçamentos e propostas" },
  { to: "/calculadora", module: "calculadora", icon: Calculator, label: "Calculadora de Diluição", desc: "Calcule dosagens" },
  { to: "/produtos", module: "produtos", icon: FlaskConical, label: "Produtos", desc: "Cadastro de produtos" },
  { to: "/equipamentos", module: "equipamentos", icon: Wrench, label: "Equipamentos", desc: "Manutenção (PREMIUM)" },
  { to: "/relatorios", module: "relatorios", icon: BarChart3, label: "Relatórios", desc: "Gerar relatórios PDF" },
  { to: "/painel", module: "painel", icon: TrendingUp, label: "Painel Estratégico", desc: "Visão executiva (PREMIUM)" },
  { to: "/marketplace", module: "marketplace", icon: Store, label: "Marketplace", desc: "Lojas parceiras" },
  { to: "/configuracoes", module: "configuracoes", icon: Settings, label: "Configurações", desc: "Dados e backup" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { companyName, logoUrl, planTier, limits, usage } = useCompanyPlan();

  const allowedModules = PLAN_FEATURES[planTier].modules;

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-6 sm:p-8 mb-6 text-white">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="w-14 h-14 rounded-xl object-cover" />
          ) : (
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-2xl font-black">
              H
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{companyName}</h1>
            <p className="text-blue-200 text-sm mt-0.5">Bem-vindo de volta!</p>
          </div>
          <div className="ml-auto">
            <PlanBadge tier={planTier} size="md" />
          </div>
        </div>
      </div>

      {/* Usage alerts */}
      <LimitAlert current={usage.clientCount} max={limits.maxClients} label="clientes" />
      <LimitAlert current={usage.quotesThisMonth} max={limits.maxQuotesPerMonth} label="orçamentos este mês" />

      {/* Module cards - 2 col grid matching reference */}
      <div className="grid grid-cols-2 gap-3">
        {allCards.map(({ to, module, icon: Icon, label, desc }) => {
          const isLocked = !allowedModules.includes(module);
          return (
            <Link
              key={to}
              to={isLocked ? "/checkout" : to}
              className={`relative bg-white rounded-2xl border border-slate-100 p-5 flex flex-col items-center text-center transition shadow-sm ${
                isLocked ? "opacity-60" : "hover:shadow-md active:scale-[0.98]"
              }`}
            >
              {isLocked && (
                <div className="absolute top-2.5 right-2.5">
                  <Lock size={14} className="text-slate-400" />
                </div>
              )}
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-3">
                <Icon className="text-white" size={26} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight">{label}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                {isLocked ? "Disponível no upgrade" : desc}
              </p>
            </Link>
          );
        })}
      </div>

      {planTier === "free" && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-5 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-slate-800 text-sm">Desbloqueie mais recursos</p>
            <p className="text-xs text-slate-500 mt-0.5">Faça upgrade para Pro ou Premium e tenha acesso completo.</p>
          </div>
          <Link to="/checkout" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition flex items-center gap-1">
            Ver planos <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
