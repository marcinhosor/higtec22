import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  sub?: string;
}

export default function KpiCard({ label, value, icon: Icon, color = "text-blue-600", sub }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg bg-slate-50 ${color}`}><Icon size={16} /></div>
        <span className="text-xs text-slate-500 leading-tight">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-800 truncate">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
