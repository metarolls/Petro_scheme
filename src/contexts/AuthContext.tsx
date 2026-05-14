import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type UserRole = 'admin' | 'rm' | 'mo' | 'dealer' | 'contractor' | 'merchant' | null;

interface AuthContextType {
  user: User | null;
  profile: any | null;
  role: UserRole;
  loading: boolean;
  evaluating: boolean;
  /** Signs the current user out. Also runs any registered cleanup callbacks (e.g. reCAPTCHA teardown). */
  logout: () => Promise<void>;
  /** Register a one-time cleanup callback that fires before sign-out (e.g. RecaptchaVerifier.clear). */
  registerLogoutCleanup: (fn: () => void) => void;
  /** Updates the user's 4-digit transaction PIN. */
  updateWalletPIN: (newPin: string, currentPin?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  evaluating: false,
  logout: async () => {},
  registerLogoutCleanup: () => {},
  updateWalletPIN: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  // Holds optional cleanup fns registered by consumers (e.g. Login.tsx reCAPTCHA teardown).
  // Using a ref so logout() always sees the latest registered fn without needing to re-create itself.
  const logoutCleanupRef = useRef<(() => void) | null>(null);

  /** Let consumers (Login.tsx) hand us their teardown logic so logout() can call it. */
  const registerLogoutCleanup = useCallback((fn: () => void) => {
    logoutCleanupRef.current = fn;
  }, []);

  /**
   * Stable logout function — safe to include in dependency arrays.
   * Runs any registered cleanup (e.g. RecaptchaVerifier.clear) BEFORE signing out.
   *
   * NOTE: "Failed to initialize reCAPTCHA Enterprise" in the console is a Firebase SDK
   * fallback notice — Firebase tries Enterprise first, then falls back to v2 automatically.
   * It is NOT a code error and does NOT affect sign-in functionality.
   */
  const logout = useCallback(async () => {
    if (logoutCleanupRef.current) {
      try {
        logoutCleanupRef.current();
      } catch (_) {
        // Cleanup errors must never block the sign-out
      }
      logoutCleanupRef.current = null;
    }
    await auth.signOut();
  }, []);

  /** Updates the user's wallet PIN in Firestore and local state. */
  const updateWalletPIN = useCallback(async (newPin: string, currentPin?: string) => {
    if (!user || !role || !profile) throw new Error('No authenticated user');
    
    // Clean phone number for doc ID
    const phoneNumber = user.phoneNumber?.replace('+91', '').replace(/\s/g, '') ?? '';
    if (!phoneNumber) throw new Error('User has no associated phone number');

    // Determine collection
    const collectionMap: Record<string, string> = {
      admin: 'admin',
      rm: 'admin',
      mo: 'admin',
      dealer: 'dealers',
      contractor: 'contractors',
      merchant: 'merchant'
    };
    const collectionName = collectionMap[role];
    if (!collectionName) throw new Error('Unsupported user role for PIN update');

    // Validation: If a PIN exists, currentPin must match
    if (profile.walletPIN && currentPin !== profile.walletPIN) {
      throw new Error('Current PIN is incorrect');
    }

    const userRef = doc(db, collectionName, phoneNumber);
    await updateDoc(userRef, {
      walletPIN: newPin,
      updatedAt: new Date().toISOString()
    });

    // Sync local profile state
    setProfile((prev: any) => prev ? { ...prev, walletPIN: newPin } : null);
  }, [user, role, profile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Immediately reflect auth state change
      setUser(currentUser);
      setRole(null);
      setProfile(null);

      if (!currentUser) {
        setLoading(false);
        setEvaluating(false);
        return;
      }

      // We have a user — start evaluating their role
      setLoading(true);
      setEvaluating(true);

      // Clean phone number: strip +91 prefix and whitespace
      const phoneNumber = currentUser.phoneNumber?.replace('+91', '').replace(/\s/g, '') ?? '';
      console.log('Evaluating roles for phone:', phoneNumber || 'N/A', '| UID:', currentUser.uid);

      try {
        // Promise.allSettled: a Permission Denied on one collection won't block the others
        const results = await Promise.allSettled([
          getDoc(doc(db, 'admin', phoneNumber)),
          getDoc(doc(db, 'dealers', phoneNumber)),
          getDoc(doc(db, 'contractors', phoneNumber)),
          getDoc(doc(db, 'merchant', phoneNumber)),
        ]);

        const [adminRes, dealerRes, contractorRes, merchantRes] = results;

        let resolvedRole: UserRole = null;
        let resolvedProfile: any = null;

        // ── Admin check ──────────────────────────────────────────────────
        console.log(`Checking path: admin/${phoneNumber}`);
        if (adminRes.status === 'fulfilled' && adminRes.value.exists()) {
          const data = adminRes.value.data();
          resolvedProfile = data;
          
          // Map internal role to UserRole type
          const internalRole = data?.role?.toUpperCase();
          if (internalRole === 'RM') {
            resolvedRole = 'rm';
          } else if (internalRole === 'MO') {
            resolvedRole = 'mo';
          } else {
            resolvedRole = 'admin';
          }
        } else {
          if (adminRes.status === 'rejected') {
            console.error('Admin query rejected:', adminRes.reason);
          }
        }

        // ── Super Admin bypass (UID-based fallback) ──────────────────────
        if (!resolvedRole && currentUser.uid === '0DscNgPzQCZ2Mx6Biq3FhwKfrVn1') {
          resolvedRole = 'admin';
          resolvedProfile = { fullName: 'Super Admin', role: 'admin' };
        }
        // ── Dealer check ─────────────────────────────────────────────────
        else if (!resolvedRole && dealerRes.status === 'fulfilled' && dealerRes.value.exists()) {
          resolvedRole = 'dealer';
          resolvedProfile = { ...dealerRes.value.data(), id: dealerRes.value.id };
        }
        // ── Contractor check ─────────────────────────────────────────────
        else if (!resolvedRole && contractorRes.status === 'fulfilled' && contractorRes.value.exists()) {
          resolvedRole = 'contractor';
          resolvedProfile = { ...contractorRes.value.data(), id: contractorRes.value.id };
        }
        // ── Merchant check ───────────────────────────────────────────────
        else if (!resolvedRole && merchantRes.status === 'fulfilled' && merchantRes.value.exists()) {
          const data = merchantRes.value.data();
          resolvedRole = 'merchant';
          resolvedProfile = { ...data, id: merchantRes.value.id };
        }

        console.log('Final Resolved Role:', resolvedRole);
        setRole(resolvedRole);
        setProfile(resolvedProfile);
      } catch (error) {
        console.error('Critical error in role evaluation:', error);
        setRole(null);
        setProfile(null);
      } finally {
        setLoading(false);
        setEvaluating(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Memoize the context value so consumers only re-render when actual values change
  const value = useMemo<AuthContextType>(
    () => ({ user, profile, role, loading, evaluating, logout, registerLogoutCleanup, updateWalletPIN }),
    [user, profile, role, loading, evaluating, logout, registerLogoutCleanup, updateWalletPIN]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
