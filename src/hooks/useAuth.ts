import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export interface UserType {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.loggedIn) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
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
        const errData = await res.json();
        throw new Error(errData.error || "Failed to establish backend session");
      }

      const data = await res.json();
      setUser(data.user);
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
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        return true;
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
    return false;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, error, refetch: checkAuth, loginWithGoogle, logout };
}
