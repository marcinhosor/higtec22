import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus, Search, X, Edit2, Trash2, Phone, MapPin, User, Eye, ChevronDown
} from "lucide-react";

const ESTADOS_BR = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

interface Client {
  id: string;
  name: string;
  phone: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  property_type: string | null;
  observations: string | null;
  created_at: string;
}

const Clientes = () => {
  const { companyId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [form, setForm] = useState({
    name: "", phone: "", street: "", number: "", complement: "",
    neighborhood: "", city: "", state: "", property_type: "", observations: ""
  });

  useEffect(() => {
    if (companyId) loadClients();
  }, [companyId]);

  const loadClients = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("id, name, phone, street, number, complement, neighborhood, city, state, property_type, observations, created_at")
      .eq("company_id", companyId)
      .order("name");
    if (error) toast.error("Erro ao carregar clientes");
    else setClients(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: "", phone: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", property_type: "", observations: "" });
    setEditingId(null);
  };

  const openNew = () => { resetForm(); setShowForm(true); };

  const openEdit = (c: Client) => {
    setForm({
      name: c.name, phone: c.phone || "", street: c.street || "",
      number: c.number || "", complement: c.complement || "",
      neighborhood: c.neighborhood || "", city: c.city || "",
      state: c.state || "", property_type: c.property_type || "",
      observations: c.observations || ""
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!companyId || !form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    const payload = { company_id: companyId, ...form };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("clients").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("clients").insert(payload));
    }

    if (error) toast.error("Erro ao salvar cliente");
    else {
      toast.success(editingId ? "Cliente atualizado!" : "Cliente cadastrado!");
      setShowForm(false);
      resetForm();
      loadClients();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este cliente?")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Cliente excluído"); loadClients(); }
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  const formatAddress = (c: Client) => {
    const parts = [c.street, c.number, c.neighborhood, c.city, c.state].filter(Boolean);
    return parts.join(", ") || null;
  };

  const Field = ({ label, value, onChange, placeholder, type = "text", className = "" }: any) => (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Clientes</h2>
          <p className="text-sm text-slate-400">{clients.length} cliente{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-full text-sm font-semibold transition shadow-sm">
          <Plus size={16} /> Novo
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou telefone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <User className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-medium">{search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}</p>
          {!search && (
            <button onClick={openNew} className="mt-3 text-sm text-blue-600 hover:text-blue-500 font-medium">
              + Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const addr = formatAddress(c);
            const expanded = expandedId === c.id;
            return (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                >
                  <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{c.name}</p>
                    {c.phone && (
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Phone size={12} /> {c.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </div>
                </div>
                {expanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-100 space-y-1.5">
                    {addr && (
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <MapPin size={13} className="flex-shrink-0" /> {addr}
                      </p>
                    )}
                    {c.complement && <p className="text-sm text-slate-500 ml-5">Complemento: {c.complement}</p>}
                    {c.property_type && <p className="text-sm text-slate-500">Tipo: {c.property_type}</p>}
                    {c.observations && <p className="text-sm text-slate-400 italic mt-1">"{c.observations}"</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingId ? "Editar Cliente" : "Novo Cliente"}
              </h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <Field label="Nome *" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} placeholder="Nome do cliente" />
              <Field label="Telefone" value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} placeholder="(00) 00000-0000" type="tel" />

              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-600 mb-3">Endereço</p>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Rua" value={form.street} onChange={(v: string) => setForm({ ...form, street: v })} placeholder="Rua" className="col-span-2" />
                  <Field label="Número" value={form.number} onChange={(v: string) => setForm({ ...form, number: v })} placeholder="Nº" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Field label="Complemento" value={form.complement} onChange={(v: string) => setForm({ ...form, complement: v })} placeholder="Apto, bloco..." />
                  <Field label="Bairro" value={form.neighborhood} onChange={(v: string) => setForm({ ...form, neighborhood: v })} placeholder="Bairro" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Field label="Cidade" value={form.city} onChange={(v: string) => setForm({ ...form, city: v })} placeholder="Cidade" />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                    <select
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">UF</option>
                      {ESTADOS_BR.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <Field label="Tipo de imóvel" value={form.property_type} onChange={(v: string) => setForm({ ...form, property_type: v })} placeholder="Casa, apartamento, comercial..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea
                  value={form.observations}
                  onChange={(e) => setForm({ ...form, observations: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Observações sobre o cliente..."
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">
                Cancelar
              </button>
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

export default Clientes;
