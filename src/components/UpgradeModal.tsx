import { X, Crown, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { PlanTier, PLAN_FEATURES } from "@/hooks/useCompanyPlan";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  requiredPlan: PlanTier;
  feature?: string;
}

const planIcons: Record<PlanTier, typeof Crown> = {
  free: Star,
  pro: Zap,
  premium: Crown,
};

const UpgradeModal = ({ open, onClose, requiredPlan, feature }: UpgradeModalProps) => {
  if (!open) return null;

  const plan = PLAN_FEATURES[requiredPlan];
  const Icon = planIcons[requiredPlan];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon className="text-white" size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            Recurso do plano {plan.label}
          </h3>
          {feature && (
            <p className="text-slate-500 text-sm mt-2">
              <strong>{feature}</strong> está disponível a partir do plano {plan.label}.
            </p>
          )}
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="font-semibold text-slate-700 mb-2">{plan.label} — {plan.price}</p>
          <ul className="space-y-1.5">
            {plan.features.slice(0, 5).map((f) => (
              <li key={f} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
          >
            Voltar
          </button>
          <Link
            to="/checkout"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium text-center hover:bg-blue-500 transition"
          >
            Ver planos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
