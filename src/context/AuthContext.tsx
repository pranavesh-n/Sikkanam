import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";

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
const INSTALLED_KEY = "sikkanam_pwa_installed";
const APPLOCK_ENABLED_KEY = "sikkanam_applock_enabled";
const APPLOCK_PIN_KEY = "sikkanam_applock_pin";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [explicitLogin, setExplicitLogin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(EXPLICIT_LOGIN_KEY) === "true";
    } catch (e) {
      return false;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const purgeStaleSession = async () => {
    try {
      await auth.signOut();
      sessionStorage.removeItem(EXPLICIT_LOGIN_KEY);
      sessionStorage.removeItem("sikkanam_welcome_auth_dismissed");
      sessionStorage.removeItem("sikkanam_pwa_dismissed_session");
      localStorage.removeItem(INSTALLED_KEY);
      localStorage.removeItem(APPLOCK_ENABLED_KEY);
      localStorage.removeItem(APPLOCK_PIN_KEY);
    } catch (e) {}
    setUser(null);
    setExplicitLogin(false);
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const isExplicit = sessionStorage.getItem(EXPLICIT_LOGIN_KEY) === "true";
        if (data.loggedIn && isExplicit) {
          setUser(data.user);
        } else {
          await purgeStaleSession();
        }
      } else {
        await purgeStaleSession();
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
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const newUser: UserType = {
        _id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
        avatar: firebaseUser.photoURL || undefined,
      };

      try {
        sessionStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
      } catch (e) {}
      setExplicitLogin(true);
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
      }).catch(() => {});

      window.dispatchEvent(new CustomEvent("sikkanam:user_login"));
      return true;
    } catch (err: any) {
      console.error("Google sign-in error:", err);
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
      await purgeStaleSession();
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
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
      const isExplicit = sessionStorage.getItem(EXPLICIT_LOGIN_KEY) === "true";

      if (firebaseUser && isExplicit) {
        setUser({
          _id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
          avatar: firebaseUser.photoURL || undefined,
        });
        setExplicitLogin(true);
        setLoading(false);
        setAuthReady(true);
      } else if (firebaseUser && !isExplicit) {
        console.info("Purging background Firebase session without explicit in-session login.");
        await purgeStaleSession();
        setLoading(false);
        setAuthReady(true);
      } else {
        await checkAuth();
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
