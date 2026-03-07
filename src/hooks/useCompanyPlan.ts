import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";

export type PlanTier = "free" | "pro" | "premium";

interface PlanLimits {
  maxUsers: number;
  maxClients: number;
  maxQuotesPerMonth: number;
}

interface CompanyUsage {
  clientCount: number;
  quotesThisMonth: number;
  userCount: number;
}

interface CompanyPlan {
  planTier: PlanTier;
  companyName: string;
  logoUrl: string | null;
  loading: boolean;
  limits: PlanLimits;
  usage: CompanyUsage;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  trialEndsAt: string | null;
  refreshUsage: () => Promise<void>;
}

const DEFAULT_LIMITS: PlanLimits = { maxUsers: 1, maxClients: 20, maxQuotesPerMonth: 5 };
const DEFAULT_USAGE: CompanyUsage = { clientCount: 0, quotesThisMonth: 0, userCount: 0 };

export const PLAN_FEATURES: Record<PlanTier, {
  label: string;
  price: string;
  modules: string[];
  features: string[];
}> = {
  free: {
    label: "Free",
    price: "R$ 0",
    modules: ["agenda", "clientes", "orcamentos", "configuracoes"],
    features: [
      "Agenda básica",
      "Até 20 clientes",
      "Até 5 orçamentos/mês",
      "1 usuário",
      "Relatórios básicos",
    ],
  },
  pro: {
    label: "Pro",
    price: "R$ 99/mês",
    modules: ["agenda", "clientes", "orcamentos", "produtos", "calculadora", "execucao", "relatorios", "configuracoes"],
    features: [
      "Tudo do Free",
      "Até 100 clientes",
      "Até 50 orçamentos/mês",
      "Até 5 usuários",
      "Produtos e estoque",
      "Calculadora de diluição",
      "Execução de serviço",
      "Relatórios completos com PDF",
      "Personalização da empresa",
      "Notificações",
    ],
  },
  premium: {
    label: "Premium",
    price: "R$ 199/mês",
    modules: ["agenda", "clientes", "orcamentos", "produtos", "calculadora", "execucao", "relatorios", "equipamentos", "painel", "deslocamentos", "marketplace", "configuracoes"],
    features: [
      "Tudo do Pro",
      "Clientes ilimitados",
      "Orçamentos ilimitados",
      "Até 15 usuários",
      "Painel estratégico",
      "Gestão de equipamentos",
      "Gestão de deslocamentos e frotas",
      "Marketplace",
      "Branding avançado",
      "Suporte prioritário",
    ],
  },
};

// Map route paths to module names
const ROUTE_MODULE_MAP: Record<string, string> = {
  "/": "agenda",
  "/agenda": "agenda",
  "/clientes": "clientes",
  "/orcamentos": "orcamentos",
  "/produtos": "produtos",
  "/calculadora": "calculadora",
  "/execucao": "execucao",
  "/relatorios": "relatorios",
  "/equipamentos": "equipamentos",
  "/painel": "painel",
  "/deslocamentos": "deslocamentos",
  "/marketplace": "marketplace",
  "/configuracoes": "configuracoes",
  "/checkout": "configuracoes",
};

export const useCompanyPlan = (): CompanyPlan => {
  const { companyId } = useAuth();
  const [planTier, setPlanTier] = useState<PlanTier>("free");
  const [companyName, setCompanyName] = useState("Minha Empresa");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<PlanLimits>(DEFAULT_LIMITS);
  const [usage, setUsage] = useState<CompanyUsage>(DEFAULT_USAGE);
  const [subscriptionStatus, setSubscriptionStatus] = useState("active");
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);

  const refreshUsage = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase.rpc("get_company_usage", { _company_id: companyId });
    if (data) {
      const d = data as any;
      setUsage({
        clientCount: d.client_count ?? 0,
        quotesThisMonth: d.quotes_this_month ?? 0,
        userCount: d.user_count ?? 0,
      });
    }
  }, [companyId]);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }

    const load = async () => {
      const { data } = await supabase
        .from("companies")
        .select("name, plan_tier, logo_url, max_users, max_clients, max_quotes_per_month, subscription_status, subscription_expires_at, trial_ends_at")
        .eq("id", companyId)
        .maybeSingle();
      if (data) {
        setPlanTier((data.plan_tier as PlanTier) || "free");
        setCompanyName(data.name);
        setLogoUrl(data.logo_url);
        setLimits({
          maxUsers: (data as any).max_users ?? 1,
          maxClients: (data as any).max_clients ?? 20,
          maxQuotesPerMonth: (data as any).max_quotes_per_month ?? 5,
        });
        setSubscriptionStatus((data as any).subscription_status ?? "active");
        setSubscriptionExpiresAt((data as any).subscription_expires_at ?? null);
        setTrialEndsAt(data.trial_ends_at ?? null);
      }
      await refreshUsage();
      setLoading(false);
    };
    load();
  }, [companyId, refreshUsage]);

  return {
    planTier, companyName, logoUrl, loading,
    limits, usage, subscriptionStatus, subscriptionExpiresAt, trialEndsAt,
    refreshUsage,
  };
};

export const useProGate = () => {
  const { planTier, limits, usage } = useCompanyPlan();

  const isPro = planTier === "pro" || planTier === "premium";
  const isPremium = planTier === "premium";

  const canAddClient = usage.clientCount < limits.maxClients;
  const canAddQuote = usage.quotesThisMonth < limits.maxQuotesPerMonth;
  const canAddUser = usage.userCount < limits.maxUsers;

  const canAccessModule = (moduleName: string): boolean => {
    return PLAN_FEATURES[planTier].modules.includes(moduleName);
  };

  const canAccessRoute = (path: string): boolean => {
    const module = ROUTE_MODULE_MAP[path];
    if (!module) return true; // unknown routes are accessible
    return canAccessModule(module);
  };

  const getRequiredPlan = (moduleName: string): PlanTier | null => {
    if (PLAN_FEATURES.free.modules.includes(moduleName)) return null;
    if (PLAN_FEATURES.pro.modules.includes(moduleName)) return "pro";
    return "premium";
  };

  return {
    isPro, isPremium, planTier,
    canAddClient, canAddQuote, canAddUser,
    canAccessModule, canAccessRoute, getRequiredPlan,
    limits, usage,
  };
};
