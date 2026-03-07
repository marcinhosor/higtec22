import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan } from "@/hooks/useCompanyPlan";
import { Link } from "react-router-dom";
import PlanBadge from "@/components/PlanBadge";
import LimitAlert from "@/components/LimitAlert";
import {
  Calendar, Users, FileText, Settings, Wrench, FlaskConical,
  ArrowRight, Play, BarChart3, TrendingUp, Calculator, MapPin, Store,
  Lock
} from "lucide-react";
import { PLAN_FEATURES, PlanTier } from "@/hooks/useCompanyPlan";

const allCards = [
  { to: "/agenda", module: "agenda", icon: Calendar, label: "Agenda", desc: "Agendamentos do dia", color: "bg-blue-500" },
  { to: "/clientes", module: "clientes", icon: Users, label: "Clientes", desc: "Gerenciar clientes", color: "bg-emerald-500" },
  { to: "/orcamentos", module: "orcamentos", icon: FileText, label: "Orçamentos", desc: "Criar e enviar", color: "bg-amber-500" },
  { to: "/execucao", module: "execucao", icon: Play, label: "Execução", desc: "Serviço em andamento", color: "bg-cyan-500" },
  { to: "/produtos", module: "produtos", icon: FlaskConical, label: "Produtos", desc: "Estoque e diluição", color: "bg-purple-500" },
  { to: "/calculadora", module: "calculadora", icon: Calculator, label: "Calculadora", desc: "Diluição de produtos", color: "bg-indigo-500" },
  { to: "/equipamentos", module: "equipamentos", icon: Wrench, label: "Equipamentos", desc: "Controle de manutenção", color: "bg-rose-500" },
  { to: "/relatorios", module: "relatorios", icon: BarChart3, label: "Relatórios", desc: "Métricas e indicadores", color: "bg-teal-500" },
  { to: "/painel", module: "painel", icon: TrendingUp, label: "Painel Estratégico", desc: "Visão gerencial", color: "bg-orange-500" },
  { to: "/deslocamentos", module: "deslocamentos", icon: MapPin, label: "Deslocamentos", desc: "Gestão de frotas", color: "bg-pink-500" },
  { to: "/marketplace", module: "marketplace", icon: Store, label: "Marketplace", desc: "Parceiros e ofertas", color: "bg-violet-500" },
  { to: "/configuracoes", module: "configuracoes", icon: Settings, label: "Configurações", desc: "Dados da empresa", color: "bg-slate-500" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { companyName, logoUrl, planTier, limits, usage } = useCompanyPlan();

  const allowedModules = PLAN_FEATURES[planTier].modules;

  return (
    <div>
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

      {/* Usage summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{usage.clientCount}</p>
          <p className="text-xs text-slate-500">Clientes</p>
          <p className="text-xs text-slate-400">de {limits.maxClients >= 9999 ? "∞" : limits.maxClients}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{usage.quotesThisMonth}</p>
          <p className="text-xs text-slate-500">Orçamentos/mês</p>
          <p className="text-xs text-slate-400">de {limits.maxQuotesPerMonth >= 9999 ? "∞" : limits.maxQuotesPerMonth}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{usage.userCount}</p>
          <p className="text-xs text-slate-500">Usuários</p>
          <p className="text-xs text-slate-400">de {limits.maxUsers}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4">Módulos</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {allCards.map(({ to, module, icon: Icon, label, desc, color }) => {
          const isLocked = !allowedModules.includes(module);
          return (
            <Link
              key={to}
              to={isLocked ? "/checkout" : to}
              className={`relative bg-white rounded-xl border border-slate-200 p-4 transition group ${isLocked ? "opacity-60" : "hover:shadow-md"}`}
            >
              {isLocked && (
                <div className="absolute top-2 right-2">
                  <Lock size={14} className="text-slate-400" />
                </div>
              )}
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="text-white" size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">{label}</h3>
              <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
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
