'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/auth'; 

const AuthContext = createContext({});

export const AuthProvider = ({ children, initialSession }) => {
  const [user, setUser] = useState(initialSession);
  const router = useRouter();

  useEffect(() => {
    if (!initialSession?.uid) return;

    const unsubscribe = onSnapshot(doc(db, 'user', initialSession.uid), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currentSessionToken !== initialSession.token) {
          alert("Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo.");
          await logoutUser();
          setUser(null);
          router.push('/');
        } else {
          setUser({ ...initialSession, ...data });
        }
      }
    });

    return () => unsubscribe();
  }, [initialSession?.uid, initialSession?.token, router]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);