import { db } from "./firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export async function getEntityTypes() {
  try {
    const querySnapshot = await getDocs(collection(db, "typeEntity"));
    const types = [];
    querySnapshot.forEach((doc) => {
      types.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: types };
  } catch (error) {
    console.error("Error fetching entity types:", error);
    return { success: false, error };
  }
}

export async function getDataByOwnerId(ownerId, assemblyId) {
  try {
    // 1. Obtener la asamblea para saber a qué Entidad pertenece
    const assemblyRef = doc(db, "assembly", assemblyId);
    const assemblySnap = await getDoc(assemblyRef);

    if (!assemblySnap.exists()) {
      throw new Error("Asamblea no encontrada");
    }

    const assemblyData = assemblySnap.data();
    const entityId = assemblyData.entityId;

    // 2. Obtener la Entidad para sacar el ID de la lista maestra
    const entityRef = doc(db, "entity", entityId);
    const entitySnap = await getDoc(entityRef);

    if (!entitySnap.exists()) {
        throw new Error("Entidad no encontrada");
    }

    const entityData = entitySnap.data();
    const listId = entityData.assemblyRegistriesListId;

    if (!listId) {
        throw new Error("La entidad no tiene una base de datos asignada");
    }

    // 3. Obtener la lista maestra de registros
    const listRef = doc(db, "assemblyRegistriesList", listId);
    const listSnap = await getDoc(listRef);

    if (!listSnap.exists()) {
      throw new Error("Lista de registros no encontrada");
    }

    const listData = listSnap.data();
    
    // Obtenemos los datos crudos
    const rawData = listData.assemblyRegistries || listData.registries;
    
    let propertyData = null;

    // 🔥 LA SOLUCIÓN: Buscamos dependiendo de cómo se guardó la data
    if (typeof rawData === "object" && rawData !== null && !Array.isArray(rawData)) {
        // Si es un Diccionario (Como muestra tu consola), el ownerId ES la llave
        propertyData = rawData[ownerId];
        
        // Por si acaso el ID estuviera por dentro y no en la llave
        if (!propertyData) {
            propertyData = Object.values(rawData).find(reg => reg.id === ownerId || reg.ownerId === ownerId);
        }
    } else if (Array.isArray(rawData)) {
        // Si es un Array normal
        propertyData = rawData.find(reg => reg.id === ownerId || reg.ownerId === ownerId);
    }

    if (propertyData) {
      return { success: true, data: propertyData };
    } else {
      return { success: false, error: "Propiedad no encontrada en la lista maestra" };
    }

  } catch (error) {
    console.error("Error en getDataByOwnerId:", error);
    return { success: false, error: error.message };
  }
}