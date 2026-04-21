import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    clearAuthSession,
    currentUserApi,
    loadAuthSession,
    loginApi,
    logoutApi,
    saveAuthSession,
} from "../api/auth";
import type {
    AuthSession,
    LoginRequest,
    LoginResponse,
    UserProfile,
} from "../types/api";

interface AuthContextValue {
  ready: boolean;
  loading: boolean;
  session: AuthSession | null;
  user: UserProfile | null;
  isAdmin: boolean;
  signIn: (payload: LoginRequest) => Promise<LoginResponse>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: import("react").ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const hydrateSession = useCallback(async () => {
    const storedSession = loadAuthSession();
    if (!storedSession) {
      setReady(true);
      return;
    }

    setSession(storedSession);
    try {
      const currentUser = await currentUserApi(storedSession);
      setUser(currentUser);
    } catch {
      clearAuthSession();
      setSession(null);
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  const signIn = useCallback(async (payload: LoginRequest) => {
    setLoading(true);
    try {
      const response = await loginApi(payload);
      const nextSession: AuthSession = response;
      saveAuthSession(nextSession);
      setSession(nextSession);
      setUser(nextSession.user);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!session) {
      return null;
    }

    try {
      const currentUser = await currentUserApi(session);
      setUser(currentUser);
      return currentUser;
    } catch {
      clearAuthSession();
      setSession(null);
      setUser(null);
      return null;
    }
  }, [session]);

  const signOut = useCallback(async () => {
    if (session) {
      try {
        await logoutApi(session);
      } catch {
        // 服务端登出失败时，仍然清理本地状态，避免卡死在已登录视图。
      }
    }

    clearAuthSession();
    setSession(null);
    setUser(null);
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      loading,
      session,
      user,
      isAdmin: user?.userType === 2,
      signIn,
      signOut,
      refreshUser,
    }),
    [loading, ready, refreshUser, session, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必须在 AuthProvider 内使用");
  }

  return context;
}
