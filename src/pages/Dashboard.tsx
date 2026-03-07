import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Calendar, Users, FileText, Settings, Wrench, FlaskConical, ArrowRight } from "lucide-react";

const cards = [
  { to: "/agenda", icon: Calendar, label: "Agenda", desc: "Agendamentos do dia", color: "bg-blue-500" },
  { to: "/clientes", icon: Users, label: "Clientes", desc: "Gerenciar clientes", color: "bg-emerald-500" },
  { to: "/orcamentos", icon: FileText, label: "Orçamentos", desc: "Criar e enviar", color: "bg-amber-500" },
  { to: "/produtos", icon: FlaskConical, label: "Produtos", desc: "Estoque e diluição", color: "bg-purple-500" },
  { to: "/equipamentos", icon: Wrench, label: "Equipamentos", desc: "Controle de manutenção", color: "bg-rose-500" },
  { to: "/configuracoes", icon: Settings, label: "Configurações", desc: "Dados da empresa", color: "bg-slate-500" },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-1">Painel Principal</h2>
      <p className="text-sm text-slate-500 mb-6">Bem-vindo de volta!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ to, icon: Icon, label, desc, color }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition group"
          >
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="text-white" size={20} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{label}</h3>
                <p className="text-sm text-slate-500 mt-1">{desc}</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
