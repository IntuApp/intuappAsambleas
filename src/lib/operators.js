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
  Timestamp,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

import bcrypt from "bcryptjs";


// =============================
// CREATE OPERATOR
// =============================
export async function createOperator(data) {
  try {
    // Hash password
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
    }

    const docRef = await addDoc(collection(db, "user"), {
      ...data,
      role: "3",
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating operator:", error);
    return { success: false, error };
  }
}
export function listenOperators(callback) {
  const q = query(
    collection(db, "user"),
    where("role", "==", "3")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const operators = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(operators);
  });

  return unsubscribe;
}

// =============================
// GET OPERATORS
// =============================
export async function getOperators() {
  try {
    const operatorsRef = collection(db, "user");

    const q = query(operatorsRef, where("role", "==", "3"));

    const querySnapshot = await getDocs(q);

    const operators = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: operators };
  } catch (error) {
    console.error("Error fetching operators:", error);
    return { success: false, error: "Error fetching operators" };
  }
}


// =============================
// GET OPERATORS WITH NEXT ASSEMBLY
// =============================
export async function getOperatorsWithNextAssembly() {
  try {
    const operatorsQuery = query(
      collection(db, "user"),
      where("role", "==", "3"),
    );

    const operatorsSnapshot = await getDocs(operatorsQuery);

    const operators = [];

    for (const operatorDoc of operatorsSnapshot.docs) {
      const operatorData = { id: operatorDoc.id, ...operatorDoc.data() };

      const entitiesQuery = query(
        collection(db, "entity"),
        where("operatorId", "==", operatorDoc.id),
      );

      const entitiesSnapshot = await getDocs(entitiesQuery);
      const entityIds = entitiesSnapshot.docs.map((doc) => doc.id);

      let nextAssembly = null;

      if (entityIds.length > 0) {
        const assembliesQuery = query(
          collection(db, "assembly"),
          where("entityId", "in", entityIds.slice(0, 10)),
          where("status", "==", "create"),
          where("date", ">=", Timestamp.now()),
          orderBy("date", "asc"),
          limit(1),
        );

        const assembliesSnapshot = await getDocs(assembliesQuery);

        if (!assembliesSnapshot.empty) {
          const assemblyDoc = assembliesSnapshot.docs[0];
          nextAssembly = {
            id: assemblyDoc.id,
            ...assemblyDoc.data(),
          };
        }
      }

      operators.push({
        ...operatorData,
        entities: entityIds,
        nextAssembly,
      });
    }

    return { success: true, data: operators };
  } catch (error) {
    console.error("Error fetching operators:", error);
    return { success: false, error: "Error fetching operators" };
  }
}


// =============================
// GET OPERATOR BY ID
// =============================
export async function getOperatorById(id) {
  try {
    const userDocRef = doc(db, "user", id);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return { success: false, error: "Operator not found" };
    }

    return {
      success: true,
      data: {
        id: userDoc.id,
        ...userDoc.data(),
      },
    };
  } catch (error) {
    console.error("Error fetching operator details:", error);
    return { success: false, error };
  }
}


// =============================
// UPDATE OPERATOR
// =============================
export async function updateOperator(userId, updatedData) {
  try {
    // Hash password if present
    if (updatedData.password) {
      const hashedPassword = await bcrypt.hash(updatedData.password, 10);
      updatedData.password = hashedPassword;
    }

    const userRef = doc(db, "user", userId);

    await updateDoc(userRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating operator:", error);
    return { success: false, error };
  }
}


// =============================
// DELETE OPERATOR
// =============================
export async function deleteOperator(userId) {
  try {
    await deleteDoc(doc(db, "user", userId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting operator:", error);
    return { success: false, error };
  }
}
