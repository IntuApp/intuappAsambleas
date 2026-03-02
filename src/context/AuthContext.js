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

  // Función para cuando el usuario hace clic en "Salir" voluntariamente
  const handleLogout = async () => {
    await logoutUser(); // Esto ejecuta tu cierre normal (que limpia BD y cookies)
    setUser(null);
    router.push('/');
  };

  useEffect(() => {
    if (!initialSession?.uid || !initialSession?.token) return;

    const unsubscribe = onSnapshot(doc(db, 'user', initialSession.uid), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Comprobamos si hay un token y si es diferente al de ESTE dispositivo
        if (data.currentSessionToken && data.currentSessionToken !== initialSession.token) {

          alert("Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo.");

          // 🔥 CIERRE LOCAL (NO LLAMAMOS A logoutUser COMPLETO)
          // 1. Borramos el estado local
          setUser(null);

          // 2. Borramos la cookie local (Debes ajustar la ruta a donde manejes la eliminación de tu cookie en Next.js)
          try {
            // Ejemplo: Llamamos a un endpoint que SOLO borra la cookie HttpOnly sin tocar Firebase
            await fetch('/api/logout-local', { method: 'POST' });
          } catch (e) {
            console.error(e);
          }

          // 3. Redirigimos
          router.push('/');

        } else {
          // Si todo está bien, actualizamos el estado
          setUser({ ...initialSession, ...data });
        }
      }
    });

    return () => unsubscribe();
  }, [initialSession?.uid, initialSession?.token, router]);

  return (
    // Exponemos handleLogout para usarlo en botones de "Salir"
    <AuthContext.Provider value={{ user, setUser, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);