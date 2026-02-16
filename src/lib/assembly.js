import { db } from "@/lib/firebase";
import { deleteAllAssemblyUsers } from "@/lib/assemblyUser";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  where,
  documentId,
  onSnapshot,
} from "firebase/firestore";

// Create Assembly
export async function createAssembly(assemblyData, entityId) {
  try {
    const assemblyRef = collection(db, "assembly");
    const docRef = await addDoc(assemblyRef, {
      ...assemblyData,
      entityId: entityId,
      status: "create", // Initial status
      createdAt: serverTimestamp(),
      assemblyRegistrations: [], // Array of objects as requested
    });

    // Create the new document in assemblyRegistrations collection
    const regRecordRef = await addDoc(collection(db, "assemblyRegistrations"), {
      assemblyId: docRef.id,
      registrations: [],
      createdAt: serverTimestamp(),
    });

    // Update the assembly with the ID of the new registration record
    await updateDoc(docRef, {
      registrationRecordId: regRecordRef.id,
    });

    // Update Entity - add assembly ID to array
    const entityRef = doc(db, "entity", entityId);
    await updateDoc(entityRef, {
      lastUpdateOwners: arrayUnion(docRef.id),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating assembly:", error);
    return { success: false, error };
  }
}

export function listenAssembliesWithOperator(callback, limitCount = null) {
  let q = query(collection(db, "assembly"), orderBy("createdAt", "desc"));

  if (limitCount) {
    q = query(
      collection(db, "assembly"),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
  }

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    try {
      const assemblies = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (assemblies.length === 0) {
        callback([]);
        return;
      }

      // 1️⃣ Obtener entityIds únicos
      const entityIds = [
        ...new Set(assemblies.map((a) => a.entityId).filter(Boolean)),
      ];

      const entityChunks = chunkArray(entityIds);
      const entityMap = {};

      for (const chunk of entityChunks) {
        const entitiesSnapshot = await getDocs(
          query(collection(db, "entity"), where(documentId(), "in", chunk)),
        );

        entitiesSnapshot.forEach((doc) => {
          entityMap[doc.id] = doc.data();
        });
      }

      // 2️⃣ Obtener operatorIds únicos
      const operatorIds = [
        ...new Set(
          Object.values(entityMap)
            .map((entity) => entity.operatorId)
            .filter(Boolean),
        ),
      ];

      const operatorChunks = chunkArray(operatorIds);
      const userMap = {};

      for (const chunk of operatorChunks) {
        const usersSnapshot = await getDocs(
          query(collection(db, "user"), where(documentId(), "in", chunk)),
        );

        usersSnapshot.forEach((doc) => {
          userMap[doc.id] = doc.data();
        });
      }

      // 3️⃣ Enriquecer
      const enrichedAssemblies = assemblies.map((assembly) => {
        const entity = entityMap[assembly.entityId];
        const operator = entity ? userMap[entity.operatorId] : null;

        return {
          ...assembly,
          operatorId: entity?.operatorId || null,
          operatorName: operator?.name || null,
        };
      });

      callback(enrichedAssemblies);
    } catch (error) {
      console.error("Error in realtime assemblies listener:", error);
    }
  });

  return unsubscribe;
}

// Get Assembly by ID
export async function getAssemblyById(assemblyId) {
  try {
    const docRef = doc(db, "assembly", assemblyId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Assembly not found" };
    }
  } catch (error) {
    console.error("Error fetching assembly:", error);
    return { success: false, error };
  }
}
// Update Assembly
export async function updateAssembly(assemblyId, assemblyData) {
  try {
    const docRef = doc(db, "assembly", assemblyId);
    await updateDoc(docRef, {
      ...assemblyData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating assembly:", error);
    return { success: false, error };
  }
}

// Toggle Assembly-specific vote block
export async function toggleAssemblyVoteBlock(
  assemblyId,
  registryId,
  isBlocked,
) {
  try {
    const docRef = doc(db, "assembly", assemblyId);
    await updateDoc(docRef, {
      blockedVoters: isBlocked
        ? arrayUnion(registryId)
        : arrayRemove(registryId),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error toggling assembly vote block:", error);
    return { success: false, error };
  }
}

// Get all assemblies (optionally with a limit)
export async function getAllAssemblies(limitCount = null) {
  try {
    const assemblyCol = collection(db, "assembly");
    let q = query(assemblyCol, orderBy("createdAt", "desc"));

    if (limitCount) {
      q = query(assemblyCol, orderBy("createdAt", "desc"), limit(limitCount));
    }

    const snapshot = await getDocs(q);
    const assemblies = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: assemblies };
  } catch (error) {
    console.error("Error fetching assemblies:", error);
    return { success: false, error };
  }
}

function chunkArray(array, size = 10) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export async function getAllAssembliesWithOperator(limitCount = null) {
  try {
    // 1️⃣ Traer assemblies
    let q = query(collection(db, "assembly"), orderBy("createdAt", "desc"));

    if (limitCount) {
      q = query(
        collection(db, "assembly"),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );
    }

    const snapshot = await getDocs(q);

    const assemblies = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (assemblies.length === 0) {
      return { success: true, data: [] };
    }

    // 2️⃣ Obtener entityIds únicos
    const entityIds = [
      ...new Set(assemblies.map((a) => a.entityId).filter(Boolean)),
    ];
    console.log(entityIds);

    const entityChunks = chunkArray(entityIds);

    const entityMap = {};

    for (const chunk of entityChunks) {
      const entitiesSnapshot = await getDocs(
        query(collection(db, "entity"), where(documentId(), "in", chunk)),
      );

      entitiesSnapshot.forEach((doc) => {
        entityMap[doc.id] = doc.data();
      });
    }
    console.log(entityMap);

    // 3️⃣ Obtener operatorIds únicos
    const operatorIds = [
      ...new Set(
        Object.values(entityMap)
          .map((entity) => entity.operatorId)
          .filter(Boolean),
      ),
    ];
    console.log(operatorIds);

    const operatorChunks = chunkArray(operatorIds);

    const userMap = {};
    console.log(operatorChunks);

    for (const chunk of operatorChunks) {
      const usersSnapshot = await getDocs(
        query(collection(db, "user"), where(documentId(), "in", chunk)),
      );

      usersSnapshot.forEach((doc) => {
        userMap[doc.id] = doc.data();
      });
    }
    console.log(userMap);

    // 4️⃣ Enriquecer assemblies
    const enrichedAssemblies = assemblies.map((assembly) => {
      const entity = entityMap[assembly.entityId];
      const operator = entity ? userMap[entity.operatorId] : null;

      return {
        ...assembly,
        operatorId: entity?.operatorId || null,
        operatorName: operator?.name || null,
      };
    });
    console.log(enrichedAssemblies);

    return { success: true, data: enrichedAssemblies };
  } catch (error) {
    console.error("Error fetching assemblies:", error);
    return { success: false, error };
  }
}

// Delete Assembly (Cascade)
export async function deleteAssembly(assemblyId) {
  try {
    const assemblyRef = doc(db, "assembly", assemblyId);
    const assemblySnap = await getDoc(assemblyRef);

    if (!assemblySnap.exists()) {
      return { success: false, error: "Assembly not found" };
    }

    const assemblyData = assemblySnap.data();

    // 1. Delete all Questions
    if (assemblyData.questions && Array.isArray(assemblyData.questions)) {
      const deletePromises = assemblyData.questions.map((qId) =>
        deleteDoc(doc(db, "question", qId)),
      );
      await Promise.all(deletePromises);
    }

    // 2. Remove reference from Entity
    if (assemblyData.entityId) {
      const entityRef = doc(db, "entity", assemblyData.entityId);
      // We diligently try to remove it, but if entity doesn't exist, ignore
      try {
        await updateDoc(entityRef, {
          lastUpdateOwners: arrayRemove(assemblyId),
        });
      } catch (err) {
        console.warn(
          "Could not update entity reference, maybe entity is gone:",
          err,
        );
      }
    }

    // 3. Delete all Assembly Users
    await deleteAllAssemblyUsers(assemblyId);

    // 4. Delete associated registration record if exists
    if (assemblyData.registrationRecordId) {
      try {
        await deleteDoc(
          doc(db, "assemblyRegistrations", assemblyData.registrationRecordId),
        );
      } catch (err) {
        console.warn("Could not delete registration record:", err);
      }
    }

    // 5. Delete Assembly
    await deleteDoc(assemblyRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting assembly:", error);
    return { success: false, error };
  }
}

export function normalizeAssemblyPayload(formData, blockedVoters) {
  return {
    name: formData.name,
    date: formData.date,
    hour: `${formData.hour}:${formData.minute} ${formData.ampm}`,
    type: formData.type,
    meetLink: formData.type === "Presencial" ? "" : formData.meetLink,
    hasWppSupport: formData.hasWppSupport,
    wppPhone: formData.hasWppSupport ? formData.wppPhone : "",
    accessMethod: formData.accessMethod,
    requireFullName: !!formData.requireFullName,
    requireEmail: !!formData.requireEmail,
    requirePhone: !!formData.requirePhone,
    canAddOtherRepresentatives: formData.canAddOtherRepresentatives,
    powerLimit: formData.powerLimit || "",
    blockedVoters: Array.from(blockedVoters),
  };
}

export function parseHourFromDB(hourString) {
  let hour = "08";
  let minute = "00";
  let ampm = "AM";

  if (hourString) {
    const match = hourString.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (match) {
      hour = match[1].padStart(2, "0");
      minute = match[2];
      ampm = match[3].toUpperCase();
    }
  }

  return { hour, minute, ampm };
}

export function isFutureAssembly(date, hour, minute, ampm) {
  const now = new Date();
  let h = parseInt(hour);

  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;

  const [y, m, d] = date.split("-").map(Number);
  const assemblyDate = new Date(y, m - 1, d, h, parseInt(minute));

  return assemblyDate > now;
}
