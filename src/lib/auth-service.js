import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

export async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Ensure db is initialized
  if (!db) {
    throw new Error("Database connection not available");
  }

  const q = query(collection(db, "user"), where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Usuario no encontrado");
  }

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();

  const isValid = await bcrypt.compare(password, userData.password);

  if (!isValid) {
    throw new Error("Contraseña incorrecta");
  }

  const userSession = {
    uid: userDoc.id,
    email: userData.email,
    role: userData.role,
    ...userData,
  };

  delete userSession.password;

  return userSession;
}

export async function registerUser(userData) {
  if (!db) {
    throw new Error("Database connection not available");
  }

  const q = query(collection(db, "user"), where("email", "==", userData.email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error("El correo ya está registrado");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, "user"), newUser);
  return { success: true, id: docRef.id };
}
