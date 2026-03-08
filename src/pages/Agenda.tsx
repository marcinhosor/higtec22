import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, subDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  Plus, ChevronLeft, ChevronRight, Clock, User, Phone,
  MapPin, X, Check, Calendar as CalIcon, Edit2, Trash2, Play, Navigation
} from "lucide-react";

interface Appointment {
  id: string; client_name: string; client_id: string;
  date: string; time: string; service: string | null;
  status: string | null; notes: string | null;
  collaborator_name: string | null; collaborator_id: string | null;
  company_id: string;
}
interface Client { id: string; name: string; phone: string | null; street: string | null; number: string | null; neighborhood: string | null; city: string | null; }
interface Collaborator { id: string; name: string; }
interface ServiceType { id: string; name: string; }

const STATUS_ORDER = ["pending", "confirmed", "completed", "cancelled"];
const statusConfig: Record<string, { label: string; color: string; border: string }> = {
  pending:   { label: "Agendado",   color: "bg-amber-50 text-amber-700 border-amber-200",  border: "border-l-amber-400" },
  confirmed: { label: "Confirmado", color: "bg-emerald-50 text-emerald-700 border-emerald-200", border: "border-l-emerald-500" },
  completed: { label: "Concluído",  color: "bg-slate-100 text-slate-500 border-slate-200",  border: "border-l-slate-400" },
  cancelled: { label: "Cancelado",  color: "bg-red-50 text-red-600 border-red-200",      border: "border-l-red-400" },
};

const Agenda = () => {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formClientId, setFormClientId] = useState("");
  const [formTime, setFormTime] = useState("08:00");
  const [formService, setFormService] = useState("");
  const [formCollaboratorId, setFormCollaboratorId] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("pending");
  const [formDate, setFormDate] = useState("");
  const [saving, setSaving] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => { if (companyId) loadData(); }, [companyId]);
  useEffect(() => { if (companyId) loadAppointments(); }, [companyId, dateStr]);

  const loadData = async () => {
    if (!companyId) return;
    const [clientsRes, collabRes, servRes] = await Promise.all([
      supabase.from("clients").select("id, name, phone, street, number, neighborhood, city").eq("company_id", companyId).order("name"),
      supabase.from("collaborators").select("id, name").eq("company_id", companyId).eq("status", "ativo").order("name"),
      supabase.from("service_types").select("id, name").eq("company_id", companyId).eq("is_active", true).order("sort_order"),
    ]);
    if (clientsRes.data) setClients(clientsRes.data);
    if (collabRes.data) setCollaborators(collabRes.data);
    if (servRes.data) setServiceTypes(servRes.data);
  };

  const loadAppointments = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase.from("appointments").select("*").eq("company_id", companyId).eq("date", dateStr).order("time");
    if (error) toast.error("Erro ao carregar agenda");
    else setAppointments(data || []);
    setLoading(false);
  };

  const resetForm = () => { setFormClientId(""); setFormTime("08:00"); setFormService(""); setFormCollaboratorId(""); setFormNotes(""); setFormStatus("pending"); setEditingId(null); };
  const openNew = () => { resetForm(); setShowForm(true); };
  const openEdit = (apt: Appointment) => { setFormClientId(apt.client_id); setFormTime(apt.time); setFormService(apt.service || ""); setFormCollaboratorId(apt.collaborator_id || ""); setFormNotes(apt.notes || ""); setFormStatus(apt.status || "pending"); setEditingId(apt.id); setShowForm(true); };

  const handleSave = async () => {
    if (!companyId || !formClientId || !formTime) { toast.error("Preencha cliente e horário"); return; }
    setSaving(true);
    const client = clients.find((c) => c.id === formClientId);
    const collab = collaborators.find((c) => c.id === formCollaboratorId);
    const payload = { company_id: companyId, client_id: formClientId, client_name: client?.name || "", date: dateStr, time: formTime, service: formService || null, collaborator_id: formCollaboratorId || null, collaborator_name: collab?.name || null, notes: formNotes || null, status: formStatus };
    let error;
    if (editingId) ({ error } = await supabase.from("appointments").update(payload).eq("id", editingId));
    else ({ error } = await supabase.from("appointments").insert(payload));
    if (error) toast.error("Erro ao salvar agendamento");
    else { toast.success(editingId ? "Agendamento atualizado!" : "Agendamento criado!"); setShowForm(false); resetForm(); loadAppointments(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este agendamento?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Agendamento excluído"); loadAppointments(); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) toast.error("Erro ao atualizar status");
    else { toast.success("Status atualizado"); loadAppointments(); }
  };

  const getClientInfo = (clientId: string) => clients.find((c) => c.id === clientId);

  const openRoute = (client: Client | undefined) => {
    if (!client?.street) { toast.info("Cliente sem endereço cadastrado"); return; }
    const addr = `${client.street}${client.number ? ` ${client.number}` : ""}, ${client.neighborhood || ""}, ${client.city || ""}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, "_blank");
  };

  // Group by status for summary
  const countByStatus = (s: string) => appointments.filter(a => (a.status || "pending") === s).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Agenda</h2>
          <p className="text-sm text-slate-400">{appointments.length} agendamento{appointments.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-full text-sm font-semibold transition shadow-sm">
          <Plus size={16} /> Novo
        </button>
      </div>

      {/* Date navigator */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-2.5">
        <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ChevronLeft size={18} className="text-slate-500" />
        </button>
        <button onClick={() => setSelectedDate(new Date())}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isToday(selectedDate) ? "bg-sky-500 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          Hoje
        </button>
        <div className="flex-1 text-center">
          <p className="font-semibold text-slate-800 text-sm capitalize">
            {format(selectedDate, "EEEE", { locale: ptBR })}
          </p>
          <p className="text-xs text-slate-400">
            {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ChevronRight size={18} className="text-slate-500" />
        </button>
      </div>

      {/* Status summary pills */}
      {appointments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_ORDER.map(s => {
            const count = countByStatus(s);
            if (count === 0) return null;
            const cfg = statusConfig[s];
            return (
              <span key={s} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                {cfg.label} <span className="font-bold">{count}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Appointments */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" /></div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <CalIcon className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-medium">Nenhum agendamento para este dia</p>
          <button onClick={openNew} className="mt-3 text-sm text-sky-600 hover:text-sky-500 font-medium">+ Criar agendamento</button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => {
            const client = getClientInfo(apt.client_id);
            const status = apt.status || "pending";
            const st = statusConfig[status] || statusConfig.pending;
            const isActive = status === "pending" || status === "confirmed";

            return (
              <div key={apt.id} className={`bg-white rounded-xl border border-slate-100 border-l-4 ${st.border} shadow-sm overflow-hidden ${!isActive ? "opacity-70" : ""}`}>
                {/* Main info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${st.color}`}>{st.label}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock size={11} /> {apt.time}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-[15px] truncate">{apt.client_name}</h3>
                      {apt.service && (
                        <p className="text-xs text-slate-500 mt-0.5">{apt.service}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button onClick={() => openEdit(apt)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-sky-600 transition" title="Editar">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(apt.id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-300 hover:text-red-500 transition" title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                    {apt.collaborator_name && (
                      <span className="flex items-center gap-1"><User size={11} /> {apt.collaborator_name}</span>
                    )}
                    {client?.phone && (
                      <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:text-sky-600 transition">
                        <Phone size={11} /> {client.phone}
                      </a>
                    )}
                    {client?.neighborhood && (
                      <span className="flex items-center gap-1"><MapPin size={11} /> {client.neighborhood}</span>
                    )}
                  </div>

                  {apt.notes && (
                    <p className="text-xs text-slate-400 italic mt-2 border-t border-slate-50 pt-2">"{apt.notes}"</p>
                  )}
                </div>

                {/* Action bar */}
                {isActive && (
                  <div className="flex border-t border-slate-100 divide-x divide-slate-100">
                    <button
                      onClick={() => navigate(`/execucao?appointmentId=${apt.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-sky-600 hover:bg-sky-50 transition"
                    >
                      <Play size={12} /> Iniciar
                    </button>
                    <button
                      onClick={() => openRoute(client)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition"
                    >
                      <Navigation size={12} /> Rota
                    </button>
                    {status === "pending" && (
                      <button
                        onClick={() => updateStatus(apt.id, "confirmed")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition"
                      >
                        <Check size={12} /> Confirmar
                      </button>
                    )}
                    {status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(apt.id, "completed")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition"
                      >
                        <Check size={12} /> Concluir
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Editar Agendamento" : "Novo Agendamento"}</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
                <select value={formClientId} onChange={(e) => setFormClientId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                  <option value="">Selecione um cliente</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Horário *</label>
                  <input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Serviço</label>
                  <select value={formService} onChange={(e) => setFormService(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                    <option value="">Selecione</option>
                    {serviceTypes.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Técnico</label>
                <select value={formCollaboratorId} onChange={(e) => setFormCollaboratorId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                  <option value="">Nenhum</option>
                  {collaborators.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                    <option value="pending">Agendado</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" placeholder="Observações..." />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white rounded-lg disabled:opacity-50 transition shadow-sm">{saving ? "Salvando..." : editingId ? "Atualizar" : "Criar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;