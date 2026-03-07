import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus, Search, X, Edit2, Trash2, FileText, Check, Clock,
  XCircle, CalendarPlus, DollarSign, ChevronDown
} from "lucide-react";

interface ServiceItem {
  name: string;
  quantity: number;
  unit_price: number;
  estimated_minutes: number;
}

interface Quote {
  id: string;
  quote_number: number;
  client_id: string;
  client_name: string;
  services: ServiceItem[];
  discount: number;
  discount_type: string;
  status: string;
  notes: string;
  payment_method: string;
  validity_days: number;
  created_at: string;
  company_id: string;
}

interface Client { id: string; name: string; phone: string | null; }
interface ServiceType { id: string; name: string; default_price: number | null; estimated_minutes: number | null; }

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Aprovado", color: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Recusado", color: "bg-red-100 text-red-700" },
  no_response: { label: "Não respondeu", color: "bg-slate-100 text-slate-600" },
};

const Orcamentos = () => {
  const { companyId } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSchedulePrompt, setShowSchedulePrompt] = useState<string | null>(null);

  // Form state
  const [formClientId, setFormClientId] = useState("");
  const [formServices, setFormServices] = useState<ServiceItem[]>([]);
  const [formDiscount, setFormDiscount] = useState(0);
  const [formDiscountType, setFormDiscountType] = useState("percent");
  const [formNotes, setFormNotes] = useState("");
  const [formPayment, setFormPayment] = useState("");
  const [formValidity, setFormValidity] = useState(15);

  useEffect(() => {
    if (companyId) loadAll();
  }, [companyId]);

  const loadAll = async () => {
    if (!companyId) return;
    setLoading(true);
    const [qRes, cRes, sRes] = await Promise.all([
      supabase.from("quotes").select("*").eq("company_id", companyId).order("quote_number", { ascending: false }),
      supabase.from("clients").select("id, name, phone").eq("company_id", companyId).order("name"),
      supabase.from("service_types").select("id, name, default_price, estimated_minutes").eq("company_id", companyId).eq("is_active", true).order("sort_order"),
    ]);
    if (qRes.data) setQuotes(qRes.data.map(q => ({ ...q, services: (q.services as any) || [], discount: q.discount || 0, discount_type: q.discount_type || "percent", status: q.status || "pending", notes: q.notes || "", payment_method: q.payment_method || "", validity_days: q.validity_days || 15 })));
    if (cRes.data) setClients(cRes.data);
    if (sRes.data) setServiceTypes(sRes.data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormClientId(""); setFormServices([]); setFormDiscount(0);
    setFormDiscountType("percent"); setFormNotes(""); setFormPayment(""); setFormValidity(15);
    setEditingId(null);
  };

  const openNew = () => { resetForm(); setShowForm(true); };

  const openEdit = (q: Quote) => {
    setFormClientId(q.client_id);
    setFormServices(q.services);
    setFormDiscount(q.discount);
    setFormDiscountType(q.discount_type);
    setFormNotes(q.notes);
    setFormPayment(q.payment_method);
    setFormValidity(q.validity_days);
    setEditingId(q.id);
    setShowForm(true);
  };

  const addServiceLine = () => {
    setFormServices([...formServices, { name: "", quantity: 1, unit_price: 0, estimated_minutes: 60 }]);
  };

  const updateServiceLine = (idx: number, field: keyof ServiceItem, value: any) => {
    const updated = [...formServices];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormServices(updated);
  };

  const selectServiceType = (idx: number, stId: string) => {
    const st = serviceTypes.find(s => s.id === stId);
    if (st) {
      const updated = [...formServices];
      updated[idx] = { ...updated[idx], name: st.name, unit_price: st.default_price || 0, estimated_minutes: st.estimated_minutes || 60 };
      setFormServices(updated);
    }
  };

  const removeServiceLine = (idx: number) => {
    setFormServices(formServices.filter((_, i) => i !== idx));
  };

  const calcSubtotal = (services: ServiceItem[]) =>
    services.reduce((sum, s) => sum + s.quantity * s.unit_price, 0);

  const calcTotal = (services: ServiceItem[], discount: number, discountType: string) => {
    const sub = calcSubtotal(services);
    if (discountType === "percent") return sub - (sub * discount / 100);
    return sub - discount;
  };

  const formatQuoteNumber = (num: number) => {
    const year = new Date().getFullYear();
    return `${String(num).padStart(2, "0")}/${year}`;
  };

  const handleSave = async () => {
    if (!companyId || !formClientId || formServices.length === 0) {
      toast.error("Selecione um cliente e adicione pelo menos um serviço");
      return;
    }
    setSaving(true);
    const client = clients.find(c => c.id === formClientId);

    const payload = {
      company_id: companyId,
      client_id: formClientId,
      client_name: client?.name || "",
      services: formServices as any,
      discount: formDiscount,
      discount_type: formDiscountType,
      notes: formNotes || null,
      payment_method: formPayment || null,
      validity_days: formValidity,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("quotes").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("quotes").insert(payload));
    }

    if (error) toast.error("Erro ao salvar orçamento");
    else {
      toast.success(editingId ? "Orçamento atualizado!" : "Orçamento criado!");
      setShowForm(false);
      resetForm();
      loadAll();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este orçamento?")) return;
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Orçamento excluído"); loadAll(); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
    if (error) toast.error("Erro ao atualizar status");
    else {
      if (status === "approved") setShowSchedulePrompt(id);
      loadAll();
    }
  };

  const handleScheduleFromQuote = (quoteId: string) => {
    setShowSchedulePrompt(null);
    // Navigate to agenda — in future can pre-fill
    window.location.href = "/agenda";
  };

  const filtered = quotes.filter(q =>
    q.client_name.toLowerCase().includes(search.toLowerCase()) ||
    formatQuoteNumber(q.quote_number).includes(search)
  );

  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Orçamentos</h2>
          <p className="text-sm text-slate-500">{quotes.length} orçamento{quotes.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition">
          <Plus size={16} /> Novo Orçamento
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cliente ou número..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <FileText className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-medium">{search ? "Nenhum orçamento encontrado" : "Nenhum orçamento criado"}</p>
          {!search && <button onClick={openNew} className="mt-3 text-sm text-blue-600 hover:text-blue-500 font-medium">+ Criar orçamento</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(q => {
            const st = statusConfig[q.status] || statusConfig.pending;
            const total = calcTotal(q.services, q.discount, q.discount_type);
            const expanded = expandedId === q.id;
            return (
              <div key={q.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition" onClick={() => setExpandedId(expanded ? null : q.id)}>
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                    #{q.quote_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-800">{q.client_name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                      <span>{format(new Date(q.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                      <span className="font-semibold text-slate-700">{currency(total)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); openEdit(q); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition"><Edit2 size={16} /></button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(q.id); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {expanded && (
                  <div className="px-4 pb-4 border-t border-slate-100">
                    <table className="w-full text-sm mt-3">
                      <thead><tr className="text-slate-500 text-left"><th className="pb-2">Serviço</th><th className="pb-2 text-center">Qtd</th><th className="pb-2 text-right">Valor</th><th className="pb-2 text-right">Subtotal</th></tr></thead>
                      <tbody>
                        {q.services.map((s, i) => (
                          <tr key={i} className="border-t border-slate-50">
                            <td className="py-1.5 text-slate-700">{s.name}</td>
                            <td className="py-1.5 text-center text-slate-600">{s.quantity}</td>
                            <td className="py-1.5 text-right text-slate-600">{currency(s.unit_price)}</td>
                            <td className="py-1.5 text-right font-medium text-slate-700">{currency(s.quantity * s.unit_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {q.discount > 0 && (
                      <p className="text-sm text-red-500 text-right mt-2">
                        Desconto: {q.discount_type === "percent" ? `${q.discount}%` : currency(q.discount)}
                      </p>
                    )}
                    <p className="text-right font-bold text-slate-800 mt-1">Total: {currency(total)}</p>
                    {q.payment_method && <p className="text-sm text-slate-500 mt-2">Pagamento: {q.payment_method}</p>}
                    {q.notes && <p className="text-sm text-slate-400 italic mt-1">"{q.notes}"</p>}

                    {q.status === "pending" && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                        <button onClick={() => updateStatus(q.id, "approved")} className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition font-medium flex items-center gap-1"><Check size={12} /> Aprovar</button>
                        <button onClick={() => updateStatus(q.id, "rejected")} className="text-xs px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition font-medium flex items-center gap-1"><XCircle size={12} /> Recusar</button>
                        <button onClick={() => updateStatus(q.id, "no_response")} className="text-xs px-3 py-1.5 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-lg transition font-medium flex items-center gap-1"><Clock size={12} /> Sem resposta</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule prompt after approval */}
      {showSchedulePrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <CalendarPlus className="mx-auto text-emerald-500 mb-3" size={36} />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Orçamento Aprovado!</h3>
            <p className="text-sm text-slate-500 mb-5">Deseja agendar o serviço agora?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowSchedulePrompt(null)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Depois</button>
              <button onClick={() => handleScheduleFromQuote(showSchedulePrompt)} className="px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition">Agendar</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Editar Orçamento" : "Novo Orçamento"}</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
                <select value={formClientId} onChange={e => setFormClientId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Services */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Serviços *</label>
                  <button onClick={addServiceLine} className="text-xs text-blue-600 hover:text-blue-500 font-medium flex items-center gap-1"><Plus size={14} /> Adicionar</button>
                </div>
                {formServices.length === 0 && <p className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">Nenhum serviço adicionado</p>}
                {formServices.map((s, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-2 mb-2 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <select value="" onChange={e => selectServiceType(i, e.target.value)} className="w-full px-2 py-2 rounded border border-slate-200 text-sm mb-1">
                        <option value="">Selecionar do catálogo...</option>
                        {serviceTypes.map(st => <option key={st.id} value={st.id}>{st.name} - {currency(st.default_price || 0)}</option>)}
                      </select>
                      <input value={s.name} onChange={e => updateServiceLine(i, "name", e.target.value)} placeholder="Nome do serviço" className="w-full px-2 py-2 rounded border border-slate-200 text-sm" />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div>
                        <label className="text-xs text-slate-500">Qtd</label>
                        <input type="number" min={1} value={s.quantity} onChange={e => updateServiceLine(i, "quantity", parseInt(e.target.value) || 1)} className="w-16 px-2 py-2 rounded border border-slate-200 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Valor (R$)</label>
                        <input type="number" min={0} step={0.01} value={s.unit_price} onChange={e => updateServiceLine(i, "unit_price", parseFloat(e.target.value) || 0)} className="w-24 px-2 py-2 rounded border border-slate-200 text-sm" />
                      </div>
                      <button onClick={() => removeServiceLine(i)} className="p-2 text-red-400 hover:text-red-600"><X size={16} /></button>
                    </div>
                  </div>
                ))}
                {formServices.length > 0 && (
                  <p className="text-right text-sm font-medium text-slate-600 mt-1">
                    Subtotal: {currency(calcSubtotal(formServices))}
                  </p>
                )}
              </div>

              {/* Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Desconto</label>
                  <div className="flex">
                    <input type="number" min={0} value={formDiscount} onChange={e => setFormDiscount(parseFloat(e.target.value) || 0)} className="flex-1 px-3 py-2.5 rounded-l-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={formDiscountType} onChange={e => setFormDiscountType(e.target.value)} className="px-3 py-2.5 rounded-r-lg border-l-0 border border-slate-200 text-sm bg-slate-50">
                      <option value="percent">%</option>
                      <option value="fixed">R$</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Validade (dias)</label>
                  <input type="number" min={1} value={formValidity} onChange={e => setFormValidity(parseInt(e.target.value) || 15)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {formServices.length > 0 && (
                <p className="text-right text-lg font-bold text-slate-800">
                  Total: {currency(calcTotal(formServices, formDiscount, formDiscountType))}
                </p>
              )}

              {/* Payment */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Forma de pagamento</label>
                <input value={formPayment} onChange={e => setFormPayment(e.target.value)} placeholder="Pix, cartão, dinheiro..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Observações do orçamento..." />
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50">
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default Orcamentos;
