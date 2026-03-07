import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, Droplets, Info } from "lucide-react";

interface Product {
  id: string; name: string; dilution: string | null; current_stock_ml: number | null;
}

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
      <h2 className="text-xl font-bold text-slate-800 mb-5">Calculadora de Diluição</h2>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
            <Calculator size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Calcular Diluição</h3>
            <p className="text-sm text-slate-400">Informe os dados do fabricante</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Product selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Produto (opcional)</label>
            <select value={selectedProductId} onChange={(e) => handleProductSelect(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Selecione para baixa automática</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {selectedProduct && selectedProduct.current_stock_ml != null && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
              <Info size={16} /> Estoque atual: {(selectedProduct.current_stock_ml / 1000).toFixed(1)}L
            </div>
          )}

          {/* Dilution */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Diluição recomendada</label>
            <input type="text" value={dilution} onChange={(e) => { setDilution(e.target.value); setResult(null); }} placeholder="Ex: 1:10" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-slate-400 mt-1">Formato: 1:10, 1:20, etc.</p>
          </div>

          {/* Water volume */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Volume de água (litros)</label>
            <input type="number" value={waterVolume} onChange={(e) => { setWaterVolume(e.target.value); setResult(null); }} placeholder="Ex: 5" min="0" step="0.1" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Calculate */}
          <button onClick={handleCalculate} disabled={!dilution || !waterVolume} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition disabled:opacity-40">
            Calcular
          </button>

          {/* Result */}
          {result && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-5 space-y-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Droplets size={18} className="text-blue-600" /> Resultado
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 text-center border border-slate-100">
                  <p className="text-2xl font-bold text-blue-600">{result.productMl} ml</p>
                  <p className="text-xs text-slate-500 mt-0.5">de produto</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-slate-100">
                  <p className="text-2xl font-bold text-slate-700">{result.totalMl} ml</p>
                  <p className="text-xs text-slate-500 mt-0.5">solução total</p>
                </div>
              </div>
              {selectedProduct && selectedProduct.current_stock_ml != null && (
                <div className={`text-xs px-3 py-2 rounded-lg ${selectedProduct.current_stock_ml >= result.productMl ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
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
