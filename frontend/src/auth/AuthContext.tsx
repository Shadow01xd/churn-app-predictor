import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  api,
  clearToken,
  getToken,
  isTokenValid,
  parseJwt,
  setToken,
} from '../api/client';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readUserFromStorage(): AuthUser | null {
  const token = getToken();
  if (!isTokenValid(token)) {
    if (token) clearToken();
    return null;
  }
  const payload = parseJwt(token);
  return payload ? { id: payload.sub, email: payload.email } : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readUserFromStorage());

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ access_token: string }>('/auth/login', {
      email,
      password,
    });
    setToken(data.access_token);
    const payload = parseJwt(data.access_token);
    setUser(payload ? { id: payload.sub, email: payload.email } : null);
  }, []);

  const register = useCallback(
    async (email: string, password: string) => {
      await api.post('/auth/register', { email, password });
      // El backend no devuelve token en el registro: iniciamos sesión enseguida.
      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
