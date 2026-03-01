'use server' 

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers"; 

export async function loginUser(email, password) {
  if (!email || !password) throw new Error("Email and password are required");
  if (!db) throw new Error("Database connection not available");

  const q = query(collection(db, "user"), where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) throw new Error("Usuario no encontrado");

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();

  const isValid = await bcrypt.compare(password, userData.password);
  if (!isValid) throw new Error("Contraseña incorrecta");

  const sessionToken = crypto.randomUUID();
  
  await updateDoc(doc(db, "user", userDoc.id), {
    currentSessionToken: sessionToken
  });

  const cookieStore = await cookies();
  cookieStore.set('session', JSON.stringify({ 
    uid: userDoc.id, 
    role: userData.role, 
    token: sessionToken 
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  const userSession = {
    uid: userDoc.id,
    email: userData.email,
    role: userData.role,
    ...userData,
  };

  delete userSession.password;
  return userSession;
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie);
      
      // 1. Borramos el token de sesión en Firebase para invalidarlo por completo
      if (session.uid && db) {
        await updateDoc(doc(db, "user", session.uid), {
          currentSessionToken: null 
        });
      }
    } catch (error) {
      console.error("Error limpiando la sesión en la base de datos:", error);
    }
  }

  // 2. Destruimos la cookie en el navegador del usuario
  cookieStore.delete('session');
}
