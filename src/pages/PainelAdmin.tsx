import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import PlanBadge from "@/components/PlanBadge";
import { PlanTier } from "@/hooks/useCompanyPlan";
import {
  Shield, Users, Building2, BarChart3, Search,
  ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";

interface CompanyStat {
  id: string;
  name: string;
  plan_tier: PlanTier;
  subscription_status: string;
  subscription_expires_at: string | null;
  trial_ends_at: string | null;
  max_users: number;
  max_clients: number;
  max_quotes_per_month: number;
  created_at: string;
  city: string | null;
  state: string | null;
  client_count: number;
  user_count: number;
  total_quotes: number;
  total_appointments: number;
  total_executions: number;
}

const PainelAdmin = () => {
  const { user } = useAuth();
  const [isMaster, setIsMaster] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyStat[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    checkAccess();
  }, [user]);

  const checkAccess = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.rpc("is_master_admin", { _user_id: user.id });
    setIsMaster(!!data);
    if (data) await loadCompanies();
    setLoading(false);
  };

  const loadCompanies = async () => {
    const { data, error } = await supabase.rpc("get_all_companies_stats");
    if (error) {
      toast.error("Erro ao carregar dados");
      return;
    }
    setCompanies((data as any) || []);
  };

  const changePlan = async (companyId: string, newPlan: PlanTier) => {
    const limits: Record<PlanTier, { max_users: number; max_clients: number; max_quotes_per_month: number }> = {
      free: { max_users: 1, max_clients: 20, max_quotes_per_month: 5 },
      pro: { max_users: 5, max_clients: 100, max_quotes_per_month: 50 },
      premium: { max_users: 15, max_clients: 9999, max_quotes_per_month: 9999 },
    };

    const { error } = await supabase
      .from("companies")
      .update({
        plan_tier: newPlan,
        ...limits[newPlan],
      })
      .eq("id", companyId);

    if (error) {
      toast.error("Erro ao alterar plano");
    } else {
      toast.success("Plano alterado com sucesso");
      await loadCompanies();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isMaster) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-1">Painel Administrativo</h2>
        <p className="text-sm text-slate-500 mb-6">Gestão master do sistema</p>
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Shield className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">Acesso restrito ao administrador master.</p>
        </div>
      </div>
    );
  }

  const filtered = companies.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
      || (c.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalClients = companies.reduce((s, c) => s + (c.client_count || 0), 0);
  const totalUsers = companies.reduce((s, c) => s + (c.user_count || 0), 0);
  const totalExecs = companies.reduce((s, c) => s + (c.total_executions || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Painel Administrativo</h2>
          <p className="text-sm text-slate-500">Visão global da plataforma SaaS</p>
        </div>
        <button onClick={loadCompanies} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Building2, label: "Empresas", value: companies.length, color: "text-blue-600 bg-blue-50" },
          { icon: Users, label: "Usuários", value: totalUsers, color: "text-emerald-600 bg-emerald-50" },
          { icon: Users, label: "Clientes", value: totalClients, color: "text-amber-600 bg-amber-50" },
          { icon: BarChart3, label: "Execuções", value: totalExecs, color: "text-purple-600 bg-purple-50" },
        ].map(({ icon: I, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <I size={18} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(["free", "pro", "premium"] as PlanTier[]).map((tier) => {
          const count = companies.filter((c) => c.plan_tier === tier).length;
          return (
            <div key={tier} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <PlanBadge tier={tier} size="md" />
              <p className="text-2xl font-bold text-slate-800 mt-2">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Buscar empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Companies list */}
      <div className="space-y-2">
        {filtered.map((c) => {
          const expanded = expandedId === c.id;
          return (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpandedId(expanded ? null : c.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 truncate">{c.name}</span>
                    <PlanBadge tier={c.plan_tier} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {c.city && c.state ? `${c.city}/${c.state}` : "Sem localização"} · {c.user_count} usuário(s) · {c.client_count} cliente(s)
                  </p>
                </div>
                {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {expanded && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Clientes</p>
                      <p className="font-semibold text-slate-800">{c.client_count}/{c.max_clients >= 9999 ? "∞" : c.max_clients}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Orçamentos</p>
                      <p className="font-semibold text-slate-800">{c.total_quotes}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Agendamentos</p>
                      <p className="font-semibold text-slate-800">{c.total_appointments}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Execuções</p>
                      <p className="font-semibold text-slate-800">{c.total_executions}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Alterar plano</p>
                    <div className="flex gap-2">
                      {(["free", "pro", "premium"] as PlanTier[]).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => changePlan(c.id, tier)}
                          disabled={c.plan_tier === tier}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            c.plan_tier === tier
                              ? "bg-slate-100 text-slate-400 cursor-default"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          }`}
                        >
                          {tier.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">
                    Cadastrado em {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">Nenhuma empresa encontrada.</p>
        )}
      </div>
    </div>
  );
};

export default PainelAdmin;
