import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProGate } from "@/hooks/useCompanyPlan";
import UpgradeModal from "@/components/UpgradeModal";
import { PlanTier } from "@/hooks/useCompanyPlan";

const ROUTE_MODULE_MAP: Record<string, string> = {
  "/agenda": "agenda",
  "/clientes": "clientes",
  "/orcamentos": "orcamentos",
  "/produtos": "produtos",
  "/calculadora": "calculadora",
  "/execucao": "execucao",
  "/relatorios": "relatorios",
  "/equipamentos": "equipamentos",
  "/painel": "painel",
  "/deslocamentos": "deslocamentos",
  "/marketplace": "marketplace",
  "/configuracoes": "configuracoes",
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { canAccessRoute, getRequiredPlan } = useProGate();
  const location = useLocation();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check module access based on plan
  const moduleName = ROUTE_MODULE_MAP[location.pathname];
  if (moduleName && !canAccessRoute(location.pathname)) {
    const requiredPlan = getRequiredPlan(moduleName) || "pro";
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <UpgradeModal
          open={true}
          onClose={() => window.history.back()}
          requiredPlan={requiredPlan as PlanTier}
          feature={moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
