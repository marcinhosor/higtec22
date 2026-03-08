import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, subDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronLeft, ChevronRight, Clock, User, MapPin, X, Check, Calendar as CalIcon, Edit2, Trash2, Play, Navigation } from "lucide-react";

interface Appointment { id: string; client_name: string; client_id: string; date: string; time: string; service: string | null; status: string | null; notes: string | null; collaborator_name: string | null; collaborator_id: string | null; company_id: string; }
interface Client { id: string; name: string; phone: string | null; street: string | null; number: string | null; neighborhood: string | null; city: string | null; }
interface Collaborator { id: string; name: string; }
interface ServiceType { id: string; name: string; }

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Agendado", bg: "bg-primary/10", text: "text-primary" },
  confirmed: { label: "Confirmado", bg: "bg-emerald-50", text: "text-emerald-700" },
  completed: { label: "Concluído", bg: "bg-muted", text: "text-muted-foreground" },
  cancelled: { label: "Cancelado", bg: "bg-destructive/10", text: "text-destructive" },
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

  const resetForm = () => { setFormClientId(""); setFormTime("08:00"); setFormService(""); setFormCollaboratorId(""); setFormNotes(""); setFormStatus("pending"); setFormDate(dateStr); setEditingId(null); };
  const openNew = () => { resetForm(); setShowForm(true); };
  const openEdit = (apt: Appointment) => { setFormClientId(apt.client_id); setFormTime(apt.time); setFormService(apt.service || ""); setFormCollaboratorId(apt.collaborator_id || ""); setFormNotes(apt.notes || ""); setFormStatus(apt.status || "pending"); setFormDate(apt.date); setEditingId(apt.id); setShowForm(true); };

  const handleSave = async () => {
    if (!companyId || !formClientId || !formTime || !formDate) { toast.error("Preencha cliente, data e horário"); return; }
    setSaving(true);
    const client = clients.find((c) => c.id === formClientId);
    const collab = collaborators.find((c) => c.id === formCollaboratorId);
    const payload = { company_id: companyId, client_id: formClientId, client_name: client?.name || "", date: formDate, time: formTime, service: formService || null, collaborator_id: formCollaboratorId || null, collaborator_name: collab?.name || null, notes: formNotes || null, status: formStatus };
    let error;
    if (editingId) ({ error } = await supabase.from("appointments").update(payload).eq("id", editingId));
    else ({ error } = await supabase.from("appointments").insert(payload));
    if (error) toast.error("Erro ao salvar");
    else { toast.success(editingId ? "Atualizado!" : "Criado!"); setShowForm(false); resetForm(); loadAppointments(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este agendamento?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Excluído"); loadAppointments(); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) toast.error("Erro");
    else { toast.success("Status atualizado"); loadAppointments(); }
  };

  const getClientInfo = (clientId: string) => clients.find((c) => c.id === clientId);

  const openRoute = (client: Client | undefined) => {
    if (!client?.street) { toast.info("Cliente sem endereço cadastrado"); return; }
    const addr = `${client.street}${client.number ? ` ${client.number}` : ""}, ${client.neighborhood || ""}, ${client.city || ""}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Date navigator */}
      <div className="flex items-center gap-2 bg-card rounded-xl border border-border p-2.5">
        <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-secondary rounded-lg transition">
          <ChevronLeft size={18} className="text-muted-foreground" />
        </button>
        <button onClick={() => setSelectedDate(new Date())}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isToday(selectedDate) ? "bg-primary text-primary-foreground shadow" : "bg-secondary text-foreground hover:bg-muted"}`}>
          Hoje
        </button>
        <div className="flex-1 text-center">
          <p className="font-semibold text-foreground text-sm capitalize">{format(selectedDate, "EEEE", { locale: ptBR })}</p>
          <p className="text-xs text-muted-foreground">{format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-secondary rounded-lg transition">
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Appointments */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <CalIcon className="mx-auto text-muted-foreground/30 mb-3" size={40} />
          <p className="text-muted-foreground font-medium">Nenhum agendamento para este dia</p>
          <button onClick={openNew} className="mt-3 text-sm text-primary hover:text-primary/80 font-medium">+ Criar agendamento</button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => {
            const client = getClientInfo(apt.client_id);
            const status = apt.status || "pending";
            const st = statusConfig[status] || statusConfig.pending;
            const isActive = status === "pending" || status === "confirmed";

            return (
              <div key={apt.id} className="bg-card rounded-xl border-l-4 border-l-primary border border-border shadow-sm p-4">
                {/* Top row: name + actions */}
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-bold text-foreground text-base">{apt.client_name}</h3>
                    <p className="text-sm text-muted-foreground">{format(new Date(apt.date + "T00:00"), "dd/MM/yyyy")} às {apt.time}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(apt)} className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-primary transition"><Edit2 size={16} /></button>
                    <button onClick={() => isActive && updateStatus(apt.id, status === "pending" ? "confirmed" : "completed")} className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-emerald-600 transition"><Check size={16} /></button>
                    <button onClick={() => handleDelete(apt.id)} className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-destructive transition"><Trash2 size={16} /></button>
                  </div>
                </div>

                {/* Service badge */}
                {apt.service && (
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">{apt.service}</span>
                )}

                {/* Action buttons */}
                {isActive && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button onClick={() => navigate(`/execucao?appointmentId=${apt.id}`)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:bg-primary/90 transition shadow-sm">
                      <Play size={12} /> Iniciar Serviço
                    </button>
                    <button onClick={() => openRoute(client)} className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border text-foreground rounded-full text-xs font-medium hover:bg-secondary transition">
                      <MapPin size={12} /> Rota
                    </button>
                    <button onClick={() => { if (client) openEdit(apt); }} className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border text-foreground rounded-full text-xs font-medium hover:bg-secondary transition">
                      <User size={12} /> Editar Cliente
                    </button>
                    <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                  </div>
                )}

                {!isActive && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-2 ${st.bg} ${st.text}`}>{st.label}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">{editingId ? "Editar Agendamento" : "Novo Agendamento"}</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Cliente *</label>
                <select value={formClientId} onChange={(e) => setFormClientId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Selecione um cliente</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Data *</label>
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Horário *</label>
                  <input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Serviço</label>
                  <select value={formService} onChange={(e) => setFormService(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Selecione</option>
                    {serviceTypes.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Técnico</label>
                <select value={formCollaboratorId} onChange={(e) => setFormCollaboratorId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Nenhum</option>
                  {collaborators.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="pending">Agendado</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Observações</label>
                <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Observações..." />
              </div>
            </div>
            <div className="p-5 border-t border-border flex gap-3 justify-end">
              <button onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg transition">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-50 transition shadow-sm">{saving ? "Salvando..." : editingId ? "Atualizar" : "Criar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
