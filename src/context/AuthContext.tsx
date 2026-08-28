import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { checkIsRunningStandalone } from "@/lib/pwa";

export interface UserType {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  authReady: boolean;
  explicitLogin: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<boolean>;
}

const EXPLICIT_LOGIN_KEY = "sikkanam_explicit_login";
const SESSION_STARTED_KEY = "sikkanam_session_started_at";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [explicitLogin, setExplicitLogin] = useState<boolean>(() => {
    try {
      const isStandalone = checkIsRunningStandalone();
      if (isStandalone) {
        return (
          localStorage.getItem(EXPLICIT_LOGIN_KEY) === "true" ||
          sessionStorage.getItem(EXPLICIT_LOGIN_KEY) === "true"
        );
      }
      return sessionStorage.getItem(EXPLICIT_LOGIN_KEY) === "true";
    } catch (e) {
      return false;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const purgeStaleSession = async () => {
    try {
      localStorage.removeItem(EXPLICIT_LOGIN_KEY);
      sessionStorage.removeItem(EXPLICIT_LOGIN_KEY);
      localStorage.removeItem(SESSION_STARTED_KEY);
    } catch (e) { }
    setUser(null);
    setExplicitLogin(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => { });
    } catch (e) { }
    try {
      await auth.signOut();
    } catch (e) { }
  };

  const checkAuth = async () => {
    const isStandalone = checkIsRunningStandalone();
    const isExplicitInSession = typeof window !== "undefined" && sessionStorage.getItem(EXPLICIT_LOGIN_KEY) === "true";

    if (!isStandalone && !isExplicitInSession) {
      setUser(null);
      setExplicitLogin(false);
      setLoading(false);
      setAuthReady(true);
      return;
    }

    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.loggedIn && data.user) {
          setUser(data.user);
          setExplicitLogin(true);
          try {
            sessionStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
            if (isStandalone) {
              localStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
            }
            if (!localStorage.getItem(SESSION_STARTED_KEY)) {
              localStorage.setItem(SESSION_STARTED_KEY, Date.now().toString());
            }
          } catch (e) { }
        }
      }
    } catch (err) {
      setError("Failed to check auth");
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const isStandalone = checkIsRunningStandalone();
    try {
      const sessionTimestamp = Date.now();
      try {
        sessionStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
        if (isStandalone) {
          localStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
        }
        localStorage.setItem(SESSION_STARTED_KEY, sessionTimestamp.toString());
        sessionStorage.removeItem("sikkanam_applock_unlocked_session");
      } catch (e) { }
      setExplicitLogin(true);

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const newUser: UserType = {
        _id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
        avatar: firebaseUser.photoURL || undefined,
      };

      setUser(newUser);

      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatar: firebaseUser.photoURL,
        }),
      }).catch(() => { });

      window.dispatchEvent(new CustomEvent("sikkanam:user_login"));
      return true;
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      try {
        localStorage.removeItem(EXPLICIT_LOGIN_KEY);
        sessionStorage.removeItem(EXPLICIT_LOGIN_KEY);
        localStorage.removeItem(SESSION_STARTED_KEY);
      } catch (e) { }
      setExplicitLogin(false);
      setError(err.message || "Sign in failed");
      return false;
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      try {
        sessionStorage.setItem("sikkanam_welcome_auth_dismissed", "true");
        localStorage.setItem("sikkanam_welcome_auth_dismissed", "true");
      } catch (e) {}

      // Broadcast local logout event
      window.dispatchEvent(new CustomEvent("sikkanam:user_logout"));

      await purgeStaleSession();
      return true;
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const isStandalone = checkIsRunningStandalone();
      const isExplicitInSession = sessionStorage.getItem(EXPLICIT_LOGIN_KEY) === "true";

      if (firebaseUser) {
        if (!isStandalone && !isExplicitInSession) {
          // Regular browser visit without explicit login in this tab session:
          // Treat as unauthenticated guest in UI so we don't lock with PIN or assume login,
          // but DO NOT call auth.signOut() so PWA session is not destroyed in IndexedDB.
          setUser(null);
          setExplicitLogin(false);
          setLoading(false);
          setAuthReady(true);
        } else {
          const userData: UserType = {
            _id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
            avatar: firebaseUser.photoURL || undefined,
          };

          setUser(userData);
          setExplicitLogin(true);
          try {
            sessionStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
            if (isStandalone) {
              localStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
            }
            if (!localStorage.getItem(SESSION_STARTED_KEY)) {
              localStorage.setItem(SESSION_STARTED_KEY, Date.now().toString());
            }
          } catch (e) { }

          // Automatically sync & renew backend session cookie on app launch
          await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              avatar: firebaseUser.photoURL,
            }),
          }).catch(() => { });

          setLoading(false);
          setAuthReady(true);
        }
      } else {
        // If Firebase auth is null, check backend cookie session only if standalone or explicit in session
        if (isStandalone || isExplicitInSession) {
          try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
              const data = await res.json();
              if (data.loggedIn && data.user) {
                setUser(data.user);
                setExplicitLogin(true);
                try {
                  sessionStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
                  if (isStandalone) {
                    localStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
                  }
                } catch (e) { }
              } else {
                setUser(null);
                setExplicitLogin(false);
                try {
                  localStorage.removeItem(EXPLICIT_LOGIN_KEY);
                  sessionStorage.removeItem(EXPLICIT_LOGIN_KEY);
                } catch (e) { }
              }
            } else {
              setUser(null);
              setExplicitLogin(false);
            }
          } catch (e) {
            setUser(null);
            setExplicitLogin(false);
          } finally {
            setLoading(false);
            setAuthReady(true);
          }
        } else {
          setUser(null);
          setExplicitLogin(false);
          setLoading(false);
          setAuthReady(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authReady,
        explicitLogin,
        error,
        refetch: checkAuth,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
