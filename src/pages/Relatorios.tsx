import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, Wrench, FlaskConical, DollarSign, MapPin, Download } from "lucide-react";

type ReportType = "mensal" | "clientes" | "servicos" | "produtos" | "financeiro" | "rotas";

interface MonthlyStats {
  totalServices: number; revenue: number; productCost: number;
  avgMargin: number; avgTicket: number; topService: string;
  approvedQuotes: number; totalHours: number;
}

const Relatorios = () => {
  const { companyId } = useAuth();
  const [reportType, setReportType] = useState<ReportType>("mensal");
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (companyId) loadStats(); }, [companyId]);

  const loadStats = async () => {
    if (!companyId) return;
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

    const [quotesRes, execRes, aptsRes] = await Promise.all([
      supabase.from("quotes").select("*").eq("company_id", companyId).gte("created_at", startOfMonth).lte("created_at", endOfMonth + "T23:59:59"),
      supabase.from("service_executions").select("*").eq("company_id", companyId).gte("created_at", startOfMonth),
      supabase.from("appointments").select("*").eq("company_id", companyId).gte("date", startOfMonth).lte("date", endOfMonth).eq("status", "completed"),
    ]);

    const quotes = quotesRes.data || [];
    const approved = quotes.filter(q => q.status === "approved");
    const revenue = approved.reduce((sum, q) => {
      const services = (q.services as any[]) || [];
      return sum + services.reduce((s: number, sv: any) => s + ((sv.quantity || 1) * (sv.unitPrice || 0)), 0);
    }, 0);

    const serviceCount: Record<string, number> = {};
    approved.forEach(q => { ((q.services as any[]) || []).forEach((s: any) => { serviceCount[s.name || "Sem nome"] = (serviceCount[s.name || "Sem nome"] || 0) + 1; }); });
    const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
    const totalHours = (execRes.data || []).reduce((sum, e) => sum + ((e.elapsed_seconds || 0) / 3600), 0);

    setStats({
      totalServices: (aptsRes.data || []).length, revenue, productCost: 0,
      avgMargin: revenue > 0 ? 100 : 0, avgTicket: approved.length > 0 ? revenue / approved.length : 0,
      topService, approvedQuotes: approved.length, totalHours: Math.round(totalHours * 60),
    });
    setLoading(false);
  };

  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const reportTypes: { key: ReportType; label: string; icon: typeof BarChart3 }[] = [
    { key: "mensal", label: "Mensal", icon: BarChart3 },
    { key: "clientes", label: "Clientes", icon: Users },
    { key: "servicos", label: "Serviços", icon: Wrench },
    { key: "produtos", label: "Produtos", icon: FlaskConical },
    { key: "financeiro", label: "Financeiro", icon: DollarSign },
    { key: "rotas", label: "Rotas", icon: MapPin },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-5">Relatórios</h2>

      {/* Report type grid */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {reportTypes.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setReportType(key)}
            className={`flex flex-col items-center gap-1.5 py-4 rounded-xl text-sm font-medium transition ${
              reportType === key ? "bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:border-sky-200"
            }`}>
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : stats && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600" /> Relatório Mensal</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              <Download size={14} /> PDF
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Total de Serviços</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalServices}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Faturamento Bruto</p>
              <p className="text-2xl font-bold text-blue-600">{currency(stats.revenue)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Custo Produtos</p>
              <p className="text-2xl font-bold text-red-500">{currency(stats.productCost)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Margem Média</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgMargin.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Ticket Médio</p>
              <p className="text-xl font-bold text-slate-800">{currency(stats.avgTicket)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Serviço + Vendido</p>
              <p className="text-lg font-bold text-slate-800 truncate">{stats.topService}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Tempo Total</p>
              <p className="text-xl font-bold text-slate-800">{stats.totalHours}min</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Orçamentos Aprovados</p>
              <p className="text-xl font-bold text-slate-800">{stats.approvedQuotes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
