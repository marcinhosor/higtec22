import { Play } from "lucide-react";

const Execucao = () => (
  <div>
    <h2 className="text-xl font-semibold text-slate-800 mb-1">Execução de Serviço</h2>
    <p className="text-sm text-slate-500 mb-6">Acompanhe a execução dos serviços em tempo real</p>
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <Play className="mx-auto text-slate-300 mb-3" size={40} />
      <p className="text-slate-500">Módulo em desenvolvimento</p>
    </div>
  </div>
);

export default Execucao;
