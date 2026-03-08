import { ReportFilters as Filters, DEFAULT_FILTERS } from "@/hooks/useReportsData";
import { Filter, X } from "lucide-react";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onApply: () => void;
  clients: { id: string; name: string }[];
  collaborators: { id: string; name: string }[];
  serviceTypes: { id: string; name: string }[];
}

const PERIODS = [
  { value: "today", label: "Hoje" },
  { value: "7days", label: "7 dias" },
  { value: "30days", label: "30 dias" },
  { value: "month", label: "Mês atual" },
  { value: "last_month", label: "Mês anterior" },
  { value: "custom", label: "Personalizado" },
];

export default function ReportFiltersBar({ filters, onChange, onApply, clients, collaborators, serviceTypes }: Props) {
  const set = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Filter size={16} /> Filtros
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select value={filters.period} onChange={e => set("period", e.target.value)}
          className="col-span-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
          {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        {filters.period === "custom" && (
          <>
            <input type="date" value={filters.customStart} onChange={e => set("customStart", e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2" />
            <input type="date" value={filters.customEnd} onChange={e => set("customEnd", e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2" />
          </>
        )}

        <select value={filters.clientId} onChange={e => set("clientId", e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
          <option value="">Todos clientes</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={filters.technicianId} onChange={e => set("technicianId", e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
          <option value="">Todos técnicos</option>
          {collaborators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={filters.status} onChange={e => set("status", e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
          <option value="">Todos status</option>
          <option value="approved">Aprovado</option>
          <option value="pending">Pendente</option>
          <option value="rejected">Rejeitado</option>
        </select>

        <select value={filters.serviceType} onChange={e => set("serviceType", e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
          <option value="">Todos serviços</option>
          {serviceTypes.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={onApply}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-sm font-medium shadow-sm">
          <Filter size={14} /> Aplicar
        </button>
        <button onClick={() => { onChange(DEFAULT_FILTERS); onApply(); }}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50">
          <X size={14} /> Limpar
        </button>
      </div>
    </div>
  );
}
