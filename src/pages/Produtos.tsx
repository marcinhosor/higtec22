import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus, Search, X, Edit2, Trash2, FlaskConical, AlertTriangle,
  ChevronDown, Package, DollarSign
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  manufacturer: string | null;
  type: string | null;
  dilution: string | null;
  ph: number | null;
  cost_per_liter: number | null;
  current_stock_ml: number | null;
  min_stock_ml: number | null;
  stock_status: string | null;
  last_restock_date: string | null;
  company_id: string;
}

interface Manufacturer { id: string; name: string; }

const stockStatusLabel: Record<string, { label: string; color: string }> = {
  ok: { label: "Normal", color: "bg-emerald-100 text-emerald-700" },
  low: { label: "Baixo", color: "bg-amber-100 text-amber-700" },
  critical: { label: "Crítico", color: "bg-red-100 text-red-700" },
};

const productTypes = ["Detergente", "Impermeabilizante", "Desinfetante", "Removedor", "Amaciante", "Outro"];

const Produtos = () => {
  const { companyId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showRestock, setShowRestock] = useState<string | null>(null);
  const [restockMl, setRestockMl] = useState(0);
  const [restockCost, setRestockCost] = useState(0);

  const [form, setForm] = useState({
    name: "", manufacturer: "", type: "", dilution: "",
    ph: "", cost_per_liter: "", current_stock_ml: "", min_stock_ml: "",
  });
  const [newManufacturer, setNewManufacturer] = useState("");

  useEffect(() => { if (companyId) loadAll(); }, [companyId]);

  const loadAll = async () => {
    if (!companyId) return;
    setLoading(true);
    const [pRes, mRes] = await Promise.all([
      supabase.from("products").select("*").eq("company_id", companyId).order("name"),
      supabase.from("manufacturers").select("id, name").eq("company_id", companyId).order("name"),
    ]);
    if (pRes.data) setProducts(pRes.data.map(p => ({
      ...p, manufacturer: p.manufacturer || "", type: p.type || "",
      dilution: p.dilution || "", stock_status: calcStockStatus(p.current_stock_ml, p.min_stock_ml),
    })));
    if (mRes.data) setManufacturers(mRes.data);
    setLoading(false);
  };

  const calcStockStatus = (current: number | null, min: number | null): string => {
    if (current == null || min == null || min === 0) return "ok";
    if (current <= min * 0.3) return "critical";
    if (current <= min) return "low";
    return "ok";
  };

  const resetForm = () => {
    setForm({ name: "", manufacturer: "", type: "", dilution: "", ph: "", cost_per_liter: "", current_stock_ml: "", min_stock_ml: "" });
    setEditingId(null); setNewManufacturer("");
  };

  const openNew = () => { resetForm(); setShowForm(true); };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, manufacturer: p.manufacturer || "", type: p.type || "",
      dilution: p.dilution || "", ph: p.ph != null ? String(p.ph) : "",
      cost_per_liter: p.cost_per_liter != null ? String(p.cost_per_liter) : "",
      current_stock_ml: p.current_stock_ml != null ? String(p.current_stock_ml) : "",
      min_stock_ml: p.min_stock_ml != null ? String(p.min_stock_ml) : "",
    });
    setEditingId(p.id); setShowForm(true);
  };

  const addManufacturer = async () => {
    if (!companyId || !newManufacturer.trim()) return;
    const { data, error } = await supabase.from("manufacturers").insert({ company_id: companyId, name: newManufacturer.trim() }).select().single();
    if (error) toast.error("Erro ao adicionar fabricante");
    else {
      setManufacturers([...manufacturers, data]);
      setForm({ ...form, manufacturer: data.name });
      setNewManufacturer("");
      toast.success("Fabricante adicionado!");
    }
  };

  const handleSave = async () => {
    if (!companyId || !form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);

    const stockMl = parseFloat(form.current_stock_ml) || 0;
    const minMl = parseFloat(form.min_stock_ml) || 0;

    const payload = {
      company_id: companyId, name: form.name, manufacturer: form.manufacturer || null,
      type: form.type || null, dilution: form.dilution || null,
      ph: form.ph ? parseFloat(form.ph) : null,
      cost_per_liter: form.cost_per_liter ? parseFloat(form.cost_per_liter) : null,
      current_stock_ml: stockMl, min_stock_ml: minMl,
      stock_status: calcStockStatus(stockMl, minMl),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }

    if (error) toast.error("Erro ao salvar produto");
    else { toast.success(editingId ? "Produto atualizado!" : "Produto cadastrado!"); setShowForm(false); resetForm(); loadAll(); }
    setSaving(false);
  };

  const handleRestock = async () => {
    if (!showRestock || restockMl <= 0) { toast.error("Informe o volume"); return; }
    const product = products.find(p => p.id === showRestock);
    if (!product) return;

    const oldStock = product.current_stock_ml || 0;
    const oldCost = product.cost_per_liter || 0;
    const newStock = oldStock + restockMl;
    // Weighted average cost
    const totalOldValue = (oldStock / 1000) * oldCost;
    const totalNewValue = restockCost > 0 ? restockCost : 0;
    const newCostPerLiter = newStock > 0 ? ((totalOldValue + totalNewValue) / (newStock / 1000)) : oldCost;

    const { error } = await supabase.from("products").update({
      current_stock_ml: newStock,
      cost_per_liter: Math.round(newCostPerLiter * 100) / 100,
      stock_status: calcStockStatus(newStock, product.min_stock_ml),
      last_restock_date: new Date().toISOString().split("T")[0],
    }).eq("id", showRestock);

    if (error) toast.error("Erro ao repor estoque");
    else { toast.success("Estoque reposto!"); setShowRestock(null); setRestockMl(0); setRestockCost(0); loadAll(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Produto excluído"); loadAll(); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.manufacturer && p.manufacturer.toLowerCase().includes(search.toLowerCase()))
  );

  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const formatMl = (ml: number) => ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`;

  const lowStockCount = products.filter(p => p.stock_status === "low" || p.stock_status === "critical").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Produtos</h2>
          <p className="text-sm text-slate-500">{products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition">
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-sm text-amber-700">
          <AlertTriangle size={16} /> {lowStockCount} produto{lowStockCount > 1 ? "s" : ""} com estoque baixo ou crítico
        </div>
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou fabricante..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <FlaskConical className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-medium">{search ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}</p>
          {!search && <button onClick={openNew} className="mt-3 text-sm text-blue-600 hover:text-blue-500 font-medium">+ Cadastrar produto</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const ss = stockStatusLabel[p.stock_status || "ok"] || stockStatusLabel.ok;
            const expanded = expandedId === p.id;
            return (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition" onClick={() => setExpandedId(expanded ? null : p.id)}>
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FlaskConical size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ss.color}`}>{ss.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                      {p.manufacturer && <span>{p.manufacturer}</span>}
                      {p.current_stock_ml != null && <span className="font-medium">{formatMl(p.current_stock_ml)}</span>}
                      {p.cost_per_liter != null && <span>{currency(p.cost_per_liter)}/L</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); setShowRestock(p.id); setRestockMl(0); setRestockCost(0); }}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition" title="Repor estoque">
                      <Package size={16} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); openEdit(p); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition"><Edit2 size={16} /></button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(p.id); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </div>
                </div>
                {expanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-sm">
                    {p.type && <div><span className="text-slate-500">Tipo:</span> <span className="text-slate-700">{p.type}</span></div>}
                    {p.dilution && <div><span className="text-slate-500">Diluição:</span> <span className="text-slate-700">{p.dilution}</span></div>}
                    {p.ph != null && <div><span className="text-slate-500">pH:</span> <span className="text-slate-700">{p.ph}</span></div>}
                    {p.min_stock_ml != null && <div><span className="text-slate-500">Estoque mín.:</span> <span className="text-slate-700">{formatMl(p.min_stock_ml)}</span></div>}
                    {p.last_restock_date && <div><span className="text-slate-500">Última reposição:</span> <span className="text-slate-700">{p.last_restock_date}</span></div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Restock modal */}
      {showRestock && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Repor Estoque</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Volume (ml)</label>
                <input type="number" min={0} value={restockMl} onChange={e => setRestockMl(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custo total (R$)</label>
                <input type="number" min={0} step={0.01} value={restockCost} onChange={e => setRestockCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setShowRestock(null)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
              <button onClick={handleRestock} className="px-6 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition">Repor</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Editar Produto" : "Novo Produto"}</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do produto"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fabricante</label>
                <select value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Selecione</option>
                  {manufacturers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                <div className="flex gap-2 mt-1.5">
                  <input value={newManufacturer} onChange={e => setNewManufacturer(e.target.value)} placeholder="Novo fabricante..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={addManufacturer} disabled={!newManufacturer.trim()} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 disabled:opacity-50 transition">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecione</option>
                    {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diluição</label>
                  <input value={form.dilution} onChange={e => setForm({ ...form, dilution: e.target.value })} placeholder="Ex: 1:10"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">pH</label>
                  <input type="number" step={0.1} value={form.ph} onChange={e => setForm({ ...form, ph: e.target.value })} placeholder="7.0"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Custo/L (R$)</label>
                  <input type="number" step={0.01} value={form.cost_per_liter} onChange={e => setForm({ ...form, cost_per_liter: e.target.value })} placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estoque (ml)</label>
                  <input type="number" value={form.current_stock_ml} onChange={e => setForm({ ...form, current_stock_ml: e.target.value })} placeholder="0"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estoque mínimo (ml)</label>
                <input type="number" value={form.min_stock_ml} onChange={e => setForm({ ...form, min_stock_ml: e.target.value })} placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

export default Produtos;
