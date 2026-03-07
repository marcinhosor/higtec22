import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, Wrench, X, ChevronDown, AlertTriangle } from "lucide-react";

interface Equipment {
  id: string; name: string; model: string | null; serial_number: string | null;
  status: string | null; purchase_date: string | null; purchase_cost: number | null;
  maintenance_cost: number | null; next_maintenance_date: string | null;
  observations: string | null; company_id: string;
}

const Equipamentos = () => {
  const { companyId } = useAuth();
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", model: "", serial_number: "", status: "ativo",
    purchase_date: "", purchase_cost: "", maintenance_cost: "",
    next_maintenance_date: "", observations: "",
  });

  useEffect(() => { if (companyId) load(); }, [companyId]);

  const load = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase.from("equipment").select("*").eq("company_id", companyId).order("name");
    if (data) setItems(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: "", model: "", serial_number: "", status: "ativo", purchase_date: "", purchase_cost: "", maintenance_cost: "", next_maintenance_date: "", observations: "" });
    setEditingId(null);
  };

  const openEdit = (e: Equipment) => {
    setForm({
      name: e.name, model: e.model || "", serial_number: e.serial_number || "",
      status: e.status || "ativo", purchase_date: e.purchase_date || "",
      purchase_cost: e.purchase_cost != null ? String(e.purchase_cost) : "",
      maintenance_cost: e.maintenance_cost != null ? String(e.maintenance_cost) : "",
      next_maintenance_date: e.next_maintenance_date || "", observations: e.observations || "",
    });
    setEditingId(e.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!companyId || !form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    const payload = {
      company_id: companyId, name: form.name, model: form.model || null,
      serial_number: form.serial_number || null, status: form.status,
      purchase_date: form.purchase_date || null,
      purchase_cost: form.purchase_cost ? parseFloat(form.purchase_cost) : null,
      maintenance_cost: form.maintenance_cost ? parseFloat(form.maintenance_cost) : null,
      next_maintenance_date: form.next_maintenance_date || null,
      observations: form.observations || null,
    };
    let error;
    if (editingId) ({ error } = await supabase.from("equipment").update(payload).eq("id", editingId));
    else ({ error } = await supabase.from("equipment").insert(payload));
    if (error) toast.error("Erro ao salvar");
    else { toast.success(editingId ? "Atualizado!" : "Cadastrado!"); setShowForm(false); resetForm(); load(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir?")) return;
    await supabase.from("equipment").delete().eq("id", id);
    toast.success("Excluído"); load();
  };

  const filtered = items.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Equipamentos</h2>
          <p className="text-sm text-slate-500">{items.length} equipamento{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition">
          <Plus size={16} /> Novo Equipamento
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Wrench className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-medium">Nenhum equipamento</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(e => {
            const expanded = expandedId === e.id;
            return (
              <div key={e.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition" onClick={() => setExpandedId(expanded ? null : e.id)}>
                  <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center flex-shrink-0"><Wrench size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800">{e.name}</p>
                    {e.model && <p className="text-sm text-slate-500">{e.model}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {e.status === "ativo" ? "Ativo" : "Inativo"}
                    </span>
                    <button onClick={ev => { ev.stopPropagation(); openEdit(e); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition"><Edit2 size={16} /></button>
                    <button onClick={ev => { ev.stopPropagation(); handleDelete(e.id); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </div>
                </div>
                {expanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 grid grid-cols-2 gap-3 pt-3 text-sm">
                    {e.serial_number && <div><span className="text-slate-500">Nº Série:</span> <span className="text-slate-700">{e.serial_number}</span></div>}
                    {e.purchase_cost != null && <div><span className="text-slate-500">Custo:</span> <span className="text-slate-700">{currency(e.purchase_cost)}</span></div>}
                    {e.next_maintenance_date && <div><span className="text-slate-500">Próx. manutenção:</span> <span className="text-slate-700">{e.next_maintenance_date}</span></div>}
                    {e.observations && <div className="col-span-2"><span className="text-slate-400 italic">"{e.observations}"</span></div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Editar" : "Novo"} Equipamento</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Nome *", key: "name", placeholder: "Nome do equipamento" },
                { label: "Modelo", key: "model", placeholder: "Modelo" },
                { label: "Nº Série", key: "serial_number", placeholder: "Número de série" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Custo (R$)</label>
                  <input type="number" value={form.purchase_cost} onChange={e => setForm({ ...form, purchase_cost: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Próx. Manutenção</label>
                  <input type="date" value={form.next_maintenance_date} onChange={e => setForm({ ...form, next_maintenance_date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50">
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipamentos;
