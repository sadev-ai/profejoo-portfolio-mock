// src/context/AuthContext.tsx

import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  login as apiLogin,
  logout as apiLogout,
  refreshAccessToken,
  me as apiMe,
} from "@/services/auth.service";

import {
  getAccessToken,
  getRefreshToken,
  getUser,
  saveUser,
  isAccessTokenExpired,
  clearAuthTokens,
} from "@/services/authToken.service";

type AuthUser = any;

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (args: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        if (!accessToken && !refreshToken) {
          clearAuthTokens();
          setUser(null);
          return;
        }

        if (!accessToken || isAccessTokenExpired()) {
          if (!refreshToken) {
            clearAuthTokens();
            setUser(null);
            return;
          }

          try {
            await refreshAccessToken(refreshToken);
          } catch (error) {
            console.error("[AuthContext] Refresh failed:", error);
            clearAuthTokens();
            setUser(null);
            return;
          }
        }

        let currentUser = getUser();

        if (!currentUser) {
          try {
            currentUser = await apiMe();
            saveUser(currentUser);
          } catch (error) {
            console.error("[AuthContext] Failed to load user:", error);
            clearAuthTokens();
            setUser(null);
            return;
          }
        }

        setUser(currentUser);
      } catch (error) {
        console.error("[AuthContext] Init error:", error);
        clearAuthTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (args: { email: string; password: string }) => {
    const res = await apiLogin(args);

    if (res.user) {
      setUser(res.user);
      return;
    }

    try {
      const currentUser = await apiMe();
      saveUser(currentUser);
      setUser(currentUser);
    } catch {
      const localUser = getUser();
      setUser(localUser || null);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        await apiLogout(refreshToken);
      }
    } catch (error) {
      console.error("[AuthContext] Logout error:", error);
    } finally {
      clearAuthTokens();
      setUser(null);
    }
  };

  const reloadUser = async () => {
    try {
      const currentUser = await apiMe();
      saveUser(currentUser);
      setUser(currentUser);
    } catch (error) {
      console.error("[AuthContext] Reload user failed:", error);

      const localUser = getUser();
      setUser(localUser || null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}