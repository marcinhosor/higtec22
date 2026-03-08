import { Crown } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  description: string;
  plan: string;
}

export default function UpgradeCard({ title, description, plan }: Props) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 text-center">
      <Crown size={32} className="text-amber-500 mx-auto mb-3" />
      <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      <p className="text-xs text-amber-600 font-medium mb-3">Disponível no plano {plan}</p>
      <Link to="/checkout"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition">
        <Crown size={14} /> Fazer upgrade
      </Link>
    </div>
  );
}
