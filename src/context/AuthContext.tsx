
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
      return localStorage.getItem(EXPLICIT_LOGIN_KEY) === "true" || sessionStorage.getItem(EXPLICIT_LOGIN_KEY) === "true";
    } catch (e) {
      return false;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const purgeStaleSession = async () => {
    try {
      localStorage.removeItem(EXPLICIT_LOGIN_KEY);
      sessionStorage.removeItem(EXPLICIT_LOGIN_KEY);
      sessionStorage.removeItem("sikkanam_welcome_auth_dismissed");
      localStorage.removeItem("sikkanam_welcome_auth_dismissed");
      sessionStorage.removeItem("sikkanam_pwa_dismissed_session");
      localStorage.removeItem(APPLOCK_ENABLED_KEY);
      localStorage.removeItem(APPLOCK_PIN_KEY);
    } catch (e) { }
    setUser(null);
    setExplicitLogin(false);
    try {
      await auth.signOut();
    } catch (e) { }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.loggedIn && data.user) {
          setUser(data.user);
          setExplicitLogin(true);
          try {
            localStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
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
    try {
      try {
        localStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
        sessionStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
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
      await purgeStaleSession();
      try {
        sessionStorage.setItem("sikkanam_welcome_auth_dismissed", "true");
      } catch (e) {}
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => { });
      return true;
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
    return false;
  };

  const checkIsStandalone = () => {
    if (typeof window === "undefined" || typeof document === "undefined") return false;
    try {
      const isStandalone = window.matchMedia ? window.matchMedia("(display-mode: standalone)").matches : false;
      const isOverlay = window.matchMedia ? window.matchMedia("(display-mode: window-controls-overlay)").matches : false;
      const isNavStandalone = (navigator as any)?.standalone === true;
      const isAndroidApp = Boolean(document.referrer && typeof document.referrer === "string" && document.referrer.includes("android-app://"));
      const isStoredPWAInstalled = localStorage.getItem("sikkanam_pwa_installed") === "true";
      return isStandalone || isOverlay || isNavStandalone || isAndroidApp || isStoredPWAInstalled;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const isStandalone = checkIsStandalone();
      const isExplicitInSession = sessionStorage.getItem(EXPLICIT_LOGIN_KEY) === "true";

      if (firebaseUser) {
        if (!isStandalone && !isExplicitInSession) {
          console.info("Browser visit without explicit session login. Clearing browser session.");
          await purgeStaleSession();
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
            localStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
            sessionStorage.setItem(EXPLICIT_LOGIN_KEY, "true");
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
        setUser(null);
        setExplicitLogin(false);
        setLoading(false);
        setAuthReady(true);
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
