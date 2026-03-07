import { createContext, useContext, useState, ReactNode } from "react";

interface TechnicianSession {
  technician_id: string;
  technician_name: string;
  company_id: string;
  company_name: string;
}

interface TechnicianContextType {
  techSession: TechnicianSession | null;
  setTechSession: (session: TechnicianSession | null) => void;
  isTechnician: boolean;
  clearTechSession: () => void;
}

const TechnicianContext = createContext<TechnicianContextType>({
  techSession: null,
  setTechSession: () => {},
  isTechnician: false,
  clearTechSession: () => {},
});

export const useTechnician = () => useContext(TechnicianContext);

export const TechnicianProvider = ({ children }: { children: ReactNode }) => {
  const [techSession, setTechSession] = useState<TechnicianSession | null>(() => {
    const stored = localStorage.getItem("tech-session");
    return stored ? JSON.parse(stored) : null;
  });

  const handleSet = (session: TechnicianSession | null) => {
    setTechSession(session);
    if (session) {
      localStorage.setItem("tech-session", JSON.stringify(session));
    } else {
      localStorage.removeItem("tech-session");
    }
  };

  const clearTechSession = () => handleSet(null);

  return (
    <TechnicianContext.Provider value={{
      techSession,
      setTechSession: handleSet,
      isTechnician: !!techSession,
      clearTechSession,
    }}>
      {children}
    </TechnicianContext.Provider>
  );
};
