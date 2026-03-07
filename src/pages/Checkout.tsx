import { CreditCard } from "lucide-react";

const Checkout = () => (
  <div>
    <h2 className="text-xl font-semibold text-slate-800 mb-1">Checkout</h2>
    <p className="text-sm text-slate-500 mb-6">Gerencie sua assinatura</p>
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <CreditCard className="mx-auto text-slate-300 mb-3" size={40} />
      <p className="text-slate-500">Módulo em desenvolvimento</p>
    </div>
  </div>
);

export default Checkout;
