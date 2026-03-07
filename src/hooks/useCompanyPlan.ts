import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

type PlanTier = "free" | "pro" | "premium";

interface CompanyPlan {
  planTier: PlanTier;
  companyName: string;
  logoUrl: string | null;
  loading: boolean;
}

export const useCompanyPlan = (): CompanyPlan => {
  const { companyId } = useAuth();
  const [planTier, setPlanTier] = useState<PlanTier>("free");
  const [companyName, setCompanyName] = useState("Minha Empresa");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }

    const load = async () => {
      const { data } = await supabase
        .from("companies")
        .select("name, plan_tier, logo_url")
        .eq("id", companyId)
        .maybeSingle();
      if (data) {
        setPlanTier((data.plan_tier as PlanTier) || "free");
        setCompanyName(data.name);
        setLogoUrl(data.logo_url);
      }
      setLoading(false);
    };
    load();
  }, [companyId]);

  return { planTier, companyName, logoUrl, loading };
};

export const useProGate = () => {
  const { planTier } = useCompanyPlan();

  const isPro = planTier === "pro" || planTier === "premium";
  const isPremium = planTier === "premium";

  const requirePro = (callback: () => void) => {
    if (!isPro) {
      // Could show upgrade modal
      return false;
    }
    callback();
    return true;
  };

  const requirePremium = (callback: () => void) => {
    if (!isPremium) return false;
    callback();
    return true;
  };

  return { isPro, isPremium, planTier, requirePro, requirePremium };
};
