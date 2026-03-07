import { TrendingUp } from "lucide-react";

const Painel = () => (
  <div>
    <h2 className="text-xl font-semibold text-slate-800 mb-1">Painel Estratégico</h2>
    <p className="text-sm text-slate-500 mb-6">Visão geral do desempenho da empresa</p>
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <TrendingUp className="mx-auto text-slate-300 mb-3" size={40} />
      <p className="text-slate-500">Módulo PREMIUM em desenvolvimento</p>
    </div>
  </div>
);

export default Painel;
