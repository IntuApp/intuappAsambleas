// src/lib/entity.js
import { db } from "@/lib/firebase";
import { doc, onSnapshot, getDoc, collection, query, where, orderBy } from "firebase/firestore";
import { updateEntityBasicData } from "./entityActions";

/**
 * Escucha en tiempo real los datos de una entidad específica por su ID.
 * También resuelve el nombre del tipo de entidad.
 */
export function listenToEntityById(entityId, callback) {
  const docRef = doc(db, "entity", entityId);

  const unsubscribe = onSnapshot(docRef, async (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }

    try {
      const entityData = docSnap.data();
      let typeName = "Desconocido";

      // Resolvemos el nombre del tipo de entidad
      if (entityData.typeID) {
        const typeRef = doc(db, "type-entity", String(entityData.typeID));
        const typeSnap = await getDoc(typeRef);
        if (typeSnap.exists()) {
          typeName = typeSnap.data().name;
        }
      }

      callback({
        id: docSnap.id,
        ...entityData,
        typeName, // Agregamos el nombre resuelto
      });
    } catch (error) {
      console.error("Error al traer detalles de la entidad:", error);
    }
  });

  return unsubscribe;
}


export function listenToEntityAssemblies(entityId, callback) {
  // Creamos la query usando el campo de relación 'entityId'
  const q = query(
    collection(db, "assembly"),
    where("entityId", "==", entityId),
    // orderBy("createdAt", "desc") // Idealmente deberías tener este índice
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const assemblies = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(assemblies);
  }, (error) => {
    console.error("Error escuchando asambleas de la entidad:", error);
  });

  return unsubscribe;
}


/**
 * Trae (una sola vez) la lista completa de asambleístas desde la colección assemblyRegistriesList.
 * Transforma el objeto de mapa de Firebase en un array para usar en tablas.
 * @param {string} listId - El ID del documento en assemblyRegistriesList
 */
export async function getAssemblyRegistriesArray(listId) {
  if (!listId) return [];

  try {
    const docRef = doc(db, "assemblyRegistriesList", listId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return [];

    const data = docSnap.data();
    const registriesMap = data.assemblyRegistries || {};

    // Transformamos el Mapa { "id1": {datos}, "id2": {datos} } 
    // a un Array [{id: "id1", ...datos}, {id: "id2", ...datos}]
    const registriesArray = Object.entries(registriesMap).map(([key, value]) => ({
      id: key, // El ID interno del registro
      ...value,
    }));

    return registriesArray;

  } catch (error) {
    console.error("Error al traer registros de asambleístas:", error);
    // No lanzamos error para no romper la UI, devolvemos array vacío
    return []; 
  }
}

export async function updateEntity(entityId, formData) {
  try {
    // Llamamos al Server Action
    const result = await updateEntityBasicData(entityId, formData);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error al actualizar la entidad:", error);
    return { success: false, error: error.message };
  }
}


/**
 * Trae la lista de asambleístas para configurar las restricciones de voto.
 */
export async function getRegistriesForRestrictions(registriesListId) {
    if (!registriesListId) return [];
    const docSnap = await getDoc(doc(db, "assemblyRegistriesList", registriesListId));
    if (!docSnap.exists()) return [];
    
    const data = docSnap.data().assemblyRegistries || {};
    return Object.entries(data).map(([id, val]) => ({
        id, // Este ID es el que irá al array blockedProperties
        ...val
    }));
}