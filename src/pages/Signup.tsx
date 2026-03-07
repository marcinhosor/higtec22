import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company_name: companyName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Conta criada! Verifique seu e-mail para confirmar.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✉️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Verifique seu e-mail</h2>
          <p className="text-slate-400 text-sm mb-6">
            Enviamos um link de confirmação para <strong className="text-white">{email}</strong>.
            Clique no link para ativar sua conta.
          </p>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Hig<span className="text-blue-400">Tec</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Crie sua conta gratuitamente</p>
        </div>

        <form onSubmit={handleSignup} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-4">
          <h2 className="text-xl font-semibold text-white text-center">Criar conta</h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Seu nome"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome da empresa</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder="Sua empresa"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <UserPlus size={18} />
                Criar conta
              </>
            )}
          </button>

          <p className="text-center text-sm text-slate-400">
            Já tem conta?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
