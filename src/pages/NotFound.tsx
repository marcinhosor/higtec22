import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div className="text-center">
      <h1 className="text-6xl font-black text-slate-200 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Página não encontrada</h2>
      <p className="text-sm text-slate-500 mb-6">A página que você procura não existe ou foi movida.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
      >
        <Home size={16} /> Voltar ao início
      </Link>
    </div>
  </div>
);

export default NotFound;
