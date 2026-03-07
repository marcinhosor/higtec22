import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface LimitAlertProps {
  current: number;
  max: number;
  label: string;
}

const LimitAlert = ({ current, max, label }: LimitAlertProps) => {
  const pct = max > 0 ? (current / max) * 100 : 0;
  if (pct < 80) return null;

  const isOver = current >= max;

  return (
    <div className={`rounded-lg p-3 mb-4 flex items-center gap-3 text-sm ${isOver ? "bg-red-50 border border-red-200 text-red-700" : "bg-amber-50 border border-amber-200 text-amber-700"}`}>
      <AlertTriangle size={18} />
      <div className="flex-1">
        {isOver ? (
          <span>Limite de {label} atingido ({current}/{max}).</span>
        ) : (
          <span>Você está próximo do limite de {label} ({current}/{max}).</span>
        )}
      </div>
      <Link to="/checkout" className="text-xs font-semibold underline whitespace-nowrap">
        Fazer upgrade
      </Link>
    </div>
  );
};

export default LimitAlert;
