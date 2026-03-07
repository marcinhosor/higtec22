import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan, PLAN_FEATURES } from "@/hooks/useCompanyPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Building2, Palette, CreditCard, Check } from "lucide-react";
import PlanBadge from "@/components/PlanBadge";
import { Link } from "react-router-dom";

type SettingsTab = "empresa" | "aparencia" | "plano";

const THEMES = [
  { id: "default", name: "Azul Padrão", colors: ["#3b82f6", "#1e40af", "#eff6ff"], tier: "free" as const },
  { id: "luxury", name: "Signature Luxo", colors: ["#d4af37", "#1a1a2e", "#f5f0e1"], tier: "pro" as const },
  { id: "royal", name: "Royal Blue Elite", colors: ["#1e3a5f", "#0a1929", "#e8f0fe"], tier: "pro" as const },
  { id: "aqua", name: "Aqua Clean Pro", colors: ["#06b6d4", "#0e7490", "#ecfeff"], tier: "pro" as const },
  { id: "emerald", name: "Emerald Fresh", colors: ["#10b981", "#065f46", "#ecfdf5"], tier: "premium" as const },
  { id: "sunset", name: "Sunset Elegance", colors: ["#f59e0b", "#92400e", "#fffbeb"], tier: "premium" as const },
];

const Configuracoes = () => {
  const { companyId } = useAuth();
  const { planTier } = useCompanyPlan();
  const [activeTab, setActiveTab] = useState<SettingsTab>("empresa");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("default");
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
      setSelectedTheme(data.selected_theme_id || "default");
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
      selected_theme_id: selectedTheme,
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

  const tabs: { key: SettingsTab; label: string; icon: typeof Building2 }[] = [
    { key: "empresa", label: "Empresa", icon: Building2 },
    { key: "aparencia", label: "Aparência", icon: Palette },
    { key: "plano", label: "Plano", icon: CreditCard },
  ];

  const canUseTheme = (tier: string) => {
    if (tier === "free") return true;
    if (tier === "pro") return planTier === "pro" || planTier === "premium";
    return planTier === "premium";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Configurações</h2>
          <p className="text-sm text-slate-500">Personalize sua empresa</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
          <Save size={16} /> {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-5">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition ${
              activeTab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
            }`}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Empresa tab */}
      {activeTab === "empresa" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
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
          <div className="border-t border-slate-100 pt-4">
            <h3 className="font-semibold text-slate-700 mb-3">Redes Sociais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Instagram" value={form.instagram} onChange={(v: string) => setForm({ ...form, instagram: v })} placeholder="@empresa" />
              <Field label="Facebook" value={form.facebook} onChange={(v: string) => setForm({ ...form, facebook: v })} placeholder="facebook.com/empresa" />
              <Field label="Website" value={form.website} onChange={(v: string) => setForm({ ...form, website: v })} placeholder="www.empresa.com" />
            </div>
          </div>
        </div>
      )}

      {/* Aparência tab */}
      {activeTab === "aparencia" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Palette size={18} className="text-blue-600" />
              Temas Visuais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEMES.map((theme) => {
                const available = canUseTheme(theme.tier);
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => available && setSelectedTheme(theme.id)}
                    className={`relative flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
                      isSelected ? "border-blue-500 bg-blue-50" : available ? "border-slate-200 hover:border-slate-300" : "border-slate-100 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex gap-1">
                      {theme.colors.map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{theme.name}</p>
                      {!available && <p className="text-xs text-slate-400">Plano {theme.tier}</p>}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Plano tab */}
      {activeTab === "plano" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-3">Plano Atual</h3>
            <div className="flex items-center gap-3 mb-4">
              <PlanBadge tier={planTier} size="md" />
              <span className="text-sm text-slate-600">{PLAN_FEATURES[planTier].price}</span>
            </div>
            <ul className="space-y-2 mb-4">
              {PLAN_FEATURES[planTier].features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check size={14} className="text-emerald-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/checkout" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition">
              Ver todos os planos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
