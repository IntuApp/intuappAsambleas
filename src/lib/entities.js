import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";

/* =========================================================
   ======================= ENTITY CRUD ======================
   ========================================================= */

/* ===================== GET ===================== */

export async function getEntitiesByOperator(operatorId) {
  try {
    const q = query(
      collection(db, "entity"),
      where("operatorId", "==", operatorId),
    );

    const querySnapshot = await getDocs(q);
    const entities = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: entities };
  } catch (error) {
    console.error("Error fetching entities:", error);
    return { success: false, error };
  }
}

export async function getEntityById(entityId) {
  try {
    const docRef = doc(db, "entity", entityId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: "Entity not found" };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() },
    };
  } catch (error) {
    console.error("Error fetching entity:", error);
    return { success: false, error };
  }
}

/* ===================== CREATE ===================== */

export async function createEntityAdmin(adminData) {
  try {
    const docRef = await addDoc(collection(db, "admin"), {
      ...adminData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating entity admin:", error);
    return { success: false, error };
  }
}

export async function createEntity(entityData, operatorId) {
  try {
    const entityRef = await addDoc(collection(db, "entity"), {
      ...entityData,
      operatorId,
      createdAt: serverTimestamp(),
    });

    const userRef = doc(db, "user", operatorId);
    await updateDoc(userRef, {
      entities: arrayUnion(entityRef.id),
    });

    return { success: true, id: entityRef.id };
  } catch (error) {
    console.error("Error creating entity:", error);
    return { success: false, error };
  }
}

/* ===================== UPDATE ===================== */

export async function updateEntity(entityId, entityData) {
  try {
    const entityRef = doc(db, "entity", entityId);

    await updateDoc(entityRef, {
      ...entityData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating entity:", error);
    return { success: false, error };
  }
}

/* ===================== DELETE ===================== */

export async function deleteEntity(entityId) {
  try {
    await deleteDoc(doc(db, "entity", entityId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting entity:", error);
    return { success: false, error };
  }
}

/* =========================================================
   ============ ASSEMBLY REGISTRIES LIST CRUD =============
   ========================================================= */

/* ===================== GET ===================== */

export async function getAssemblyRegistriesList(listId) {
  try {
    const docRef = doc(db, "assemblyRegistriesList", listId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: "List not found" };
    }

    const data = docSnap.data();

    return {
      success: true,
      data: data.assemblyRegistries,
      createdAt: data.createdAt,
    };
  } catch (error) {
    console.error("Error fetching assembly registries list:", error);
    return { success: false, error };
  }
}

/* ===================== CREATE ===================== */

export async function createAssemblyRegistriesList(registriesData) {
  try {
    const assemblyRegistries = {};

    registriesData.forEach((row) => {
      const randomId = doc(collection(db, "temp")).id;
      assemblyRegistries[randomId] = mapRegistryRow(row);
    });

    const docRef = await addDoc(collection(db, "assemblyRegistriesList"), {
      assemblyRegistries,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating assembly registries list:", error);
    return { success: false, error };
  }
}

/* ===================== UPDATE ===================== */

export async function updateAssemblyRegistriesList(listId, newData) {
  try {
    const docRef = doc(db, "assemblyRegistriesList", listId);

    const newRegistries = {};
    newData.forEach((row) => {
      const randomId = doc(collection(db, "temp")).id;
      newRegistries[randomId] = mapRegistryRow(row);
    });

    await updateDoc(docRef, {
      assemblyRegistries: newRegistries,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating assembly registries list:", error);
    return { success: false, error };
  }
}

/* ===================== DELETE ===================== */

export async function deleteAssemblyRegistriesList(listId) {
  try {
    await deleteDoc(doc(db, "assemblyRegistriesList", listId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting assembly registries list:", error);
    return { success: false, error };
  }
}

/* =========================================================
   ================= REGISTRY OPERATIONS ===================
   ========================================================= */

export async function updateRegistryStatus(
  listId,
  registryId,
  status,
  additionalData = {},
) {
  try {
    const docRef = doc(db, "assemblyRegistriesList", listId);

    const updates = {
      [`assemblyRegistries.${registryId}.registerInAssembly`]: status,
    };

    if (status) {
      Object.entries(additionalData).forEach(([key, value]) => {
        updates[`assemblyRegistries.${registryId}.${key}`] = value;
      });
    } else {
      [
        "firstName",
        "lastName",
        "email",
        "phone",
        "powerUrl",
        "role",
        "userDocument",
      ].forEach((field) => {
        updates[`assemblyRegistries.${registryId}.${field}`] = "";
      });
    }

    await updateDoc(docRef, updates);
    return { success: true };
  } catch (error) {
    console.error("Error updating registry status:", error);
    return { success: false, error };
  }
}

export async function updateRegistryVotingPreference(
  listId,
  registryId,
  preference,
) {
  try {
    const docRef = doc(db, "assemblyRegistriesList", listId);
    await updateDoc(docRef, {
      [`assemblyRegistries.${registryId}.votingPreference`]: preference,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating voting preference:", error);
    return { success: false, error };
  }
}

export async function resetAssemblyRegistries(listId) {
  try {
    const docRef = doc(db, "assemblyRegistriesList", listId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return { success: false };

    const registries = docSnap.data().assemblyRegistries || {};
    const updatedRegistries = {};

    Object.keys(registries).forEach((key) => {
      updatedRegistries[key] = {
        ...registries[key],
        voteBlocked: false,
        registerInAssembly: false,
        isDeleted: false,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        powerUrl: "",
        userDocument: "",
      };
    });

    await updateDoc(docRef, {
      assemblyRegistries: updatedRegistries,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting registries:", error);
    return { success: false, error };
  }
}

export async function toggleVoteBlock(listId, registryId, isBlocked) {
  try {
    const docRef = doc(db, "assemblyRegistriesList", listId);

    await updateDoc(docRef, {
      [`assemblyRegistries.${registryId}.voteBlocked`]: isBlocked,
    });

    return { success: true };
  } catch (error) {
    console.error("Error toggling vote block:", error);
    return { success: false, error };
  }
}

export async function toggleRegistryDeletion(listId, registryId, isDeleted) {
  try {
    const docRef = doc(db, "assemblyRegistriesList", listId);

    const updates = {
      [`assemblyRegistries.${registryId}.isDeleted`]: isDeleted,
    };

    if (isDeleted) {
      updates[`assemblyRegistries.${registryId}.registerInAssembly`] = false;
    }

    await updateDoc(docRef, updates);

    return { success: true };
  } catch (error) {
    console.error("Error toggling registry deletion:", error);
    return { success: false, error };
  }
}

export async function addRegistryToList(listId, registryData) {
  try {
    const docRef = doc(db, "assemblyRegistriesList", listId);
    const randomId = doc(collection(db, "temp")).id;

    await updateDoc(docRef, {
      [`assemblyRegistries.${randomId}`]: {
        ...registryData,
        voteBlocked: false,
        registerInAssembly: false,
        isDeleted: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding registry:", error);
    return { success: false, error };
  }
}

export async function cloneAndResetAssemblyRegistriesList(originalListId) {
  try {
    const docRef = doc(db, "assemblyRegistriesList", originalListId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false };
    }

    const oldRegistries = docSnap.data().assemblyRegistries || {};
    const newRegistries = {};

    Object.keys(oldRegistries).forEach((key) => {
      newRegistries[key] = {
        ...oldRegistries[key],
        voteBlocked: false,
        registerInAssembly: false,
        isDeleted: false,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        powerUrl: "",
        userDocument: "",
      };
    });

    const newDocRef = await addDoc(collection(db, "assemblyRegistriesList"), {
      assemblyRegistries: newRegistries,
      createdAt: serverTimestamp(),
      clonedFrom: originalListId,
    });

    return { success: true, id: newDocRef.id };
  } catch (error) {
    console.error("Error cloning list:", error);
    return { success: false, error };
  }
}

/* =========================================================
   ======================== HELPERS ========================
   ========================================================= */

const mapRegistryRow = (row) => {
  const findValue = (possibleKeys) => {
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null) return String(row[key]);
    }

    const rowKeys = Object.keys(row);
    for (const pKey of possibleKeys) {
      const match = rowKeys.find(
        (rk) => rk.toLowerCase() === pKey.toLowerCase(),
      );
      if (match) return String(row[match]);
    }

    return "";
  };

  return {
    tipo: findValue(["Tipo", "Clase", "Uso"]),
    grupo: findValue(["Grupo", "Torre", "Bloque", "Interior"]),
    propiedad: findValue(["Propiedad", "Apartamento", "Casa"]),
    coeficiente: findValue(["Coeficiente", "%"]) || "0",
    numeroVotos: findValue(["Número de Votos", "Votos"]) || "1",
    documento: findValue(["Documento", "Cedula", "NIT"]),
  };
};
