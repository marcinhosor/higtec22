import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";

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

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("E-mail de recuperação enviado!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">E-mail enviado</h2>
              <p className="text-slate-400 text-sm mb-6">
                Verifique sua caixa de entrada em <strong className="text-white">{email}</strong>.
              </p>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition">
                <ArrowLeft size={16} /> Voltar
              </Link>
              <h2 className="text-xl font-semibold text-white mb-2">Recuperar senha</h2>
              <p className="text-slate-400 text-sm mb-6">Informe seu e-mail para receber o link de recuperação.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Send size={18} /> Enviar link
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
