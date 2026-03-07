import { Crown, Zap, Star } from "lucide-react";
import { PlanTier } from "@/hooks/useCompanyPlan";

const config: Record<PlanTier, { icon: typeof Crown; bg: string; text: string }> = {
  free: { icon: Star, bg: "bg-slate-100", text: "text-slate-600" },
  pro: { icon: Zap, bg: "bg-blue-100", text: "text-blue-700" },
  premium: { icon: Crown, bg: "bg-amber-100", text: "text-amber-700" },
};

const PlanBadge = ({ tier, size = "sm" }: { tier: PlanTier; size?: "sm" | "md" }) => {
  const c = config[tier];
  const Icon = c.icon;
  const isSmall = size === "sm";

  return (
    <span className={`inline-flex items-center gap-1 ${c.bg} ${c.text} ${isSmall ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"} rounded-full font-semibold uppercase tracking-wider`}>
      <Icon size={isSmall ? 12 : 14} />
      {tier}
    </span>
  );
};

export default PlanBadge;
