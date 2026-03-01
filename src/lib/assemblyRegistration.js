import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    arrayUnion
} from "firebase/firestore";

/**
 * Sube el archivo de poder a Firebase Storage y retorna la URL pública.
 */
export const uploadPowerFile = async (assemblyId, docNumber, file) => {
    if (!file) return null;
    const fileRef = ref(storage, `assemblies/${assemblyId}/powers/${docNumber}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
};

/**
 * Busca el documento de la asamblea y agrega al miembro en el array 'registrations'.
 */
export const addMemberToAssemblyRegistration = async (assemblyId, memberData) => {
    try {
        // 1. Localizar el documento único de registro de esta asamblea
        const q = query(collection(db, "assemblyRegistrations"), where("assemblyId", "==", assemblyId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("No se encontró el documento maestro de la asamblea.");
        }

        // Obtenemos el ID del documento (ej: FYLGFtV8P...)
        const masterDocId = querySnapshot.docs[0].id;
        const masterDocRef = doc(db, "assemblyRegistrations", masterDocId);

        // 2. Inyectar el objeto del miembro en el array global
        await updateDoc(masterDocRef, {
            registrations: arrayUnion({
                ...memberData,
                createdAt: new Date().toISOString() // Fecha de ingreso del asambleísta
            })
        });

        return { success: true };
    } catch (error) {
        console.error("Error al añadir miembro al array:", error);
        throw error;
    }
};
/**
 * Busca si un documento ya existe dentro del array 'registrations' 
 * del documento maestro de la asamblea.
 */
export const checkExistingRegistration = async (assemblyId, document) => {
    const q = query(collection(db, "assemblyRegistrations"), where("assemblyId", "==", assemblyId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return { exists: false, data: null };

    const masterData = querySnapshot.docs[0].data();
    // Buscamos en el array si alguien tiene ese mainDocument
    const userRegistration = masterData.registrations?.find(r => r.mainDocument === document);

    return {
        exists: !!userRegistration,
        userData: userRegistration || null
    };
};

/**
 * Verifica si una propiedad (ownerId) ya está en uso por otro asambleísta
 */
export const isPropertyAlreadyAssigned = async (assemblyId, propertyId) => {
    const q = query(collection(db, "assemblyRegistrations"), where("assemblyId", "==", assemblyId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return false;

    const masterData = querySnapshot.docs[0].data();
    // Buscamos si el ID está en 'ownerId' o en 'representedProperties' de cualquier registro
    return masterData.registrations?.some(r =>
        r.ownerId?.includes(propertyId) ||
        r.representedProperties?.some(rp => rp.ownerId === propertyId)
    );
};

/**
 * Verifica si alguna de las propiedades de una lista ya está asignada a alguien más
 * @returns {Array} Lista de IDs de propiedades que ya están ocupadas
 */
export const checkOccupiedProperties = async (assemblyId, propertyIds) => {
    const q = query(collection(db, "assemblyRegistriesList"), where("assemblyId", "==", assemblyId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return [];

    const masterData = querySnapshot.docs[0].data();
    const allRegistries = masterData.registrations || [];

    // Buscamos IDs que ya existan en ownerId o representedProperties de otros
    const occupied = propertyIds.filter(id =>
        allRegistries.some(r =>
            r.ownerId?.includes(id) ||
            r.representedProperties?.some(rp => rp.ownerId === id)
        )
    );

    return occupied;
};

/**
 * Obtiene todos los IDs de propiedades que ya han sido registrados en la asamblea.
 * Barreremos el array 'registrations' y, dentro de cada uno, el array 'representedProperties'.
 */
export const getAllOccupiedPropertyIds = async (assemblyId) => {
  const q = query(collection(db, "assemblyRegistrations"), where("assemblyId", "==", assemblyId));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return [];

  const masterData = querySnapshot.docs[0].data();
  const occupiedIds = [];

  masterData.registrations?.forEach(member => {
    member.representedProperties?.forEach(prop => {
      if (prop.ownerId) occupiedIds.push(prop.ownerId);
    });
  });

  return occupiedIds;
};

