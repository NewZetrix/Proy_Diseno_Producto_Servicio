import React, { createContext, useContext, useMemo, useState } from 'react';

export type Rol = 'DIRECTOR' | 'DOCENTE' | 'PADRE' | null;

type Session = {
  token: string | null;
  rol: Rol;
  nombre: string | null;
  id: number | null;
};

type SessionContextValue = Session & {
  setSession: (session: Session) => void;
  clearSession: () => void;
  isAuthenticated: boolean;
};

const initialSession: Session = {
  token: null,
  rol: null,
  nombre: null,
  id: null,
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session>(initialSession);

  const value = useMemo<SessionContextValue>(
    () => ({
      ...session,
      setSession: setSessionState,
      clearSession: () => setSessionState(initialSession),
      isAuthenticated: Boolean(session.token),
    }),
    [session]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession debe usarse dentro de SessionProvider');
  }
  return ctx;
}