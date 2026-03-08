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
    <div className="pb-4 space-y-5">
      {/* Header */}
      <div className="text-center pt-2">
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 shadow-md border-2 border-card" />
        ) : (
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-2xl font-black text-primary-foreground mx-auto mb-3 shadow-md">
            {companyName?.charAt(0) || "H"}
          </div>
        )}
        <h1 className="text-xl font-bold text-foreground">{companyName}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gestão Profissional</p>
        <div className="mt-2">
          <PlanBadge tier={planTier} size="md" />
        </div>
      </div>

      {/* Usage alerts */}
      <LimitAlert current={usage.clientCount} max={limits.maxClients} label="clientes" />
      <LimitAlert current={usage.quotesThisMonth} max={limits.maxQuotesPerMonth} label="orçamentos este mês" />

      {/* Module cards - 2 column grid with blue icons */}
      <div className="grid grid-cols-2 gap-3">
        {allCards.map(({ to, module, icon: Icon, label, desc, badge }) => {
          const isLocked = !allowedModules.includes(module);
          return (
            <Link
              key={to}
              to={isLocked ? "/checkout" : to}
              className={`relative bg-card rounded-2xl border border-border p-5 flex flex-col items-center text-center transition shadow-sm ${
                isLocked ? "opacity-60" : "hover:shadow-md active:scale-[0.98]"
              }`}
            >
              {isLocked && (
                <div className="absolute top-2 right-2">
                  <Lock size={12} className="text-muted-foreground" />
                </div>
              )}
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <Icon className="text-primary-foreground" size={24} />
              </div>
              <h3 className="font-semibold text-foreground text-sm leading-tight">{label}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {isLocked ? "Upgrade necessário" : desc}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      {planTier === "free" && (
        <div className="bg-secondary rounded-2xl border border-border p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">Desbloqueie mais recursos</p>
            <p className="text-xs text-muted-foreground mt-0.5">Upgrade para Pro ou Premium</p>
          </div>
          <Link to="/checkout" className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition flex items-center gap-1 shadow-sm">
            Ver planos <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
