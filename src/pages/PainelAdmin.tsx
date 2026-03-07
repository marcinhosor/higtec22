import { Shield } from "lucide-react";

const PainelAdmin = () => (
  <div>
    <h2 className="text-xl font-semibold text-slate-800 mb-1">Painel Administrativo</h2>
    <p className="text-sm text-slate-500 mb-6">Gestão master do sistema</p>
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <Shield className="mx-auto text-slate-300 mb-3" size={40} />
      <p className="text-slate-500">Acesso restrito ao administrador</p>
    </div>
  </div>
);

export default PainelAdmin;
