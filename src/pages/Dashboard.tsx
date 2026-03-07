import { useAuth } from "@/hooks/useAuth";
import { LogOut, Calendar, Users, FileText, Settings } from "lucide-react";

const Dashboard = () => {
  const { user, signOut, companyId } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900">
            Hig<span className="text-blue-600">Tec</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:block">{user?.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Painel Principal</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: "Agenda", desc: "Agendamentos do dia", color: "bg-blue-500" },
            { icon: Users, label: "Clientes", desc: "Gerenciar clientes", color: "bg-emerald-500" },
            { icon: FileText, label: "Orçamentos", desc: "Criar e enviar", color: "bg-amber-500" },
            { icon: Settings, label: "Configurações", desc: "Dados da empresa", color: "bg-slate-500" },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition cursor-pointer"
            >
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="text-white" size={20} />
              </div>
              <h3 className="font-semibold text-slate-800">{label}</h3>
              <p className="text-sm text-slate-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
