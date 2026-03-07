import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Building2 } from "lucide-react";

const Configuracoes = () => {
  const { companyId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", cnpj: "",
    address: "", neighborhood: "", city: "", state: "",
    instagram: "", facebook: "", website: "",
  });

  useEffect(() => {
    if (companyId) loadCompany();
  }, [companyId]);

  const loadCompany = async () => {
    if (!companyId) return;
    const { data } = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle();
    if (data) {
      setForm({
        name: data.name || "", phone: data.phone || "", email: data.email || "",
        cnpj: data.cnpj || "", address: data.address || "",
        neighborhood: data.neighborhood || "", city: data.city || "",
        state: data.state || "", instagram: data.instagram || "",
        facebook: data.facebook || "", website: data.website || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("companies").update({
      name: form.name, phone: form.phone || null, email: form.email || null,
      cnpj: form.cnpj || null, address: form.address || null,
      neighborhood: form.neighborhood || null, city: form.city || null,
      state: form.state || null, instagram: form.instagram || null,
      facebook: form.facebook || null, website: form.website || null,
    }).eq("id", companyId);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Configurações salvas!");
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  const Field = ({ label, value, onChange, placeholder, type = "text" }: any) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Configurações</h2>
          <p className="text-sm text-slate-500">Dados da empresa</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
          <Save size={16} /> {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="text-slate-400" size={20} />
          <h3 className="font-semibold text-slate-700">Dados da Empresa</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome da empresa" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} placeholder="Nome" />
          <Field label="CNPJ" value={form.cnpj} onChange={(v: string) => setForm({ ...form, cnpj: v })} placeholder="00.000.000/0001-00" />
          <Field label="Telefone" value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} placeholder="(00) 00000-0000" />
          <Field label="E-mail" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} placeholder="empresa@email.com" type="email" />
          <Field label="Endereço" value={form.address} onChange={(v: string) => setForm({ ...form, address: v })} placeholder="Rua, número" />
          <Field label="Bairro" value={form.neighborhood} onChange={(v: string) => setForm({ ...form, neighborhood: v })} placeholder="Bairro" />
          <Field label="Cidade" value={form.city} onChange={(v: string) => setForm({ ...form, city: v })} placeholder="Cidade" />
          <Field label="Estado" value={form.state} onChange={(v: string) => setForm({ ...form, state: v })} placeholder="UF" />
        </div>

        <div className="border-t border-slate-100 pt-4 mt-4">
          <h3 className="font-semibold text-slate-700 mb-3">Redes Sociais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Instagram" value={form.instagram} onChange={(v: string) => setForm({ ...form, instagram: v })} placeholder="@empresa" />
            <Field label="Facebook" value={form.facebook} onChange={(v: string) => setForm({ ...form, facebook: v })} placeholder="facebook.com/empresa" />
            <Field label="Website" value={form.website} onChange={(v: string) => setForm({ ...form, website: v })} placeholder="www.empresa.com" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
