import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Wrench, X, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Equipment {
  id: string; name: string; model: string | null; serial_number: string | null;
  status: string | null; purchase_date: string | null; purchase_cost: number | null;
  maintenance_cost: number | null; next_maintenance_date: string | null;
  observations: string | null; company_id: string;
}

const statusIcon: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  operacional: { icon: CheckCircle, color: "text-emerald-500", label: "Operacional" },
  manutencao: { icon: AlertTriangle, color: "text-amber-500", label: "Em Manutenção" },
  inativo: { icon: XCircle, color: "text-red-500", label: "Inativo" },
};

const Equipamentos = () => {
  const { companyId } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", model: "", serial_number: "", status: "operacional", purchase_cost: "", maintenance_cost: "", next_maintenance_date: "", observations: "" });

  useEffect(() => { if (companyId) load(); }, [companyId]);

  const load = async () => {
    const { data } = await supabase.from("equipment").select("*").eq("company_id", companyId!).order("name");
    if (data) setEquipment(data);
    setLoading(false);
  };

  const resetForm = () => setForm({ name: "", model: "", serial_number: "", status: "operacional", purchase_cost: "", maintenance_cost: "", next_maintenance_date: "", observations: "" });

  const openEdit = (e: Equipment) => {
    setForm({ name: e.name, model: e.model || "", serial_number: e.serial_number || "", status: e.status || "operacional", purchase_cost: e.purchase_cost?.toString() || "", maintenance_cost: e.maintenance_cost?.toString() || "", next_maintenance_date: e.next_maintenance_date || "", observations: e.observations || "" });
    setEditingId(e.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!companyId || !form.name) { toast.error("Informe o nome"); return; }
    const payload = { company_id: companyId, name: form.name, model: form.model || null, serial_number: form.serial_number || null, status: form.status, purchase_cost: form.purchase_cost ? parseFloat(form.purchase_cost) : null, maintenance_cost: form.maintenance_cost ? parseFloat(form.maintenance_cost) : null, next_maintenance_date: form.next_maintenance_date || null, observations: form.observations || null };
    let error;
    if (editingId) ({ error } = await supabase.from("equipment").update(payload).eq("id", editingId));
    else ({ error } = await supabase.from("equipment").insert(payload));
    if (error) toast.error("Erro ao salvar");
    else { toast.success("Salvo!"); setShowForm(false); resetForm(); setEditingId(null); load(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir equipamento?")) return;
    const { error } = await supabase.from("equipment").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Excluído"); load(); }
  };

  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getDaysUntilMaintenance = (dateStr: string | null) => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-800">Equipamentos</h2>
        <button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-full text-sm font-semibold transition shadow-sm">
          <Plus size={16} /> Novo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : equipment.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Wrench className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">Nenhum equipamento cadastrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {equipment.map((eq) => {
            const si = statusIcon[eq.status || "operacional"] || statusIcon.operacional;
            const SIcon = si.icon;
            const daysUntil = getDaysUntilMaintenance(eq.next_maintenance_date);
            return (
              <div key={eq.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{eq.name}</h3>
                    <SIcon size={18} className={si.color} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(eq)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(eq.id)} className="p-2 hover:bg-slate-100 rounded-lg text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
                {eq.model && <p className="text-sm text-slate-500">{eq.model}</p>}
                {eq.serial_number && <p className="text-sm text-slate-400">S/N: {eq.serial_number}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{si.label}</span>
                  {daysUntil !== null && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${daysUntil <= 7 ? "bg-red-100 text-red-700" : daysUntil <= 30 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      <AlertTriangle size={12} /> {daysUntil}d
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-slate-500">
                  {eq.purchase_cost != null && <span>Custo: {currency(eq.purchase_cost)}</span>}
                  {eq.next_maintenance_date && <span>Próxima: {new Date(eq.next_maintenance_date).toLocaleDateString("pt-BR")}</span>}
                  <span>Custo man.: {currency(eq.maintenance_cost || 0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Editar Equipamento" : "Novo Equipamento"}</h3>
              <button onClick={() => { setShowForm(false); resetForm(); setEditingId(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Nome *", key: "name", placeholder: "Ex: Extratora" },
                { label: "Modelo", key: "model", placeholder: "Modelo" },
                { label: "Número de Série", key: "serial_number", placeholder: "S/N" },
                { label: "Custo de Aquisição (R$)", key: "purchase_cost", placeholder: "0.00", type: "number" },
                { label: "Custo Manutenção (R$)", key: "maintenance_cost", placeholder: "0.00", type: "number" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input type={type || "text"} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="operacional">Operacional</option><option value="manutencao">Em Manutenção</option><option value="inativo">Inativo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Próxima Manutenção</label>
                <input type="date" value={form.next_maintenance_date} onChange={(e) => setForm({ ...form, next_maintenance_date: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => { setShowForm(false); resetForm(); setEditingId(null); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipamentos;
