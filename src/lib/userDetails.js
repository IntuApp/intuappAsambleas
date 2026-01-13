import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export async function getUserRole({ uid, email }) {
  try {
    // Prioritize UID check via API
    if (uid) {
      const res = await fetch(`/api/auth/role?uid=${uid}`);
      if (res.ok) {
        const data = await res.json();
        return data.role || "4";
      }
    }
    // Fallback if needed, but for now we rely on API.
    return "4";
  } catch (error) {
    console.error("Error al obtener rol del usuario:", error);
    return "usuario";
  }
}

export async function getUserDetails(uid) {
  try {
    if (!uid) {
      console.warn("getUserDetails: UID no proporcionado");
      return null;
    }

    const docRef = doc(db, "user-detail", uid);

    const docSnap = await getDoc(docRef);
    console.log(docRef);

    if (!docSnap.exists()) {
      console.warn(`getUserDetails: No se encontró documento para UID ${uid}`);
      return null;
    }

    return {
      uid,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("Error al obtener detalles del usuario:", error);
    return null;
  }
}

export async function getRoles() {
  try {
    const res = await fetch("/api/roles");
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return [];
  }
}
export async function getRoleById(id) {
  try {
    const docRef = doc(db, "role", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn(`getRoleById: No se encontró rol para ID ${id}`);
      return null;
    }
    return docSnap.data().name;
  } catch (error) {
    console.error("Error al obtener rol por ID:", error);
    return null;
  }
}
