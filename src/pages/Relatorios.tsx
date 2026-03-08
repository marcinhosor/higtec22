import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan } from "@/hooks/useCompanyPlan";
import {
  useReportsData, DEFAULT_FILTERS, ReportFilters,
  calcRevenue, calcDiscounts, calcServiceCounts, calcProductCosts, currency, getDateRange,
} from "@/hooks/useReportsData";
import ReportFiltersBar from "@/components/reports/ReportFilters";
import KpiCard from "@/components/reports/KpiCard";
import UpgradeCard from "@/components/reports/UpgradeCard";
import { exportReportPdf } from "@/components/reports/ReportPdfExport";
import {
  BarChart3, Users, Wrench, FlaskConical, DollarSign, MapPin,
  Download, TrendingUp, Percent, Clock, Package, AlertTriangle,
  CheckCircle, XCircle, Truck, Settings2, Eye,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

type Tab = "geral" | "clientes" | "servicos" | "produtos" | "financeiro" | "rotas" | "equipamentos";

const TABS: { key: Tab; label: string; icon: typeof BarChart3; minPlan: "free" | "pro" | "premium" }[] = [
  { key: "geral", label: "Visão Geral", icon: Eye, minPlan: "free" },
  { key: "clientes", label: "Clientes", icon: Users, minPlan: "free" },
  { key: "servicos", label: "Serviços", icon: Wrench, minPlan: "free" },
  { key: "produtos", label: "Produtos", icon: FlaskConical, minPlan: "pro" },
  { key: "financeiro", label: "Financeiro", icon: DollarSign, minPlan: "pro" },
  { key: "rotas", label: "Rotas", icon: MapPin, minPlan: "premium" },
  { key: "equipamentos", label: "Equipamentos", icon: Settings2, minPlan: "premium" },
];

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const PLAN_RANK = { free: 0, pro: 1, premium: 2 };

const Relatorios = () => {
  const { companyId } = useAuth();
  const { planTier, companyName } = useCompanyPlan();
  const { data, loading, loadData } = useReportsData();
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
  const [tab, setTab] = useState<Tab>("geral");

  useEffect(() => {
    if (companyId) loadData(filters);
  }, [companyId]);

  const applyFilters = () => loadData(filters);

  const canAccess = (minPlan: string) => PLAN_RANK[planTier] >= PLAN_RANK[minPlan as keyof typeof PLAN_RANK];

  // Derived stats
  const quotes = data?.quotes || [];
  const approved = quotes.filter(q => q.status === "approved");
  const pending = quotes.filter(q => q.status === "pending");
  const appointments = data?.appointments || [];
  const completedApts = appointments.filter(a => a.status === "completed");
  const executions = data?.executions || [];
  const clients = data?.clients || [];
  const products = data?.products || [];
  const equipment = data?.equipment || [];
  const trips = data?.trips || [];

  const revenue = calcRevenue(quotes);
  const discountsTotal = calcDiscounts(quotes);
  const serviceCounts = calcServiceCounts(quotes);
  const productCost = calcProductCosts(products);
  const ticketMedio = approved.length > 0 ? revenue / approved.length : 0;
  const taxaConversao = quotes.length > 0 ? (approved.length / quotes.length) * 100 : 0;
  const totalHoursMin = executions.reduce((s, e) => s + (e.elapsed_seconds || 0), 0) / 60;
  const margin = revenue - productCost;

  // Clients with services in period
  const clientIdsAtendidos = new Set(appointments.map(a => a.client_id));

  // Service ranking
  const serviceRanking = Object.entries(serviceCounts)
    .sort((a, b) => b[1].revenue - a[1].revenue);
  const topService = serviceRanking[0]?.[0] || "-";

  // Chart data for revenue by service
  const serviceChartData = serviceRanking.slice(0, 8).map(([name, d]) => ({ name: name.length > 12 ? name.slice(0, 12) + "…" : name, valor: d.revenue, qtd: d.count }));

  // Products low stock
  const lowStock = products.filter(p => (p.current_stock_ml || 0) <= (p.min_stock_ml || 0) && (p.min_stock_ml || 0) > 0);

  // Period label
  const { start, end } = getDateRange(filters);
  const periodLabel = `${new Date(start + "T12:00:00").toLocaleDateString("pt-BR")} – ${new Date(end + "T12:00:00").toLocaleDateString("pt-BR")}`;

  // Equipment stats
  const eqMaintenance = equipment.filter(e => e.status === "manutencao");
  const eqMaintenanceCost = equipment.reduce((s, e) => s + (e.maintenance_cost || 0), 0);

  // PDF export
  const handleExportPdf = () => {
    const kpis = [
      { label: "Faturamento Bruto", value: currency(revenue) },
      { label: "Ticket Médio", value: currency(ticketMedio) },
      { label: "Serviços Realizados", value: String(completedApts.length) },
      { label: "Orçamentos Aprovados", value: String(approved.length) },
      { label: "Taxa de Conversão", value: `${taxaConversao.toFixed(1)}%` },
      { label: "Custo Produtos", value: currency(productCost) },
      { label: "Margem Estimada", value: currency(margin) },
      { label: "Clientes Atendidos", value: String(clientIdsAtendidos.size) },
    ];
    const tables = [];
    if (serviceRanking.length > 0) {
      tables.push({
        title: "Serviços",
        head: ["Serviço", "Qtd", "Faturamento"],
        rows: serviceRanking.map(([n, d]) => [n, String(d.count), currency(d.revenue)]),
      });
    }
    exportReportPdf({ companyName, period: periodLabel, kpis, tables });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Relatórios</h2>
          <p className="text-sm text-slate-500">Análise operacional e gerencial</p>
        </div>
        <button onClick={handleExportPdf} disabled={loading || !data}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 shadow-sm">
          <Download size={14} /> PDF
        </button>
      </div>

      {/* Filters */}
      <ReportFiltersBar
        filters={filters}
        onChange={setFilters}
        onApply={applyFilters}
        clients={clients}
        collaborators={data?.collaborators || []}
        serviceTypes={data?.serviceTypes || []}
      />

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              tab === t.key
                ? "bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-md"
                : "bg-white text-slate-500 border border-slate-200 hover:border-sky-200"
            }`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : !data ? (
        <p className="text-center text-slate-400 py-12">Clique em "Aplicar" para carregar os dados.</p>
      ) : (
        <div className="space-y-4">
          {/* ========== VISÃO GERAL ========== */}
          {tab === "geral" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Serviços Realizados" value={completedApts.length} icon={Wrench} />
                <KpiCard label="Faturamento Bruto" value={currency(revenue)} icon={DollarSign} color="text-green-600" />
                <KpiCard label="Custo Produtos" value={currency(productCost)} icon={FlaskConical} color="text-red-500" />
                <KpiCard label="Margem Estimada" value={currency(margin)} icon={TrendingUp} color="text-emerald-600" />
                <KpiCard label="Ticket Médio" value={currency(ticketMedio)} icon={BarChart3} />
                <KpiCard label="Orçamentos Gerados" value={quotes.length} icon={BarChart3} />
                <KpiCard label="Orçam. Aprovados" value={approved.length} icon={CheckCircle} color="text-green-600" />
                <KpiCard label="Taxa Conversão" value={`${taxaConversao.toFixed(1)}%`} icon={Percent} color="text-amber-600" />
                <KpiCard label="Clientes Atendidos" value={clientIdsAtendidos.size} icon={Users} />
                <KpiCard label="Tempo Total" value={`${Math.round(totalHoursMin)} min`} icon={Clock} />
              </div>

              {canAccess("pro") && serviceChartData.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <h3 className="font-semibold text-slate-700 text-sm mb-3">Faturamento por Serviço</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={serviceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => currency(v)} />
                      <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {!canAccess("pro") && (
                <UpgradeCard title="Gráficos avançados" description="Desbloqueie gráficos detalhados e análises completas." plan="Pro" />
              )}
            </>
          )}

          {/* ========== CLIENTES ========== */}
          {tab === "clientes" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Total Cadastrados" value={clients.length} icon={Users} />
                <KpiCard label="Ativos no Período" value={clientIdsAtendidos.size} icon={CheckCircle} color="text-green-600" />
                <KpiCard label="Inativos" value={clients.length - clientIdsAtendidos.size} icon={XCircle} color="text-red-500" />
              </div>

              {/* Top clients by appointments */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <h3 className="font-semibold text-slate-700 text-sm mb-3">Clientes com mais serviços</h3>
                {(() => {
                  const clientAptCount: Record<string, { name: string; count: number }> = {};
                  appointments.forEach(a => {
                    if (!clientAptCount[a.client_id]) clientAptCount[a.client_id] = { name: a.client_name, count: 0 };
                    clientAptCount[a.client_id].count++;
                  });
                  const sorted = Object.values(clientAptCount).sort((a, b) => b.count - a.count).slice(0, 10);
                  if (sorted.length === 0) return <p className="text-sm text-slate-400">Nenhum dado no período.</p>;
                  return (
                    <div className="space-y-2">
                      {sorted.map((c, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-slate-700 truncate">{c.name}</span>
                          <span className="font-semibold text-slate-800">{c.count} serviços</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* ========== SERVIÇOS ========== */}
          {tab === "servicos" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Serviço + Vendido" value={topService} icon={Wrench} />
                <KpiCard label="Total Tipos" value={Object.keys(serviceCounts).length} icon={BarChart3} />
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <h3 className="font-semibold text-slate-700 text-sm mb-3">Ranking de Serviços</h3>
                {serviceRanking.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum serviço no período.</p>
                ) : (
                  <div className="space-y-2">
                    {serviceRanking.map(([name, d], i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-slate-700 truncate flex-1">{name}</span>
                        <span className="text-slate-500 mx-2">{d.count}x</span>
                        <span className="font-semibold text-slate-800">{currency(d.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {canAccess("pro") && serviceChartData.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <h3 className="font-semibold text-slate-700 text-sm mb-3">Serviços por Tipo</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={serviceChartData} dataKey="qtd" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {serviceChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {/* ========== PRODUTOS ========== */}
          {tab === "produtos" && (
            canAccess("pro") ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard label="Produtos Cadastrados" value={products.length} icon={Package} />
                  <KpiCard label="Custo Total Estoque" value={currency(productCost)} icon={DollarSign} color="text-red-500" />
                  <KpiCard label="Estoque Baixo" value={lowStock.length} icon={AlertTriangle} color="text-amber-600" />
                </div>

                {lowStock.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <h3 className="font-semibold text-amber-800 text-sm mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Alertas de Estoque Baixo
                    </h3>
                    <div className="space-y-1.5">
                      {lowStock.map(p => (
                        <div key={p.id} className="text-sm text-amber-700 flex justify-between">
                          <span>{p.name}</span>
                          <span>{((p.current_stock_ml || 0) / 1000).toFixed(1)}L / {((p.min_stock_ml || 0) / 1000).toFixed(1)}L</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <h3 className="font-semibold text-slate-700 text-sm mb-3">Produtos por Custo</h3>
                  {products.length === 0 ? (
                    <p className="text-sm text-slate-400">Nenhum produto cadastrado.</p>
                  ) : (
                    <div className="space-y-2">
                      {[...products].sort((a, b) => (b.cost_per_liter || 0) - (a.cost_per_liter || 0)).slice(0, 10).map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm">
                          <span className="text-slate-700 truncate flex-1">{p.name}</span>
                          <span className="font-semibold text-slate-800">{currency(p.cost_per_liter || 0)}/L</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <UpgradeCard title="Relatório de Produtos" description="Acompanhe consumo, estoque e custos de insumos." plan="Pro" />
            )
          )}

          {/* ========== FINANCEIRO ========== */}
          {tab === "financeiro" && (
            canAccess("pro") ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard label="Faturamento Bruto" value={currency(revenue)} icon={DollarSign} color="text-green-600" />
                  <KpiCard label="Descontos" value={currency(discountsTotal)} icon={Percent} color="text-red-500" />
                  <KpiCard label="Valor Líquido" value={currency(revenue - discountsTotal)} icon={TrendingUp} color="text-emerald-600" />
                  <KpiCard label="Ticket Médio" value={currency(ticketMedio)} icon={BarChart3} />
                  <KpiCard label="Aprovados" value={approved.length} icon={CheckCircle} color="text-green-600" />
                  <KpiCard label="Pendentes" value={pending.length} icon={Clock} color="text-amber-600" />
                  <KpiCard label="Conversão" value={`${taxaConversao.toFixed(1)}%`} icon={Percent} />
                </div>

                {canAccess("premium") && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <h3 className="font-semibold text-slate-700 text-sm mb-3">Orçamentos por Status</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Aprovados", value: approved.length },
                            { name: "Pendentes", value: pending.length },
                            { name: "Rejeitados", value: quotes.filter(q => q.status === "rejected").length },
                          ]}
                          dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <UpgradeCard title="Relatório Financeiro" description="Acompanhe faturamento, descontos, ticket médio e conversão de propostas." plan="Pro" />
            )
          )}

          {/* ========== ROTAS ========== */}
          {tab === "rotas" && (
            canAccess("premium") ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard label="Deslocamentos" value={trips.length} icon={Truck} />
                  <KpiCard label="Custo Estimado" value={currency(trips.reduce((s, t) => s + (t.estimated_cost || 0), 0))} icon={DollarSign} color="text-red-500" />
                  <KpiCard label="Custo Real" value={currency(trips.reduce((s, t) => s + (t.actual_cost || 0), 0))} icon={DollarSign} color="text-amber-600" />
                  <KpiCard label="Km Total" value={`${trips.reduce((s, t) => s + (t.actual_distance_km || 0), 0).toFixed(1)} km`} icon={MapPin} />
                </div>

                {/* Regions */}
                {(() => {
                  const regions: Record<string, number> = {};
                  trips.forEach(t => {
                    const addr = t.destination_address || "Desconhecido";
                    regions[addr] = (regions[addr] || 0) + 1;
                  });
                  const sorted = Object.entries(regions).sort((a, b) => b[1] - a[1]).slice(0, 8);
                  if (sorted.length === 0) return null;
                  return (
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                      <h3 className="font-semibold text-slate-700 text-sm mb-3">Destinos Mais Frequentes</h3>
                      <div className="space-y-2">
                        {sorted.map(([addr, count], i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-slate-700 truncate flex-1">{addr}</span>
                            <span className="font-semibold text-slate-800">{count}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <UpgradeCard title="Relatório de Rotas" description="Analise deslocamentos, custos de combustível e regiões mais atendidas." plan="Premium" />
            )
          )}

          {/* ========== EQUIPAMENTOS ========== */}
          {tab === "equipamentos" && (
            canAccess("premium") ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard label="Cadastrados" value={equipment.length} icon={Settings2} />
                  <KpiCard label="Em Manutenção" value={eqMaintenance.length} icon={Wrench} color="text-amber-600" />
                  <KpiCard label="Custo Manutenção" value={currency(eqMaintenanceCost)} icon={DollarSign} color="text-red-500" />
                </div>

                {(() => {
                  const upcoming = equipment
                    .filter(e => e.next_maintenance_date)
                    .map(e => {
                      const days = Math.ceil((new Date(e.next_maintenance_date!).getTime() - Date.now()) / 86400000);
                      return { ...e, days };
                    })
                    .filter(e => e.days <= 30)
                    .sort((a, b) => a.days - b.days);
                  if (upcoming.length === 0) return null;
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <h3 className="font-semibold text-amber-800 text-sm mb-2">Próximas Manutenções (30 dias)</h3>
                      <div className="space-y-1.5">
                        {upcoming.map(e => (
                          <div key={e.id} className="text-sm text-amber-700 flex justify-between">
                            <span>{e.name}</span>
                            <span className="font-medium">{e.days <= 0 ? "Atrasada" : `${e.days} dias`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <UpgradeCard title="Relatório de Equipamentos" description="Controle manutenções, custos e status dos equipamentos." plan="Premium" />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Relatorios;
