import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, Droplets, Info } from "lucide-react";

interface Product { id: string; name: string; dilution: string | null; current_stock_ml: number | null; }

const Calculadora = () => {
  const { companyId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [dilution, setDilution] = useState("");
  const [waterVolume, setWaterVolume] = useState("");
  const [result, setResult] = useState<{ productMl: number; totalMl: number } | null>(null);

  useEffect(() => { if (companyId) loadProducts(); }, [companyId]);

  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("id, name, dilution, current_stock_ml").eq("company_id", companyId!).order("name");
    if (data) setProducts(data);
  };

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const product = products.find((p) => p.id === id);
    if (product?.dilution) setDilution(product.dilution);
    setResult(null);
  };

  const handleCalculate = () => {
    const parts = dilution.split(":").map((s) => parseFloat(s.trim()));
    if (parts.length !== 2 || parts.some(isNaN) || parts[1] === 0) return;
    const waterLiters = parseFloat(waterVolume);
    if (isNaN(waterLiters) || waterLiters <= 0) return;
    const waterMl = waterLiters * 1000;
    const ratio = parts[0] / parts[1];
    const productMl = waterMl * ratio;
    setResult({ productMl: Math.round(productMl), totalMl: Math.round(waterMl + productMl) });
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div>
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Calculator size={22} className="text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Calcular Diluição</h3>
            <p className="text-sm text-muted-foreground">Informe os dados do fabricante</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Produto (opcional)</label>
            <select value={selectedProductId} onChange={(e) => handleProductSelect(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card">
              <option value="">Selecione para baixa automática</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {selectedProduct && selectedProduct.current_stock_ml != null && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg text-sm text-primary">
              <Info size={16} /> Estoque atual: {(selectedProduct.current_stock_ml / 1000).toFixed(1)}L
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Diluição recomendada</label>
            <input type="text" value={dilution} onChange={(e) => { setDilution(e.target.value); setResult(null); }} placeholder="Ex: 1:10" className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card" />
            <p className="text-xs text-muted-foreground mt-1">Formato: 1:10, 1:20, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Volume de água (litros)</label>
            <input type="number" value={waterVolume} onChange={(e) => { setWaterVolume(e.target.value); setResult(null); }} placeholder="Ex: 5" min="0" step="0.1" className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card" />
          </div>

          <button onClick={handleCalculate} disabled={!dilution || !waterVolume} className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition disabled:opacity-40 shadow-sm">
            Calcular
          </button>

          {result && (
            <div className="bg-secondary rounded-xl border border-border p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Droplets size={18} className="text-primary" /> Resultado
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded-lg p-3 text-center border border-border">
                  <p className="text-2xl font-bold text-primary">{result.productMl} ml</p>
                  <p className="text-xs text-muted-foreground mt-0.5">de produto</p>
                </div>
                <div className="bg-card rounded-lg p-3 text-center border border-border">
                  <p className="text-2xl font-bold text-foreground">{result.totalMl} ml</p>
                  <p className="text-xs text-muted-foreground mt-0.5">solução total</p>
                </div>
              </div>
              {selectedProduct && selectedProduct.current_stock_ml != null && (
                <div className={`text-xs px-3 py-2 rounded-lg ${selectedProduct.current_stock_ml >= result.productMl ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive"}`}>
                  {selectedProduct.current_stock_ml >= result.productMl
                    ? `✓ Estoque suficiente (${(selectedProduct.current_stock_ml / 1000).toFixed(1)}L disponível)`
                    : `✗ Estoque insuficiente (${(selectedProduct.current_stock_ml / 1000).toFixed(1)}L disponível)`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculadora;
