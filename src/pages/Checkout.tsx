import { Check, Crown, Zap, Star } from "lucide-react";
import { useCompanyPlan, PlanTier, PLAN_FEATURES } from "@/hooks/useCompanyPlan";
import PlanBadge from "@/components/PlanBadge";

const planOrder: PlanTier[] = ["free", "pro", "premium"];
const planIcons: Record<PlanTier, typeof Crown> = { free: Star, pro: Zap, premium: Crown };
const planColors: Record<PlanTier, string> = {
  free: "border-slate-200",
  pro: "border-blue-400 ring-2 ring-blue-100",
  premium: "border-amber-400 ring-2 ring-amber-100",
};
const planBtnColors: Record<PlanTier, string> = {
  free: "bg-slate-200 text-slate-600",
  pro: "bg-blue-600 text-white hover:bg-blue-500",
  premium: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400",
};

const Checkout = () => {
  const { planTier: currentPlan, loading } = useCompanyPlan();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-1">Planos e Assinatura</h2>
        <p className="text-sm text-slate-500">
          Seu plano atual: <PlanBadge tier={currentPlan} size="md" />
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {planOrder.map((tier) => {
          const plan = PLAN_FEATURES[tier];
          const Icon = planIcons[tier];
          const isCurrent = tier === currentPlan;
          const tierIndex = planOrder.indexOf(tier);
          const currentIndex = planOrder.indexOf(currentPlan);
          const isUpgrade = tierIndex > currentIndex;
          const isRecommended = tier === "pro";

          return (
            <div
              key={tier}
              className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${planColors[tier]} ${isCurrent ? "shadow-lg" : ""}`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  RECOMENDADO
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier === "free" ? "bg-slate-100" : tier === "pro" ? "bg-blue-100" : "bg-amber-100"}`}>
                  <Icon size={20} className={tier === "free" ? "text-slate-600" : tier === "pro" ? "text-blue-600" : "text-amber-600"} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{plan.label}</h3>
                  <p className="text-sm font-semibold text-slate-600">{plan.price}</p>
                </div>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition ${isCurrent ? "bg-slate-100 text-slate-400 cursor-default" : planBtnColors[tier]}`}
              >
                {isCurrent ? "Plano atual" : isUpgrade ? "Fazer upgrade" : "Downgrade"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-2">Perguntas frequentes</h3>
        <div className="space-y-3 text-sm text-slate-600">
          <div>
            <p className="font-medium text-slate-700">Posso cancelar a qualquer momento?</p>
            <p>Sim, você pode cancelar ou fazer downgrade quando quiser.</p>
          </div>
          <div>
            <p className="font-medium text-slate-700">Meus dados são mantidos no downgrade?</p>
            <p>Sim, todos os seus dados são preservados. Apenas o acesso aos recursos premium é restringido.</p>
          </div>
          <div>
            <p className="font-medium text-slate-700">Existe período de teste?</p>
            <p>Sim, novos cadastros recebem 7 dias de teste com acesso completo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
