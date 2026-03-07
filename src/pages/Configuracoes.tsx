import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan, PLAN_FEATURES } from "@/hooks/useCompanyPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Palette, CreditCard, Check, Crown, Building2, Sliders, LogOut } from "lucide-react";
import PlanBadge from "@/components/PlanBadge";
import { Link } from "react-router-dom";

const THEMES = [
  { id: "default", name: "Azul Padrão", emoji: "", colors: ["#3b82f6", "#dbeafe", "#1e40af", "#eff6ff"], tier: "free" as const },
  { id: "luxury", name: "Signature Luxo Premium", emoji: "💎", colors: ["#1a1a2e", "#d4af37", "#c87533", "#f5f0e1"], tier: "pro" as const },
  { id: "royal", name: "Royal Blue Elite", emoji: "💠", colors: ["#0a1929", "#1e3a5f", "#2563eb", "#e8f0fe"], tier: "pro" as const },
  { id: "aqua", name: "Aqua Clean Pro", emoji: "🌊", colors: ["#0891b2", "#06b6d4", "#0e7490", "#ecfeff"], tier: "pro" as const },
  { id: "emerald", name: "Emerald Executive", emoji: "🟢", colors: ["#064e3b", "#059669", "#10b981", "#ecfdf5"], tier: "premium" as const },
  { id: "titanium", name: "Titanium Dark", emoji: "🔥", colors: ["#1e293b", "#475569", "#64748b", "#0f172a"], tier: "premium" as const },
];

const Configuracoes = () => {
  const { companyId, signOut } = useAuth();
  const { planTier } = useCompanyPlan();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [form, setForm] = useState({ name: "", phone: "", cnpj: "" });

  useEffect(() => { if (companyId) loadCompany(); }, [companyId]);

  const loadCompany = async () => {
    if (!companyId) return;
    const { data } = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle();
    if (data) {
      setForm({ name: data.name || "", phone: data.phone || "", cnpj: data.cnpj || "" });
      setSelectedTheme(data.selected_theme_id || "default");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("companies").update({
      name: form.name, phone: form.phone || null, cnpj: form.cnpj || null,
      selected_theme_id: selectedTheme,
    }).eq("id", companyId);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Configurações salvas!");
    setSaving(false);
  };

  const canUseTheme = (tier: string) => {
    if (tier === "free") return true;
    if (tier === "pro") return planTier === "pro" || planTier === "premium";
    return planTier === "premium";
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-800">Configurações</h2>
        <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition">
          <LogOut size={16} />
        </button>
      </div>

      {/* Plan section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Crown size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Plano da Conta</h3>
            <p className="text-sm text-slate-400">Gerencie sua assinatura</p>
          </div>
        </div>
        <div className="mb-2">
          <PlanBadge tier={planTier} size="md" />
        </div>
        <p className="text-sm text-slate-500">{PLAN_FEATURES[planTier].features[0]}</p>
      </div>

      {/* Visual Customization */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Palette size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Personalização Visual</h3>
            <p className="text-sm text-slate-400">Escolha a paleta de cores do sistema e PDFs</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {THEMES.map((theme) => {
            const available = canUseTheme(theme.tier);
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => available && setSelectedTheme(theme.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${
                  isSelected ? "border-blue-500 bg-blue-50/50" : available ? "border-slate-100 hover:border-slate-200" : "border-slate-50 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex gap-1">
                  {theme.colors.map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="flex-1 text-sm font-medium text-slate-700">{theme.emoji} {theme.name}</span>
                {isSelected && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Advanced customization hint */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
              <Sliders size={18} className="text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">🎨 Personalização Avançada</p>
              <p className="text-xs text-slate-400">Configure cada cor manualmente com HEX</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company data */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-800">Dados da Empresa</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ (opcional)</label>
            <input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Save button */}
      <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 mb-4 shadow-sm">
        <Save size={16} /> {saving ? "Salvando..." : "Salvar Configurações"}
      </button>
    </div>
  );
};

export default Configuracoes;
