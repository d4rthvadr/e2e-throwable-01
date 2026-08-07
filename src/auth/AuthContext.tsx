import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { User } from "../types/models";
import { createUser, findUserById, loginUser } from "../db/usersRepo";
import { seedDemoAccount } from "../dev/seed";

const SESSION_KEY = "todos-session-user-id";

type AuthActionResult = {
  ok: boolean;
  message?: string;
};

type AuthContextValue = {
  isLoading: boolean;
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthActionResult>;
  signup: (username: string, password: string) => Promise<AuthActionResult>;
  logout: () => void;
  seedDemo: () => Promise<AuthActionResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function setSession(userId: string | null) {
  if (!userId) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, userId);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const sessionUserId = localStorage.getItem(SESSION_KEY);
      if (!sessionUserId) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const user = await findUserById(sessionUserId);
        if (isMounted) {
          if (user) {
            setCurrentUser(user);
          } else {
            setSession(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<AuthActionResult> => {
      try {
        const user = await loginUser(username, password);
        setCurrentUser(user);
        setSession(user.id);
        return { ok: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to log in.";
        return { ok: false, message };
      }
    },
    [],
  );

  const signup = useCallback(
    async (username: string, password: string): Promise<AuthActionResult> => {
      try {
        const user = await createUser(username, password);
        setCurrentUser(user);
        setSession(user.id);
        return { ok: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to create account.";
        return { ok: false, message };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    setSession(null);
  }, []);

  const seedDemo = useCallback(async (): Promise<AuthActionResult> => {
    try {
      await seedDemoAccount();
      return {
        ok: true,
        message: "Demo account is ready. Use demo / demo1234.",
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to seed demo account.";
      return { ok: false, message };
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      signup,
      logout,
      seedDemo,
    }),
    [currentUser, isLoading, login, logout, seedDemo, signup],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return value;
}
