// src/lib/assemblyVotes.js

import { db } from "@/lib/firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";

/**
 * Guarda un lote de votos en la colección assemblyVotes
 */
export async function submitBatchVotes(assemblyId, votesArray) {
  try {
    const votesRef = doc(db, "assemblyVotes", assemblyId);

    // Usamos setDoc con merge: true. 
    // Si la asamblea no tenía votos previos, crea el documento.
    // Usamos ...votesArray para inyectar cada voto individual en el array de Firestore.
    await setDoc(votesRef, {
      votes: arrayUnion(...votesArray)
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error guardando los votos:", error);
    return { success: false, error: error.message };
  }
}