import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan } from "@/hooks/useCompanyPlan";
import { Link } from "react-router-dom";
import {
  Calendar, Users, FileText, Settings, Wrench, FlaskConical,
  ArrowRight, Play, BarChart3, TrendingUp, Calculator, MapPin, Store
} from "lucide-react";

const cards = [
  { to: "/agenda", icon: Calendar, label: "Agenda", desc: "Agendamentos do dia", color: "bg-blue-500" },
  { to: "/clientes", icon: Users, label: "Clientes", desc: "Gerenciar clientes", color: "bg-emerald-500" },
  { to: "/orcamentos", icon: FileText, label: "Orçamentos", desc: "Criar e enviar", color: "bg-amber-500" },
  { to: "/execucao", icon: Play, label: "Execução", desc: "Serviço em andamento", color: "bg-cyan-500" },
  { to: "/produtos", icon: FlaskConical, label: "Produtos", desc: "Estoque e diluição", color: "bg-purple-500" },
  { to: "/calculadora", icon: Calculator, label: "Calculadora", desc: "Diluição de produtos", color: "bg-indigo-500" },
  { to: "/equipamentos", icon: Wrench, label: "Equipamentos", desc: "Controle de manutenção", color: "bg-rose-500" },
  { to: "/relatorios", icon: BarChart3, label: "Relatórios", desc: "Métricas e indicadores", color: "bg-teal-500" },
  { to: "/painel", icon: TrendingUp, label: "Painel Estratégico", desc: "Visão gerencial", color: "bg-orange-500" },
  { to: "/deslocamentos", icon: MapPin, label: "Deslocamentos", desc: "Gestão de frotas", color: "bg-pink-500" },
  { to: "/marketplace", icon: Store, label: "Marketplace", desc: "Parceiros e ofertas", color: "bg-violet-500" },
  { to: "/configuracoes", icon: Settings, label: "Configurações", desc: "Dados da empresa", color: "bg-slate-500" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { companyName, logoUrl, planTier } = useCompanyPlan();

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
          <span className="ml-auto px-3 py-1 bg-white/10 rounded-full text-xs font-medium uppercase tracking-wider">
            {planTier}
          </span>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4">Módulos</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map(({ to, icon: Icon, label, desc, color }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition group"
          >
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="text-white" size={20} />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">{label}</h3>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
