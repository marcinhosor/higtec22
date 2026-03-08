import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan, PLAN_FEATURES } from "@/hooks/useCompanyPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Palette, Check, Crown, Building2, LogOut, Zap, Star, ChevronRight, Settings2, Shield, Lock } from "lucide-react";
import PlanBadge from "@/components/PlanBadge";
import { Link, useNavigate } from "react-router-dom";

const PALETTE_PRESETS = [
  {
    id: "default",
    name: "HigTec Blue",
    subtitle: "Padrão do sistema",
    colors: { primary: "#3b82f6", secondary: "#dbeafe", accent: "#1e40af", background: "#eff6ff" },
    tier: "free" as const,
  },
  {
    id: "royal",
    name: "Royal Blue Elite",
    subtitle: "Azul profissional",
    colors: { primary: "#1e3a5f", secondary: "#e8f0fe", accent: "#2563eb", background: "#f0f4f8" },
    tier: "pro" as const,
  },
  {
    id: "aqua",
    name: "Aqua Clean Pro",
    subtitle: "Ciano moderno",
    colors: { primary: "#0891b2", secondary: "#ecfeff", accent: "#0e7490", background: "#f0fdfa" },
    tier: "pro" as const,
  },
  {
    id: "graphite",
    name: "Graphite Tech",
    subtitle: "Cinza sofisticado",
    colors: { primary: "#475569", secondary: "#f1f5f9", accent: "#334155", background: "#f8fafc" },
    tier: "pro" as const,
  },
  {
    id: "emerald",
    name: "Emerald Professional",
    subtitle: "Verde executivo",
    colors: { primary: "#059669", secondary: "#ecfdf5", accent: "#064e3b", background: "#f0fdf4" },
    tier: "premium" as const,
  },
  {
    id: "luxury",
    name: "Signature Luxo",
    subtitle: "Preto e dourado",
    colors: { primary: "#1a1a2e", secondary: "#f5f0e1", accent: "#d4af37", background: "#faf9f6" },
    tier: "premium" as const,
  },
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

const ColorSwatch = ({ color, label }: { color: string; label: string }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div className="w-12 h-12 rounded-xl border-2 border-white shadow-md" style={{ backgroundColor: color }} />
    <span className="text-[10px] text-slate-500 font-medium">{label}</span>
  </div>
);

const Configuracoes = () => {
  const { companyId, signOut } = useAuth();
  const { planTier } = useCompanyPlan();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [customColors, setCustomColors] = useState({ primary: "#3b82f6", secondary: "#dbeafe", accent: "#1e40af" });
  const [form, setForm] = useState({ name: "", phone: "", cnpj: "" });

  useEffect(() => { if (companyId) loadCompany(); }, [companyId]);

  const loadCompany = async () => {
    if (!companyId) return;
    const { data } = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle();
    if (data) {
      setForm({ name: data.name || "", phone: data.phone || "", cnpj: data.cnpj || "" });
      setSelectedTheme(data.selected_theme_id || "default");
      const theme = data.custom_theme as any;
      if (theme?.primary) setCustomColors({ primary: theme.primary, secondary: theme.secondary || "#dbeafe", accent: theme.accent || "#1e40af" });
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

  const handleApplyPalette = async () => {
    if (!companyId) return;
    setSaving(true);
    const preset = PALETTE_PRESETS.find(p => p.id === selectedTheme);
    const themeData = preset ? preset.colors : customColors;
    const { error } = await supabase.from("companies").update({
      selected_theme_id: selectedTheme,
      custom_theme: themeData,
    }).eq("id", companyId);
    if (error) toast.error("Erro ao salvar paleta");
    else toast.success("Paleta aplicada com sucesso!");
    setSaving(false);
  };

  const handleApplyCustomColors = async () => {
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("companies").update({
      selected_theme_id: "custom",
      custom_theme: customColors,
    }).eq("id", companyId);
    if (error) toast.error("Erro ao salvar cores");
    else {
      setSelectedTheme("custom");
      toast.success("Cores personalizadas aplicadas!");
    }
    setSaving(false);
  };

  const canUseTheme = (tier: string) => {
    if (tier === "free") return true;
    if (tier === "pro") return planTier === "pro" || planTier === "premium";
    return planTier === "premium";
  };

  const activePreset = PALETTE_PRESETS.find(p => p.id === selectedTheme) || PALETTE_PRESETS[0];

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
        <SectionHeader icon={Shield} title="Plano da Conta" subtitle="Escolha o melhor plano para sua empresa" />

        {/* Plan selector cards */}
        <div className="space-y-3 mb-4">
          {(["free", "pro", "premium"] as const).map((tier) => {
            const plan = PLAN_FEATURES[tier];
            const isCurrent = planTier === tier;
            const tierIcons = { free: Star, pro: Zap, premium: Crown };
            const TierIcon = tierIcons[tier];
            const tierBg = { free: "bg-slate-100", pro: "bg-sky-100", premium: "bg-amber-100" };
            const tierText = { free: "text-slate-600", pro: "text-sky-600", premium: "text-amber-600" };

            return (
              <button
                key={tier}
                onClick={() => !isCurrent && navigate("/checkout")}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  isCurrent
                    ? "border-sky-400 bg-sky-50/60 shadow-md ring-1 ring-sky-200"
                    : "border-slate-100 hover:border-slate-200 hover:shadow-sm"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${tierBg[tier]}`}>
                  <TierIcon size={20} className={tierText[tier]} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">{plan.label}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold">ATUAL</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{plan.price} • {plan.features[0]}</p>
                </div>
                {!isCurrent && (
                  <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Current plan features */}
        <div className="grid grid-cols-2 gap-2">
          {currentPlan.features.slice(0, 4).map((f) => (
            <div key={f} className="flex items-start gap-1.5 text-xs text-slate-500 p-2 rounded-lg bg-slate-50">
              <Check size={12} className="text-sky-500 mt-0.5 flex-shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ===== SEÇÃO 3: PALETA ATUAL ===== */}
      <SectionCard className="p-6">
        <SectionHeader icon={Palette} title="Paleta atual do sistema" subtitle="Preview da paleta de cores ativa" />
        <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold text-slate-700">{activePreset.name}</span>
            <div className="px-2 py-0.5 rounded-full bg-sky-100 text-[10px] font-semibold text-sky-600 uppercase">Ativa</div>
          </div>
          <div className="flex gap-4 mb-5">
            <ColorSwatch color={activePreset.colors.primary} label="Primary" />
            <ColorSwatch color={activePreset.colors.secondary} label="Secondary" />
            <ColorSwatch color={activePreset.colors.accent} label="Accent" />
            <ColorSwatch color={activePreset.colors.background} label="Background" />
          </div>
          <button
            onClick={handleApplyPalette}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-sm"
          >
            <Check size={16} />
            {saving ? "Aplicando..." : "Aplicar paleta"}
          </button>
        </div>
      </SectionCard>

      {/* ===== SEÇÃO 4: PALETAS DISPONÍVEIS ===== */}
      <SectionCard className="p-6">
        <SectionHeader icon={Palette} title="Paletas de cores" subtitle="Escolha entre paletas profissionais" />
        <div className="grid grid-cols-1 gap-3">
          {PALETTE_PRESETS.map((preset) => {
            const available = canUseTheme(preset.tier);
            const isSelected = selectedTheme === preset.id;
            const tierLabel = preset.tier === "pro" ? "Pro" : preset.tier === "premium" ? "Premium" : null;

            return (
              <button
                key={preset.id}
                onClick={() => available && setSelectedTheme(preset.id)}
                disabled={!available}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-sky-400 bg-sky-50/60 shadow-md ring-1 ring-sky-200"
                    : available
                      ? "border-slate-100 hover:border-slate-200 hover:shadow-sm"
                      : "border-slate-50 opacity-60 cursor-not-allowed"
                }`}
              >
                {/* Color dots */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {Object.values(preset.colors).map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 truncate">{preset.name}</span>
                    {isSelected && (
                      <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{preset.subtitle}</span>
                </div>

                {/* Lock badge */}
                {!available && tierLabel && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 flex-shrink-0">
                    <Lock size={10} className="text-amber-500" />
                    <span className="text-[10px] text-amber-600 font-bold uppercase">{tierLabel}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {planTier === "free" && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
            <p className="text-xs text-amber-700 mb-3 font-medium">
              Disponível nos planos Premium e Pro.
            </p>
            <Link
              to="/checkout"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold transition shadow-sm"
            >
              <Crown size={14} />
              Ver planos
            </Link>
          </div>
        )}
      </SectionCard>

      {/* ===== SEÇÃO 5: PERSONALIZAÇÃO AVANÇADA ===== */}
      <SectionCard className="p-6">
        <SectionHeader icon={Settings2} title="Cores personalizadas" subtitle="Defina cores únicas para sua marca" />

        {planTier === "pro" || planTier === "premium" ? (
          planTier === "pro" ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: "primary" as const, label: "Primary color" },
                  { key: "secondary" as const, label: "Secondary color" },
                  { key: "accent" as const, label: "Accent color" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-500 mb-2">{label}</label>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                      <input
                        type="color"
                        value={customColors[key]}
                        onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })}
                        className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-mono text-slate-600">{customColors[key]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live preview */}
              <div className="p-4 rounded-xl border border-slate-100 bg-white">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Preview</p>
                <div className="flex gap-3 mb-3">
                  <ColorSwatch color={customColors.primary} label="Primary" />
                  <ColorSwatch color={customColors.secondary} label="Secondary" />
                  <ColorSwatch color={customColors.accent} label="Accent" />
                </div>
                <div className="flex gap-2">
                  <div className="px-4 py-2 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: customColors.primary }}>
                    Botão primário
                  </div>
                  <div className="px-4 py-2 rounded-lg text-xs font-semibold border" style={{ borderColor: customColors.accent, color: customColors.accent }}>
                    Botão secundário
                  </div>
                </div>
              </div>

              <button
                onClick={handleApplyCustomColors}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-sm"
              >
                <Palette size={16} />
                {saving ? "Aplicando..." : "Aplicar cores personalizadas"}
              </button>
            </div>
          ) : (
            /* Premium but not Pro - locked */
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <Lock size={24} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500 mb-1">Personalização completa disponível apenas no plano Pro.</p>
              <p className="text-xs text-slate-400 mb-4">Faça upgrade para definir cores únicas.</p>
              <Link
                to="/checkout"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold transition shadow-sm"
              >
                <Crown size={14} />
                Ver planos
              </Link>
            </div>
          )
        ) : (
          /* Free - locked */
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <Lock size={24} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500 mb-1">Personalização disponível nos planos Premium e Pro.</p>
            <p className="text-xs text-slate-400 mb-4">Escolha suas próprias cores e destaque sua marca.</p>
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white text-sm font-semibold transition shadow-sm"
            >
              <Crown size={14} />
              Ver planos
            </Link>
          </div>
        )}
      </SectionCard>

      {/* 6. Configurações do Sistema */}
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

      {/* Footer */}
      <div className="text-center pt-2 pb-4">
        <p className="text-xs text-slate-300">HigTec v2.0 • Gestão profissional de higienização</p>
      </div>
    </div>
  );
};

export default Configuracoes;
