import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  AuthUserResponse,
  getErrorMessage,
  loginRequest,
  meRequest,
  registerRequest,
} from "../services/api";

interface AppUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  plan: string;
  dailySubmissionCount: number;
}

interface AppContextType {
  isDark: boolean;
  toggleTheme: () => void;
  isLoggedIn: boolean;
  authLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, plan?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  token: string | null;
  user: AppUser | null;
}

const AppContext = createContext<AppContextType>({
  isDark: true,
  toggleTheme: () => {},
  isLoggedIn: false,
  authLoading: false,
  authError: null,
  clearAuthError: () => {},
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  token: null,
  user: null,
});

const THEME_STORAGE_KEY = "veriai.theme";
const TOKEN_STORAGE_KEY = "veriai.auth.token";
const USER_STORAGE_KEY = "veriai.auth.user";

function getStoredTheme(): boolean {
  return localStorage.getItem(THEME_STORAGE_KEY) !== "light";
}

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function getStoredUser(): AuthUserResponse | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUserResponse;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function toDisplayName(email: string): string {
  const localPart = email.split("@")[0] ?? email;
  const normalized = localPart
    .replace(/[._-]+/g, " ")
    .trim();

  if (!normalized) {
    return email;
  }

  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toInitials(name: string, email: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

function mapUser(user: AuthUserResponse): AppUser {
  const name = toDisplayName(user.email);

  return {
    id: user.id,
    name,
    email: user.email,
    initials: toInitials(name, user.email),
    plan: user.plan,
    dailySubmissionCount: user.dailySubmissionCount,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(getStoredTheme);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [authUser, setAuthUser] = useState<AuthUserResponse | null>(getStoredUser);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const user = useMemo(() => (authUser ? mapUser(authUser) : null), [authUser]);
  const isLoggedIn = Boolean(token);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    }
  }, [isDark]);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setAuthUser(null);
  };

  const refreshUser = async () => {
    if (!token) {
      return;
    }

    setAuthLoading(true);

    try {
      const me = await meRequest(token);
      setAuthUser(me);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
      setAuthError(null);
    } catch (error) {
      clearSession();
      setAuthError(getErrorMessage(error, "Session expired. Please sign in again."));
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      void refreshUser().catch(() => {});
    }
  }, [token]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const login = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await loginRequest(email, password);
      setToken(response.accessToken);
      setAuthUser(response.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    } catch (error) {
      const message = getErrorMessage(error, "Unable to sign in.");
      setAuthError(message);
      throw new Error(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email: string, password: string, plan: string = "FREE") => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await registerRequest(email, password, plan);
      setToken(response.accessToken);
      setAuthUser(response.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create account.");
      setAuthError(message);
      throw new Error(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setAuthError(null);
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AppContext.Provider
      value={{
        isDark,
        toggleTheme,
        isLoggedIn,
        authLoading,
        authError,
        clearAuthError,
        login,
        register,
        logout,
        refreshUser,
        token,
        user,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
