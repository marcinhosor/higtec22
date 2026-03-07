import { MapPin } from "lucide-react";

const Deslocamentos = () => (
  <div>
    <h2 className="text-xl font-semibold text-slate-800 mb-1">Deslocamentos</h2>
    <p className="text-sm text-slate-500 mb-6">Gestão de frotas e rastreamento</p>
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <MapPin className="mx-auto text-slate-300 mb-3" size={40} />
      <p className="text-slate-500">Módulo PREMIUM em desenvolvimento</p>
    </div>
  </div>
);

export default Deslocamentos;
