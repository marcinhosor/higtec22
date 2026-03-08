import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface ReportFilters {
  period: string;
  customStart: string;
  customEnd: string;
  clientId: string;
  serviceType: string;
  technicianId: string;
  status: string;
  neighborhood: string;
}

export const DEFAULT_FILTERS: ReportFilters = {
  period: "month",
  customStart: "",
  customEnd: "",
  clientId: "",
  serviceType: "",
  technicianId: "",
  status: "",
  neighborhood: "",
};

export function getDateRange(filters: ReportFilters): { start: string; end: string } {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  let start = today;
  let end = today;

  switch (filters.period) {
    case "today":
      start = end = today;
      break;
    case "7days":
      start = new Date(now.getTime() - 6 * 86400000).toISOString().split("T")[0];
      break;
    case "30days":
      start = new Date(now.getTime() - 29 * 86400000).toISOString().split("T")[0];
      break;
    case "month":
      start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      end = today;
      break;
    case "last_month": {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = `${lm.getFullYear()}-${String(lm.getMonth() + 1).padStart(2, "0")}-01`;
      const last = new Date(lm.getFullYear(), lm.getMonth() + 1, 0);
      end = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
      break;
    }
    case "custom":
      start = filters.customStart || today;
      end = filters.customEnd || today;
      break;
  }
  return { start, end };
}

export interface ReportData {
  quotes: any[];
  appointments: any[];
  executions: any[];
  clients: any[];
  products: any[];
  equipment: any[];
  trips: any[];
  collaborators: any[];
  serviceTypes: any[];
}

export function useReportsData() {
  const { companyId } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (filters: ReportFilters) => {
    if (!companyId) return;
    setLoading(true);
    const { start, end } = getDateRange(filters);
    const endTs = end + "T23:59:59";

    const [quotesRes, aptsRes, execRes, clientsRes, productsRes, equipRes, tripsRes, collabRes, stRes] = await Promise.all([
      supabase.from("quotes").select("*").eq("company_id", companyId).gte("created_at", start).lte("created_at", endTs),
      supabase.from("appointments").select("*").eq("company_id", companyId).gte("date", start).lte("date", end),
      supabase.from("service_executions").select("*").eq("company_id", companyId).gte("created_at", start).lte("created_at", endTs),
      supabase.from("clients").select("*").eq("company_id", companyId),
      supabase.from("products").select("*").eq("company_id", companyId),
      supabase.from("equipment").select("*").eq("company_id", companyId),
      supabase.from("vehicle_trips").select("*").eq("company_id", companyId).gte("created_at", start).lte("created_at", endTs),
      supabase.from("collaborators").select("*").eq("company_id", companyId),
      supabase.from("service_types").select("*").eq("company_id", companyId),
    ]);

    setData({
      quotes: quotesRes.data || [],
      appointments: aptsRes.data || [],
      executions: execRes.data || [],
      clients: clientsRes.data || [],
      products: productsRes.data || [],
      equipment: equipRes.data || [],
      trips: tripsRes.data || [],
      collaborators: collabRes.data || [],
      serviceTypes: stRes.data || [],
    });
    setLoading(false);
  }, [companyId]);

  return { data, loading, loadData };
}

// Calculation utilities
export function calcRevenue(quotes: any[]): number {
  return quotes
    .filter(q => q.status === "approved")
    .reduce((sum, q) => {
      const services = (q.services as any[]) || [];
      return sum + services.reduce((s: number, sv: any) => s + ((sv.quantity || 1) * (sv.unitPrice || 0)), 0);
    }, 0);
}

export function calcDiscounts(quotes: any[]): number {
  return quotes
    .filter(q => q.status === "approved")
    .reduce((sum, q) => sum + (q.discount || 0), 0);
}

export function calcServiceCounts(quotes: any[]): Record<string, { count: number; revenue: number }> {
  const map: Record<string, { count: number; revenue: number }> = {};
  quotes.filter(q => q.status === "approved").forEach(q => {
    ((q.services as any[]) || []).forEach((s: any) => {
      const name = s.name || "Sem nome";
      if (!map[name]) map[name] = { count: 0, revenue: 0 };
      map[name].count += (s.quantity || 1);
      map[name].revenue += (s.quantity || 1) * (s.unitPrice || 0);
    });
  });
  return map;
}

export function calcProductCosts(products: any[]): number {
  return products.reduce((sum, p) => sum + ((p.current_stock_ml || 0) / 1000) * (p.cost_per_liter || 0), 0);
}

export function currency(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
