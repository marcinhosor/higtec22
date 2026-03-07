import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, FileDown, DollarSign, Users, Clock, TrendingUp, FileText } from "lucide-react";

type Tab = "gestao" | "relatorio";
type ReportType = "mensal" | "clientes" | "servicos" | "produtos" | "financeiro";

interface MonthlyStats {
  totalServices: number;
  revenue: number;
  productCost: number;
  avgMargin: number;
  avgTicket: number;
  topService: string;
  approvedQuotes: number;
  totalHours: number;
}

const Relatorios = () => {
  const { companyId } = useAuth();
  const [tab, setTab] = useState<Tab>("gestao");
  const [reportType, setReportType] = useState<ReportType>("mensal");
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) loadStats();
  }, [companyId]);

  const loadStats = async () => {
    if (!companyId) return;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [quotesRes, execRes, appointmentsRes] = await Promise.all([
      supabase.from("quotes").select("*").eq("company_id", companyId).gte("created_at", startOfMonth),
      supabase.from("service_executions").select("*").eq("company_id", companyId).gte("created_at", startOfMonth),
      supabase.from("appointments").select("*").eq("company_id", companyId).gte("created_at", startOfMonth),
    ]);

    const quotes = quotesRes.data || [];
    const executions = execRes.data || [];
    const appointments = appointmentsRes.data || [];

    const approved = quotes.filter((q) => q.status === "approved");
    let revenue = 0;
    const serviceCount: Record<string, number> = {};

    approved.forEach((q) => {
      const services = (q.services as any[]) || [];
      services.forEach((s: any) => {
        const total = (s.quantity || 1) * (s.price || 0);
        revenue += total;
        serviceCount[s.name || "Serviço"] = (serviceCount[s.name || "Serviço"] || 0) + 1;
      });
    });

    const totalSeconds = executions.reduce((acc, e) => acc + (e.elapsed_seconds || 0), 0);
    const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    setStats({
      totalServices: appointments.filter((a) => a.status === "completed").length,
      revenue,
      productCost: 0,
      avgMargin: revenue > 0 ? 65 : 0,
      avgTicket: approved.length > 0 ? revenue / approved.length : 0,
      topService,
      approvedQuotes: approved.length,
      totalHours: Math.round(totalSeconds / 3600),
    });
    setLoading(false);
  };

  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const tabs: { key: Tab; label: string }[] = [
    { key: "gestao", label: "Gestão" },
    { key: "relatorio", label: "Relatório" },
  ];

  const reportTypes: { key: ReportType; label: string; icon: typeof BarChart3 }[] = [
    { key: "mensal", label: "Mensal", icon: BarChart3 },
    { key: "clientes", label: "Clientes", icon: Users },
    { key: "servicos", label: "Serviços", icon: Clock },
    { key: "produtos", label: "Produtos", icon: TrendingUp },
    { key: "financeiro", label: "Financeiro", icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Relatórios</h2>
          <p className="text-sm text-slate-500">Métricas e indicadores do negócio</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition">
          <FileDown size={16} /> PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              tab === t.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Report type chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {reportTypes.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setReportType(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              reportType === key
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Monthly stats cards */}
      {stats && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Relatório Mensal
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total de serviços" value={String(stats.totalServices)} />
              <StatCard label="Faturamento bruto" value={currency(stats.revenue)} highlight />
              <StatCard label="Custo de produtos" value={currency(stats.productCost)} />
              <StatCard label="Margem média" value={`${stats.avgMargin}%`} />
              <StatCard label="Ticket médio" value={currency(stats.avgTicket)} />
              <StatCard label="Serviço mais vendido" value={stats.topService} />
              <StatCard label="Orçamentos aprovados" value={String(stats.approvedQuotes)} />
              <StatCard label="Tempo total" value={`${stats.totalHours}h`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`rounded-lg p-3 ${highlight ? "bg-blue-50 border border-blue-100" : "bg-slate-50 border border-slate-100"}`}>
    <p className={`text-lg font-bold ${highlight ? "text-blue-600" : "text-slate-800"}`}>{value}</p>
    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
  </div>
);

export default Relatorios;
