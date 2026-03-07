import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, subDays, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus, ChevronLeft, ChevronRight, Clock, User, Phone,
  MapPin, X, Check, AlertCircle, Calendar as CalIcon, Edit2, Trash2
} from "lucide-react";

interface Appointment {
  id: string;
  client_name: string;
  client_id: string;
  date: string;
  time: string;
  service: string | null;
  status: string | null;
  notes: string | null;
  collaborator_name: string | null;
  collaborator_id: string | null;
  company_id: string;
}

interface Client {
  id: string;
  name: string;
  phone: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
}

interface Collaborator {
  id: string;
  name: string;
}

interface ServiceType {
  id: string;
  name: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Check }> = {
  pending: { label: "Agendado", color: "bg-blue-100 text-blue-700", icon: CalIcon },
  confirmed: { label: "Confirmado", color: "bg-emerald-100 text-emerald-700", icon: Check },
  completed: { label: "Concluído", color: "bg-slate-100 text-slate-600", icon: Check },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: X },
};

const Agenda = () => {
  const { companyId } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formClientId, setFormClientId] = useState("");
  const [formTime, setFormTime] = useState("08:00");
  const [formService, setFormService] = useState("");
  const [formCollaboratorId, setFormCollaboratorId] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("pending");
  const [saving, setSaving] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      loadAppointments();
    }
  }, [companyId, dateStr]);

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
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("company_id", companyId)
      .eq("date", dateStr)
      .order("time");
    if (error) toast.error("Erro ao carregar agenda");
    else setAppointments(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setFormClientId("");
    setFormTime("08:00");
    setFormService("");
    setFormCollaboratorId("");
    setFormNotes("");
    setFormStatus("pending");
    setEditingId(null);
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (apt: Appointment) => {
    setFormClientId(apt.client_id);
    setFormTime(apt.time);
    setFormService(apt.service || "");
    setFormCollaboratorId(apt.collaborator_id || "");
    setFormNotes(apt.notes || "");
    setFormStatus(apt.status || "pending");
    setEditingId(apt.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!companyId || !formClientId || !formTime) {
      toast.error("Preencha cliente e horário");
      return;
    }
    setSaving(true);
    const client = clients.find((c) => c.id === formClientId);
    const collab = collaborators.find((c) => c.id === formCollaboratorId);

    const payload = {
      company_id: companyId,
      client_id: formClientId,
      client_name: client?.name || "",
      date: dateStr,
      time: formTime,
      service: formService || null,
      collaborator_id: formCollaboratorId || null,
      collaborator_name: collab?.name || null,
      notes: formNotes || null,
      status: formStatus,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("appointments").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("appointments").insert(payload));
    }

    if (error) {
      toast.error("Erro ao salvar agendamento");
    } else {
      toast.success(editingId ? "Agendamento atualizado!" : "Agendamento criado!");
      setShowForm(false);
      resetForm();
      loadAppointments();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este agendamento?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Agendamento excluído");
      loadAppointments();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) toast.error("Erro ao atualizar status");
    else loadAppointments();
  };

  const getClientInfo = (clientId: string) => clients.find((c) => c.id === clientId);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Agenda</h2>
          <p className="text-sm text-slate-500">Gerencie seus agendamentos</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} /> Novo Agendamento
        </button>
      </div>

      {/* Date navigator */}
      <div className="flex items-center gap-3 mb-6 bg-white rounded-xl border border-slate-200 p-3">
        <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setSelectedDate(new Date())}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            isToday(selectedDate) ? "bg-blue-600 text-white" : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          Hoje
        </button>
        <span className="flex-1 text-center font-medium text-slate-800 capitalize">
          {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </span>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Appointments list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <CalIcon className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-medium">Nenhum agendamento para este dia</p>
          <button onClick={openNew} className="mt-3 text-sm text-blue-600 hover:text-blue-500 font-medium">
            + Criar agendamento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => {
            const client = getClientInfo(apt.client_id);
            const st = statusConfig[apt.status || "pending"] || statusConfig.pending;
            const StIcon = st.icon;
            return (
              <div key={apt.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-lg font-semibold text-slate-800">{apt.time}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                        <StIcon size={12} /> {st.label}
                      </span>
                    </div>
                    <p className="font-medium text-slate-700">{apt.client_name}</p>
                    {apt.service && <p className="text-sm text-slate-500 mt-0.5">{apt.service}</p>}
                    {client?.phone && (
                      <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                        <Phone size={12} /> {client.phone}
                      </p>
                    )}
                    {client?.street && (
                      <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {client.street}{client.number ? `, ${client.number}` : ""} - {client.neighborhood}
                      </p>
                    )}
                    {apt.collaborator_name && (
                      <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                        <User size={12} /> {apt.collaborator_name}
                      </p>
                    )}
                    {apt.notes && <p className="text-sm text-slate-400 mt-1 italic">"{apt.notes}"</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <button onClick={() => openEdit(apt)} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-blue-600">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(apt.id)} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Quick status buttons */}
                {apt.status !== "completed" && apt.status !== "cancelled" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    {apt.status === "pending" && (
                      <button onClick={() => updateStatus(apt.id, "confirmed")} className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition font-medium">
                        Confirmar
                      </button>
                    )}
                    <button onClick={() => updateStatus(apt.id, "completed")} className="text-xs px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium">
                      Concluir
                    </button>
                    <button onClick={() => updateStatus(apt.id, "cancelled")} className="text-xs px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition font-medium">
                      Cancelar
                    </button>
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
                {editingId ? "Editar Agendamento" : "Novo Agendamento"}
              </h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário *</label>
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Serviço</label>
                <select
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um serviço</option>
                  {serviceTypes.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Collaborator */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Técnico</label>
                <select
                  value={formCollaboratorId}
                  onChange={(e) => setFormCollaboratorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nenhum</option>
                  {collaborators.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Status (edit only) */}
              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Agendado</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Observações do agendamento..."
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50"
              >
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
