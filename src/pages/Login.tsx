import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Building2, Wrench } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoApp from "@/assets/logo_app.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Technician tab state
  const [techCode, setTechCode] = useState("");
  const [techPin, setTechPin] = useState("");
  const [techList, setTechList] = useState<{ id: string; name: string }[]>([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [techStep, setTechStep] = useState<"code" | "select" | "pin">("code");
  const [techLoading, setTechLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos" : error.message);
    } else {
      toast.success("Login realizado com sucesso!");
      navigate("/");
    }
    setLoading(false);
  };

  const handleSearchTechnicians = async (e: React.FormEvent) => {
    e.preventDefault();
    setTechLoading(true);
    const { data, error } = await supabase.rpc("get_technicians_by_code", { _code: techCode });
    if (error || !data || data.length === 0) {
      toast.error("Código inválido ou sem técnicos");
    } else {
      setTechList(data);
      setTechStep("select");
    }
    setTechLoading(false);
  };

  const handleTechnicianLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTechLoading(true);
    const { data, error } = await supabase.rpc("technician_login", {
      _code: techCode,
      _technician_id: selectedTechId,
      _pin: techPin,
    });
    if (error || !(data as any)?.success) {
      toast.error((data as any)?.error || "Erro ao entrar");
    } else {
      toast.success("Login de técnico realizado!");
      // Store tech session in context
      const session = data as any;
      localStorage.setItem("tech-session", JSON.stringify({
        technician_id: session.technician_id,
        technician_name: session.technician_name,
        company_id: session.company_id,
        company_name: session.company_name,
      }));
      window.location.href = "/";
    }
    setTechLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center space-y-3">
          <img src={logoApp} alt="Logo" className="h-16 mx-auto" />
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse sua conta para continuar</CardDescription>
        </CardHeader>

        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-0">
            <TabsTrigger value="admin" className="gap-1.5">
              <Building2 className="h-4 w-4" /> Empresa
            </TabsTrigger>
            <TabsTrigger value="technician" className="gap-1.5">
              <Wrench className="h-4 w-4" /> Técnico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <Link to="/esqueci-senha" className="text-sm text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Entrar
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Não tem conta?{" "}
                  <Link to="/cadastro" className="text-primary font-medium hover:underline">
                    Cadastre-se
                  </Link>
                </p>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="technician">
            {techStep === "code" && (
              <form onSubmit={handleSearchTechnicians}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="tech-code">Código da empresa</Label>
                    <Input
                      id="tech-code"
                      placeholder="Ex: ABC123"
                      required
                      value={techCode}
                      onChange={(e) => setTechCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={techLoading}>
                    {techLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                    ) : (
                      "Buscar"
                    )}
                  </Button>
                </CardFooter>
              </form>
            )}

            {techStep === "select" && (
              <CardContent className="space-y-3 pt-4">
                <Label>Selecione seu nome</Label>
                {techList.map((tech) => (
                  <Button
                    key={tech.id}
                    variant={selectedTechId === tech.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedTechId(tech.id);
                      setTechStep("pin");
                    }}
                  >
                    {tech.name}
                  </Button>
                ))}
                <Button variant="ghost" className="w-full" onClick={() => setTechStep("code")}>
                  Voltar
                </Button>
              </CardContent>
            )}

            {techStep === "pin" && (
              <form onSubmit={handleTechnicianLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="tech-pin">PIN de acesso</Label>
                    <Input
                      id="tech-pin"
                      type="password"
                      placeholder="••••"
                      required
                      value={techPin}
                      onChange={(e) => setTechPin(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={techLoading}>
                    {techLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setTechStep("select")}>
                    Voltar
                  </Button>
                </CardFooter>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
