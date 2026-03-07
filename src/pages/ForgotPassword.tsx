import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else { setSent(true); toast.success("E-mail de recuperação enviado!"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f5fa] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Hig<span className="text-sky-500">Tec</span>
            </h1>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">E-mail enviado</h2>
              <p className="text-slate-500 text-sm mb-6">
                Verifique sua caixa de entrada em <strong className="text-slate-700">{email}</strong>.
              </p>
              <Link to="/login" className="text-sky-500 hover:text-sky-600 font-semibold transition text-sm">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-800 text-center mb-1">Esqueci minha senha</h2>
              <p className="text-sm text-slate-400 text-center mb-6">Informe seu e-mail para receber o link de redefinição</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white text-sm" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md text-sm">
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><Mail size={18} /> Enviar link</>}
                </button>
              </form>

              <div className="text-center mt-4">
                <Link to="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition">
                  <ArrowLeft size={14} /> Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
