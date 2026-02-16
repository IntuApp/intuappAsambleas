import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const COLLECTION_NAME = "usersAssemblyActive";

/**
 * Creates a new assembly user after verification.
 * @param {Object} userData - User data to store
 * @returns {Promise<{success: boolean, id?: string, error?: any}>}
 */
export async function createAssemblyUser(userData) {
  try {
    // Extract document (either from root or first registry)
    const document =
      userData.document || userData.registries?.[0]?.documentRepresentative;

    if (!document) {
      throw new Error("Document is undefined");
    }

    // Check if already exists for this assembly and document to avoid duplicates
    const q = query(
      collection(db, COLLECTION_NAME),
      where("document", "==", document),
      where("assemblyId", "==", userData.assemblyId),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // User exists -> Update registries
      const existingDoc = snapshot.docs[0];
      const existingData = existingDoc.data();
      const existingRegistries = existingData.registries || [];

      // Merge registries avoiding duplicates based on registryId
      const newRegistries = userData.registries || [];
      const mergedRegistries = [...existingRegistries];

      newRegistries.forEach((newReg) => {
        if (!mergedRegistries.some((r) => r.registryId === newReg.registryId)) {
          mergedRegistries.push(newReg);
        }
      });

      // Update the document
      await updateDoc(doc(db, COLLECTION_NAME, existingDoc.id), {
        registries: mergedRegistries,
      });

      return {
        success: true,
        id: existingDoc.id,
        data: {
          ...existingData,
          registries: mergedRegistries,
          id: existingDoc.id,
        },
      };
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...userData,
      document, // Ensure document is saved at root for querying
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: docRef.id,
      data: { ...userData, id: docRef.id },
    };
  } catch (error) {
    console.error("Error creating assembly user:", error);
    return { success: false, error };
  }
}

/**
 * Gets an assembly user by document and assembly ID.
 * @param {string} document - User document
 * @param {string} assemblyId - Assembly ID
 * @returns {Promise<{success: boolean, data?: Object, error?: any}>}
 */
export async function getAssemblyUser(document, assemblyId) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("document", "==", document),
      where("assemblyId", "==", assemblyId),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { success: true, data: { id: doc.id, ...doc.data() } };
    }

    return { success: false, error: "User not found" };
  } catch (error) {
    console.error("Error getting assembly user:", error);
    return { success: false, error };
  }
}
/**
 * Deletes an assembly user record by document and assembly ID.
 * @param {string} document - User document
 * @param {string} assemblyId - Assembly ID
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export async function deleteAssemblyUser(document, assemblyId) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("document", "==", document),
      where("assemblyId", "==", assemblyId),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      await Promise.all(
        snapshot.docs.map((d) => deleteDoc(doc(db, COLLECTION_NAME, d.id))),
      );
      return { success: true };
    }

    return { success: false, error: "User not found" };
  } catch (error) {
    console.error("Error deleting assembly user:", error);
    return { success: false, error };
  }
}

/**
 * Deletes ALL assembly user records for a specific assembly.
 * @param {string} assemblyId - Assembly ID
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export async function deleteAllAssemblyUsers(assemblyId) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("assemblyId", "==", assemblyId),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      await Promise.all(
        snapshot.docs.map((d) => deleteDoc(doc(db, COLLECTION_NAME, d.id))),
      );
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting all assembly users:", error);
    return { success: false, error };
  }
}
