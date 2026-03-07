import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, FlaskConical, X, Package, RefreshCcw } from "lucide-react";

interface Product {
  id: string; name: string; manufacturer: string | null; type: string | null;
  dilution: string | null; ph: number | null; cost_per_liter: number | null;
  current_stock_ml: number | null; min_stock_ml: number | null;
  stock_status: string | null; last_restock_date: string | null; company_id: string;
}
interface Manufacturer { id: string; name: string; }

const productTypes = ["detergente", "desinfetante", "amaciante", "removedor", "impermeabilizante", "outro"];

const Produtos = () => {
  const { companyId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showRestock, setShowRestock] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [restockProductId, setRestockProductId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState("");
  const [restockCost, setRestockCost] = useState("");
  const [newManufacturer, setNewManufacturer] = useState("");
  const [form, setForm] = useState({ name: "", manufacturer: "", type: "", dilution: "", ph: "", cost_per_liter: "", current_stock_ml: "", min_stock_ml: "" });

  useEffect(() => { if (companyId) loadAll(); }, [companyId]);

  const loadAll = async () => {
    const [pRes, mRes] = await Promise.all([
      supabase.from("products").select("*").eq("company_id", companyId!).order("name"),
      supabase.from("manufacturers").select("*").eq("company_id", companyId!).order("name"),
    ]);
    if (pRes.data) setProducts(pRes.data);
    if (mRes.data) setManufacturers(mRes.data);
    setLoading(false);
  };

  const resetForm = () => setForm({ name: "", manufacturer: "", type: "", dilution: "", ph: "", cost_per_liter: "", current_stock_ml: "", min_stock_ml: "" });

  const openEdit = (p: Product) => {
    setForm({ name: p.name, manufacturer: p.manufacturer || "", type: p.type || "", dilution: p.dilution || "", ph: p.ph?.toString() || "", cost_per_liter: p.cost_per_liter?.toString() || "", current_stock_ml: p.current_stock_ml?.toString() || "", min_stock_ml: p.min_stock_ml?.toString() || "" });
    setEditingId(p.id); setShowForm(true);
  };

  const calcStockStatus = (current: number | null, min: number | null) => {
    if (!current || current <= 0) return "sem_estoque";
    if (min && current <= min) return "baixo";
    return "ok";
  };

  const handleSave = async () => {
    if (!companyId || !form.name) { toast.error("Informe o nome"); return; }
    const currentMl = form.current_stock_ml ? parseFloat(form.current_stock_ml) : null;
    const minMl = form.min_stock_ml ? parseFloat(form.min_stock_ml) : null;
    const payload = { company_id: companyId, name: form.name, manufacturer: form.manufacturer || null, type: form.type || null, dilution: form.dilution || null, ph: form.ph ? parseFloat(form.ph) : null, cost_per_liter: form.cost_per_liter ? parseFloat(form.cost_per_liter) : null, current_stock_ml: currentMl, min_stock_ml: minMl, stock_status: calcStockStatus(currentMl, minMl) };
    let error;
    if (editingId) ({ error } = await supabase.from("products").update(payload).eq("id", editingId));
    else ({ error } = await supabase.from("products").insert(payload));
    if (error) toast.error("Erro ao salvar");
    else { toast.success("Salvo!"); setShowForm(false); resetForm(); setEditingId(null); loadAll(); }
  };

  const handleRestock = async () => {
    if (!restockProductId || !restockQty) return;
    const product = products.find(p => p.id === restockProductId);
    if (!product) return;
    const addMl = parseFloat(restockQty) * 1000;
    const newStock = (product.current_stock_ml || 0) + addMl;
    const newCost = restockCost ? parseFloat(restockCost) : product.cost_per_liter;
    const { error } = await supabase.from("products").update({ current_stock_ml: newStock, cost_per_liter: newCost, last_restock_date: new Date().toISOString().split("T")[0], stock_status: calcStockStatus(newStock, product.min_stock_ml) }).eq("id", restockProductId);
    if (error) toast.error("Erro ao repor");
    else { toast.success("Estoque reposto!"); setShowRestock(false); setRestockProductId(null); setRestockQty(""); setRestockCost(""); loadAll(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("Erro");
    else { toast.success("Excluído"); loadAll(); }
  };

  const addManufacturer = async () => {
    if (!newManufacturer.trim() || !companyId) return;
    const { data, error } = await supabase.from("manufacturers").insert({ company_id: companyId, name: newManufacturer.trim() }).select().single();
    if (error) toast.error("Erro ao adicionar");
    else { setManufacturers([...manufacturers, data]); setForm({ ...form, manufacturer: data.name }); setNewManufacturer(""); toast.success("Fabricante adicionado"); }
  };

  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const getStockPercent = (p: Product) => {
    if (!p.current_stock_ml || !p.min_stock_ml) return p.current_stock_ml ? 100 : 0;
    const max = p.min_stock_ml * 3;
    return Math.min(100, Math.round((p.current_stock_ml / max) * 100));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-800">Produtos</h2>
        <button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-semibold transition">
          <Plus size={16} /> Novo
        </button>
      </div>

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <FlaskConical className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const stockPct = getStockPercent(p);
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">{p.name}</h3>
                    {p.manufacturer && <p className="text-sm text-slate-500">{p.manufacturer}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-slate-100 rounded-lg text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.type && <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{p.type}</span>}
                  {p.ph != null && <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">pH {p.ph}</span>}
                </div>

                <div className="mt-3 bg-slate-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} className="text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">Estoque</span>
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-500">Disponível</span>
                    <span className="text-sm font-bold text-blue-600">{p.current_stock_ml ? (p.current_stock_ml / 1000).toFixed(2) + "L" : "0L"}</span>
                  </div>
                  <div className="w-full bg-slate-300 rounded-full h-2 mb-3">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${stockPct}%` }} />
                  </div>
                  <button onClick={() => { setRestockProductId(p.id); setShowRestock(true); }} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 transition">
                    <RefreshCcw size={14} /> Repor Estoque
                  </button>
                </div>

                {p.cost_per_liter != null && (
                  <div className="mt-3 flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-sm text-slate-500">Custo/litro</span>
                    <span className="text-sm font-bold text-red-500">{currency(p.cost_per_liter)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showRestock && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Repor Estoque</h3>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Quantidade (litros)</label><input type="number" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Novo custo/litro (R$)</label><input type="number" value={restockCost} onChange={(e) => setRestockCost(e.target.value)} placeholder="Manter atual" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowRestock(false); setRestockProductId(null); }} className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleRestock} className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500">Repor</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Editar Produto" : "Novo Produto"}</h3>
              <button onClick={() => { setShowForm(false); resetForm(); setEditingId(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500" /></div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fabricante</label>
                <select value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Selecionar</option>
                  {manufacturers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                <div className="flex gap-2 mt-2">
                  <input value={newManufacturer} onChange={(e) => setNewManufacturer(e.target.value)} placeholder="Novo fabricante" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  <button onClick={addManufacturer} className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg">+</button>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"><option value="">Selecionar</option>{productTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Diluição</label><input value={form.dilution} onChange={(e) => setForm({ ...form, dilution: e.target.value })} placeholder="1:10" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">pH</label><input type="number" value={form.ph} onChange={(e) => setForm({ ...form, ph: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Custo/litro (R$)</label><input type="number" value={form.cost_per_liter} onChange={(e) => setForm({ ...form, cost_per_liter: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Estoque (ml)</label><input type="number" value={form.current_stock_ml} onChange={(e) => setForm({ ...form, current_stock_ml: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Estoque mínimo (ml)</label><input type="number" value={form.min_stock_ml} onChange={(e) => setForm({ ...form, min_stock_ml: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" /></div>
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => { setShowForm(false); resetForm(); setEditingId(null); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produtos;
