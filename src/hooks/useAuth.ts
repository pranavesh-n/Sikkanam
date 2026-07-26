import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";

export interface UserType {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserType | null>(() => {
    const fbUser = auth.currentUser;
    if (fbUser) {
      return {
        _id: fbUser.uid,
        email: fbUser.email || "",
        name: fbUser.displayName || fbUser.email?.split("@")[0] || "",
        avatar: fbUser.photoURL || undefined,
      };
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.loggedIn) {
          setUser(data.user);
        } else if (!auth.currentUser) {
          setUser(null);
        }
      } else if (!auth.currentUser) {
        setUser(null);
      }
    } catch (err) {
      setError("Failed to check auth");
    } finally {
      setLoading(false);
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
      setUser(newUser);
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatar: firebaseUser.photoURL,
        }),
      });

      if (!res.ok) {
        console.warn("Backend session creation notice:", res.statusText);
      }

      try {
        sessionStorage.setItem("sikkanam_pwa_authenticated", "true");
        sessionStorage.setItem("sikkanam_web_authenticated", "true");
      } catch (e) {}

      window.dispatchEvent(new CustomEvent("sikkanam:user_login"));
      return true;
    } catch (err: any) {
      console.error("Google sign in failed:", err);
      setError(err.message || "Sign in failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      try {
        sessionStorage.removeItem("sikkanam_pwa_authenticated");
        sessionStorage.removeItem("sikkanam_web_authenticated");
      } catch (e) {}
      setUser(null);
      return true;
    } catch (err) {
      console.error("Logout failed", err);
    }
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          _id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
          avatar: firebaseUser.photoURL || undefined,
        });
      } else {
        checkAuth();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error, refetch: checkAuth, loginWithGoogle, logout };
}
