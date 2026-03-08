import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyPlan, PLAN_FEATURES } from "@/hooks/useCompanyPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Palette, Check, Crown, Building2, Zap, Star, Settings2, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const PALETTE_PRESETS = [
  { id: "default", name: "Azul Padrão", emoji: "", colors: { primary: "#3b82f6", secondary: "#dbeafe", accent: "#1e40af", background: "#eff6ff" }, tier: "free" as const },
  { id: "luxury", name: "Signature Luxo Premium", emoji: "💎", colors: { primary: "#1a1a2e", secondary: "#d4af37", accent: "#c9850a", background: "#faf9f6" }, tier: "premium" as const },
  { id: "royal", name: "Royal Blue Elite", emoji: "💠", colors: { primary: "#0f2557", secondary: "#1a4b8c", accent: "#2563eb", background: "#f0f4f8" }, tier: "pro" as const },
  { id: "aqua", name: "Aqua Clean Pro", emoji: "🌊", colors: { primary: "#0891b2", secondary: "#67e8f9", accent: "#0e7490", background: "#ecfeff" }, tier: "pro" as const },
  { id: "platinum", name: "Platinum Modern", emoji: "🔘", colors: { primary: "#475569", secondary: "#94a3b8", accent: "#64748b", background: "#f8fafc" }, tier: "pro" as const },
  { id: "emerald", name: "Emerald Executive", emoji: "🟢", colors: { primary: "#064e3b", secondary: "#059669", accent: "#10b981", background: "#ecfdf5" }, tier: "premium" as const },
  { id: "titanium", name: "Titanium Dark", emoji: "🔥", colors: { primary: "#1e293b", secondary: "#475569", accent: "#334155", background: "#0f172a" }, tier: "premium" as const },
];

const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border shadow-sm ${className}`}>{children}</div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: typeof Building2; title: string; subtitle: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
      <Icon size={20} className="text-primary" />
    </div>
    <div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const Configuracoes = () => {
  const { companyId } = useAuth();
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
    const { error } = await supabase.from("companies").update({ name: form.name, phone: form.phone || null, cnpj: form.cnpj || null, selected_theme_id: selectedTheme }).eq("id", companyId);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Configurações salvas!");
    setSaving(false);
  };

  const handleApplyPalette = async (paletteId: string) => {
    if (!companyId) return;
    setSaving(true);
    const preset = PALETTE_PRESETS.find(p => p.id === paletteId);
    if (!preset) return;
    setSelectedTheme(paletteId);
    const { error } = await supabase.from("companies").update({ selected_theme_id: paletteId, custom_theme: preset.colors }).eq("id", companyId);
    if (error) toast.error("Erro ao salvar paleta");
    else toast.success("Paleta aplicada com sucesso!");
    setSaving(false);
  };

  const handleApplyCustomColors = async () => {
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("companies").update({ selected_theme_id: "custom", custom_theme: customColors }).eq("id", companyId);
    if (error) toast.error("Erro ao salvar cores");
    else { setSelectedTheme("custom"); toast.success("Cores personalizadas aplicadas!"); }
    setSaving(false);
  };

  const canUseTheme = (tier: string) => {
    if (tier === "free") return true;
    if (tier === "pro") return planTier === "pro" || planTier === "premium";
    return planTier === "premium";
  };

  const currentPlan = PLAN_FEATURES[planTier];
  const planEmojis: Record<string, string> = { free: "", pro: "", premium: "👑" };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-4 pb-8">
      {/* 1. Plano da Conta */}
      <SectionCard className="p-6">
        <SectionHeader icon={Crown} title="Plano da Conta" subtitle="Gerencie sua assinatura" />
        <div className="mb-3">
          <p className="text-lg font-bold text-foreground">{planEmojis[planTier]} {currentPlan.label.toUpperCase()}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {planTier === "free" && "Até 10 clientes, 5 orçamentos/mês."}
            {planTier === "pro" && "Tudo do FREE + relatórios, paletas e mais."}
            {planTier === "premium" && "Tudo do PRO + Dashboard estratégico, manutenção de equipamentos, gráficos e ranking."}
          </p>
        </div>
        {planTier !== "premium" && (
          <Link to="/checkout" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition shadow-sm">
            <Zap size={14} /> Ver planos
          </Link>
        )}
      </SectionCard>

      {/* 2. Personalização Visual */}
      <SectionCard className="p-6">
        <SectionHeader icon={Palette} title="Personalização Visual" subtitle="Escolha a paleta de cores do sistema e PDFs" />
        <div className="space-y-3">
          {PALETTE_PRESETS.map((preset) => {
            const available = canUseTheme(preset.tier);
            const isSelected = selectedTheme === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => available && handleApplyPalette(preset.id)}
                disabled={!available}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected ? "border-primary bg-secondary/50 shadow-md" : available ? "border-border hover:border-muted-foreground/30 hover:shadow-sm" : "border-border/50 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex gap-1.5 flex-shrink-0">
                  {Object.values(preset.colors).map((c, i) => (
                    <div key={i} className="w-9 h-9 rounded-xl border-2 border-card shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{preset.emoji} {preset.name}</span>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-primary-foreground" />
                  </div>
                )}
                {!available && (
                  <Lock size={14} className="text-muted-foreground flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* 3. Personalização Avançada */}
      <SectionCard className="p-6">
        <SectionHeader icon={Settings2} title="Personalização Avançada" subtitle="Configure cada cor manualmente com HEX" />
        {planTier === "pro" || planTier === "premium" ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([{ key: "primary" as const, label: "Primária" }, { key: "secondary" as const, label: "Secundária" }, { key: "accent" as const, label: "Destaque" }]).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">{label}</label>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30">
                    <input type="color" value={customColors[key]} onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                    <span className="text-sm font-mono text-foreground">{customColors[key]}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleApplyCustomColors} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-sm">
              <Palette size={16} /> {saving ? "Aplicando..." : "Aplicar cores personalizadas"}
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-xl bg-secondary border border-border text-center">
            <Lock size={24} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground mb-1">Disponível nos planos Pro e Premium.</p>
            <Link to="/checkout" className="inline-flex items-center gap-2 px-5 py-2.5 mt-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition shadow-sm">
              <Crown size={14} /> Ver planos
            </Link>
          </div>
        )}
      </SectionCard>

      {/* 4. Dados da Empresa */}
      <SectionCard className="p-6">
        <SectionHeader icon={Building2} title="Dados da Empresa" subtitle="Informações principais do seu negócio" />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nome da Empresa</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-ring transition placeholder:text-muted-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Telefone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" className="w-full px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-ring transition placeholder:text-muted-foreground" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">CNPJ (opcional)</label>
            <input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" className="w-full px-4 py-3 rounded-xl border border-border text-sm text-foreground bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-ring transition placeholder:text-muted-foreground" />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-sm">
          <Save size={16} /> {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </SectionCard>

      <div className="text-center pt-2 pb-4">
        <p className="text-xs text-muted-foreground/50">HigTec v2.0 • Gestão profissional de higienização</p>
      </div>
    </div>
  );
};

export default Configuracoes;
