import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Wrench, FlaskConical, Users, UserX, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";

interface YearStats {
  annualRevenue: number; monthlyAvg: number; avgMargin: number; avgTicket: number;
  topService: string; topProduct: string; activeClients: number; inactiveClients: number;
  monthlyData: { month: string; value: number }[];
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const Painel = () => {
  const { companyId } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<YearStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (companyId) loadStats(); }, [companyId, year]);

  const loadStats = async () => {
    if (!companyId) return;
    setLoading(true);
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31T23:59:59`;

    const [quotesRes, clientsRes] = await Promise.all([
      supabase.from("quotes").select("*").eq("company_id", companyId).eq("status", "approved").gte("created_at", startDate).lte("created_at", endDate),
      supabase.from("clients").select("id, created_at").eq("company_id", companyId),
    ]);

    const quotes = quotesRes.data || [];
    const clients = clientsRes.data || [];

    const monthlyData = MONTHS.map((month, i) => {
      const monthQuotes = quotes.filter(q => new Date(q.created_at).getMonth() === i);
      const revenue = monthQuotes.reduce((sum, q) => {
        const svcs = (q.services as any[]) || [];
        return sum + svcs.reduce((s: number, sv: any) => s + ((sv.quantity || 1) * (sv.unitPrice || 0)), 0);
      }, 0);
      return { month, value: revenue };
    });

    const annualRevenue = monthlyData.reduce((s, m) => s + m.value, 0);
    const activeMonths = monthlyData.filter(m => m.value > 0).length || 1;

    const serviceCount: Record<string, number> = {};
    quotes.forEach(q => { ((q.services as any[]) || []).forEach((s: any) => { serviceCount[s.name || "-"] = (serviceCount[s.name || "-"] || 0) + 1; }); });
    const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const activeClients = clients.filter(c => new Date(c.created_at) >= sixMonthsAgo).length;

    setStats({
      annualRevenue, monthlyAvg: annualRevenue / activeMonths,
      avgMargin: annualRevenue > 0 ? 100 : 0,
      avgTicket: quotes.length > 0 ? annualRevenue / quotes.length : 0,
      topService, topProduct: "-",
      activeClients, inactiveClients: clients.length - activeClients,
      monthlyData,
    });
    setLoading(false);
  };

  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const kpis = stats ? [
    { label: "FATURAMENTO ANUAL", value: currency(stats.annualRevenue), icon: DollarSign, bg: "bg-blue-50" },
    { label: "FATURAMENTO MENSAL", value: currency(stats.monthlyAvg), icon: DollarSign, bg: "bg-blue-50" },
    { label: "MARGEM REAL", value: `${stats.avgMargin.toFixed(1)}%`, icon: TrendingUp, bg: "bg-white border border-slate-100" },
    { label: "TICKET MÉDIO", value: currency(stats.avgTicket), icon: DollarSign, bg: "bg-white border border-slate-100" },
    { label: "SERVIÇO TOP", value: stats.topService, icon: Wrench, bg: "bg-white border border-slate-100", sub: `${stats.annualRevenue > 0 ? "1" : "0"}x` },
    { label: "PRODUTO TOP", value: stats.topProduct, icon: FlaskConical, bg: "bg-white border border-slate-100", sub: "0x" },
    { label: "CLIENTES ATIVOS", value: stats.activeClients.toString(), icon: Users, bg: "bg-white border border-slate-100", sub: `de ${stats.activeClients + stats.inactiveClients}` },
    { label: "INATIVOS", value: stats.inactiveClients.toString(), icon: UserX, bg: "bg-white border border-slate-100" },
  ] : [];

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-5">Painel Estratégico</h2>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp size={22} className="text-blue-600" />
          <h3 className="font-bold text-slate-800 text-lg">Visão Executiva</h3>
        </div>
        <div className="relative">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {kpis.map(({ label, value, icon: Icon, bg, sub }) => (
              <div key={label} className={`${bg} rounded-xl p-4`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={14} className="text-blue-600" />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-xl font-bold text-slate-800 truncate">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Faturamento vs Custo (Mensal)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => currency(v)} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Painel;
