import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';

export type Rol = 'DIRECTOR' | 'DOCENTE' | 'PADRE' | null;

type Session = {
  token: string | null;
  rol: Rol;
  nombre: string | null;
  id: number | null;
};

type SessionContextValue = Session & {
  setSession: (session: Session) => Promise<void>;
  clearSession: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const STORAGE_KEY = 'safeschool_session';

const initialSession: Session = {
  token: null,
  rol: null,
  nombre: null,
  id: null,
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session>(initialSession);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (raw) {
          setSessionState(JSON.parse(raw) as Session);
        }
      } catch {
        // si falla la lectura, se queda sin sesión
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setSession = useCallback(async (next: Session) => {
    setSessionState(next);
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const clearSession = useCallback(async () => {
    setSessionState(initialSession);
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      ...session,
      setSession,
      clearSession,
      isAuthenticated: Boolean(session.token),
      isLoading,
    }),
    [session, setSession, clearSession, isLoading]
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