import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export async function createOperator(data, userId) {
  try {
    const docRef = await addDoc(collection(db, "representative-operator"), {
      ...data,
      userId: userId,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating representative:", error);
    return { success: false, error };
  }
}

export async function getOperators() {
  try {
    const res = await fetch("/api/operators");
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching operators:", error);
    return [];
  }
}

export async function getOperatorById(id) {
  try {
    // 1. Get User Data
    const userDocRef = doc(db, "user", id);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return { success: false, error: "Operator not found" };
    }

    const userData = { id: userDoc.id, ...userDoc.data() };

    // 2. Get Representative Data
    const q = query(
      collection(db, "representative-operator"),
      where("userId", "==", id)
    );
    const querySnapshot = await getDocs(q);

    let representativeData = {};
    let representativeId = null;

    if (!querySnapshot.empty) {
      const repDoc = querySnapshot.docs[0];
      representativeData = repDoc.data();
      representativeId = repDoc.id;
    }

    return {
      success: true,
      data: {
        ...userData,
        representative: representativeData,
        representativeId: representativeId,
      },
    };
  } catch (error) {
    console.error("Error fetching operator details:", error);
    return { success: false, error };
  }
}

import bcrypt from "bcryptjs";

export async function updateOperator(
  userId,
  representativeId,
  userData,
  representativeData
) {
  try {
    // Hash password if present
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
    }

    // Update User
    const userRef = doc(db, "user", userId);
    await updateDoc(userRef, userData);

    // Update Representative
    if (representativeId) {
      const repRef = doc(db, "representative-operator", representativeId);
      await updateDoc(repRef, representativeData);
    } else {
      // Create if not exists (fallback)
      await addDoc(collection(db, "representative-operator"), {
        ...representativeData,
        userId: userId,
        createdAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating operator:", error);
    return { success: false, error };
  }
}

export async function deleteOperator(userId, representativeId) {
  try {
    await deleteDoc(doc(db, "user", userId));
    if (representativeId) {
      await deleteDoc(doc(db, "representative-operator", representativeId));
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting operator:", error);
    return { success: false, error };
  }
}
