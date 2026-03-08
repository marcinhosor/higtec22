import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan, PLAN_FEATURES } from "@/hooks/useCompanyPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Palette, Check, Crown, Building2, LogOut, Zap, Star, ChevronRight, Settings2, Shield, Lock } from "lucide-react";
import PlanBadge from "@/components/PlanBadge";
import { Link } from "react-router-dom";

const DEFAULT_PALETTE = {
  id: "default",
  name: "Paleta Original HigTec",
  emoji: "",
  colors: [
    { label: "Primária", hex: "#3b82f6" },
    { label: "Secundária", hex: "#dbeafe" },
    { label: "Destaque", hex: "#1e40af" },
    { label: "Fundo", hex: "#eff6ff" },
    { label: "Texto", hex: "#1e293b" },
  ],
  tier: "free" as const,
};

const PREMIUM_THEMES = [
  { id: "luxury", name: "Signature Luxo Premium", emoji: "💎", colors: ["#1a1a2e", "#d4af37", "#c87533", "#f5f0e1"], tier: "pro" as const },
  { id: "royal", name: "Royal Blue Elite", emoji: "💠", colors: ["#0a1929", "#1e3a5f", "#2563eb", "#e8f0fe"], tier: "pro" as const },
  { id: "aqua", name: "Aqua Clean Pro", emoji: "🌊", colors: ["#0891b2", "#06b6d4", "#0e7490", "#ecfeff"], tier: "pro" as const },
  { id: "emerald", name: "Emerald Executive", emoji: "🟢", colors: ["#064e3b", "#059669", "#10b981", "#ecfdf5"], tier: "premium" as const },
  { id: "titanium", name: "Titanium Dark", emoji: "🔥", colors: ["#1e293b", "#475569", "#64748b", "#0f172a"], tier: "premium" as const },
];

const THEMES = [
  { id: DEFAULT_PALETTE.id, name: DEFAULT_PALETTE.name, emoji: DEFAULT_PALETTE.emoji, colors: DEFAULT_PALETTE.colors.map(c => c.hex), tier: DEFAULT_PALETTE.tier },
  ...PREMIUM_THEMES,
];

const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: typeof Building2; title: string; subtitle: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
      <Icon size={20} className="text-sky-500" />
    </div>
    <div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const InputField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition placeholder:text-slate-300"
    />
  </div>
);

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

  const planIcons = { free: Star, pro: Zap, premium: Crown };
  const planColors = { free: "bg-slate-100 text-slate-600", pro: "bg-sky-100 text-sky-700", premium: "bg-amber-100 text-amber-700" };
  const currentPlan = PLAN_FEATURES[planTier];
  const PlanIcon = planIcons[planTier];

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-4 pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Configurações</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gerencie sua conta e preferências</p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>

      {/* 1. Dados da Empresa */}
      <SectionCard className="p-6">
        <SectionHeader icon={Building2} title="Dados da Empresa" subtitle="Informações principais do seu negócio" />
        <div className="space-y-4">
          <InputField label="Nome da Empresa" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Telefone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="(00) 00000-0000" />
            <InputField label="CNPJ (opcional)" value={form.cnpj} onChange={(v) => setForm({ ...form, cnpj: v })} placeholder="00.000.000/0001-00" />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-sm"
        >
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </SectionCard>

      {/* 2. Plano da Conta */}
      <SectionCard className="p-6">
        <SectionHeader icon={Shield} title="Plano da Conta" subtitle="Gerencie sua assinatura e benefícios" />

        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-sky-50/50 border border-slate-100 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${planColors[planTier]}`}>
            <PlanIcon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <PlanBadge tier={planTier} size="md" />
            </div>
            <p className="text-xs text-slate-400">{currentPlan.price} • {currentPlan.features[0]}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {currentPlan.features.slice(0, 4).map((f) => (
            <div key={f} className="flex items-start gap-1.5 text-xs text-slate-500 p-2 rounded-lg bg-slate-50">
              <Check size={12} className="text-sky-500 mt-0.5 flex-shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>

        <Link
          to="/checkout"
          className="flex items-center justify-between w-full p-3.5 rounded-xl border border-sky-100 bg-sky-50/50 hover:bg-sky-50 transition group"
        >
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-sky-500" />
            <span className="text-sm font-medium text-sky-700">Ver todos os planos</span>
          </div>
          <ChevronRight size={16} className="text-sky-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </SectionCard>

      {/* 3. Personalização Visual */}
      <SectionCard className="p-6">
        <SectionHeader icon={Palette} title="Personalização Visual" subtitle="Escolha a paleta de cores do sistema e PDFs" />

        {/* Paleta Original - always visible */}
        <div className="mb-4">
          <div className={`p-4 rounded-xl border-2 transition-all ${
            selectedTheme === "default"
              ? "border-sky-400 bg-sky-50/60 shadow-sm"
              : "border-slate-100"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-slate-800">Paleta Original HigTec</span>
              {selectedTheme === "default" && (
                <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {DEFAULT_PALETTE.colors.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-white shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[10px] text-slate-400 font-medium">{c.label}</span>
                </div>
              ))}
            </div>
            {planTier === "free" && selectedTheme !== "default" ? (
              <button
                onClick={() => {
                  setSelectedTheme("default");
                  handleSave();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 text-white text-sm font-semibold transition hover:from-sky-500 hover:to-sky-600"
              >
                Usar paleta original
              </button>
            ) : planTier === "free" && selectedTheme === "default" ? (
              <p className="text-xs text-sky-500 font-medium text-center">✓ Paleta ativa</p>
            ) : null}
          </div>
        </div>

        {/* Personalização de cores - locked for free */}
        {planTier === "free" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={14} className="text-slate-300" />
              <span className="text-sm font-semibold text-slate-500">Personalização de cores</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Personalização de cores disponível apenas nos planos Premium e Pro.
            </p>

            {/* Preview of premium themes - locked */}
            <div className="space-y-2 opacity-50 pointer-events-none">
              {PREMIUM_THEMES.map((theme) => (
                <div
                  key={theme.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 relative"
                >
                  <div className="flex gap-1.5">
                    {theme.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-slate-600 truncate block">
                      {theme.emoji} {theme.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                    <Lock size={10} className="text-amber-500" />
                    <span className="text-[10px] text-amber-600 font-semibold uppercase">
                      {theme.tier === "pro" ? "Pro" : "Premium"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/checkout"
              className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-xl border border-sky-100 bg-sky-50/50 hover:bg-sky-50 transition text-sm font-medium text-sky-700"
            >
              <Crown size={16} className="text-sky-500" />
              Ver planos
            </Link>
          </div>
        ) : (
          /* Pro/Premium: full theme picker */
          <div className="space-y-2">
            {PREMIUM_THEMES.map((theme) => {
              const available = canUseTheme(theme.tier);
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => available && setSelectedTheme(theme.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-sky-400 bg-sky-50/60 shadow-sm"
                      : available
                        ? "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                        : "border-slate-50 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className="flex gap-1.5">
                    {theme.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-700 truncate block">
                      {theme.emoji} {theme.name}
                    </span>
                    {!available && (
                      <span className="text-[10px] text-amber-500 font-medium uppercase tracking-wide">
                        {theme.tier === "pro" ? "Pro" : "Premium"}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* 4. Configurações do Sistema */}
      <SectionCard className="p-6">
        <SectionHeader icon={Settings2} title="Configurações do Sistema" subtitle="Preferências gerais do aplicativo" />

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Notificações push</p>
              <p className="text-xs text-slate-400 mt-0.5">Receba alertas de agenda e estoque</p>
            </div>
            <div className="w-10 h-6 bg-sky-400 rounded-full flex items-center justify-end px-0.5 cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Confirmação de exclusão</p>
              <p className="text-xs text-slate-400 mt-0.5">Pedir confirmação ao excluir registros</p>
            </div>
            <div className="w-10 h-6 bg-sky-400 rounded-full flex items-center justify-end px-0.5 cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Modo compacto</p>
              <p className="text-xs text-slate-400 mt-0.5">Reduza o espaçamento das listas</p>
            </div>
            <div className="w-10 h-6 bg-slate-300 rounded-full flex items-center justify-start px-0.5 cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Footer info */}
      <div className="text-center pt-2 pb-4">
        <p className="text-xs text-slate-300">HigTec v2.0 • Gestão profissional de higienização</p>
      </div>
    </div>
  );
};

export default Configuracoes;
