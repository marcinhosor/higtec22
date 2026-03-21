import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBack?: boolean;
  action?: ReactNode;
}

export default function PageShell({ title, subtitle, children, showBack, action }: PageShellProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary hover:bg-accent/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h1 className="text-[17px] font-bold text-foreground leading-tight">{title}</h1>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      </header>
      <main className="flex-1 px-3 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}