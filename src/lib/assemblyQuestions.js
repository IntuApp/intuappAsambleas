// src/lib/assemblyActions.js (o donde manejes tus funciones de BD)

import { db } from "@/lib/firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";

/**
 * Crea una nueva pregunta dentro del documento de la asamblea en assemblyQuestions
 */
export async function createAssemblyQuestion(assemblyId, questionData) {
  try {
    const questionRef = doc(db, "assemblyQuestions", assemblyId);

    // Usamos setDoc con merge: true por si es la primera pregunta que se crea en esta asamblea
    await setDoc(questionRef, {
      questions: arrayUnion(questionData)
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error creando pregunta:", error);
    throw new Error("No se pudo guardar la pregunta.");
  }
}