'use server';

import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, arrayUnion, deleteDoc, query, writeBatch, getDocs, where } from "firebase/firestore";
import { deleteAssembly } from "./assemblyActions";

/**
 * Función auxiliar para normalizar el procesamiento de los registros.
 * Mantiene las llaves originales para evitar que el alias modifique la estructura de la data.
 */
function processExcelRows(excelData, excelHeaders) {
  const processedRegistry = {};

  excelData.forEach((row) => {
    const mappedRow = {};

    // 1. Guardamos la data SIEMPRE con el header original del Excel
    excelHeaders.forEach(header => {
      mappedRow[header] = row[header] !== undefined ? String(row[header]) : "";
    });

    // 2. Lógica de Votos (Buscamos la columna original que contenga 'voto')
    const votosKey = Object.keys(mappedRow).find(k => k.toLowerCase().includes('voto'));

    if (votosKey && (!mappedRow[votosKey] || mappedRow[votosKey].trim() === "")) {
      mappedRow[votosKey] = "1";
    } else if (!votosKey) {
      mappedRow['numeroVotos'] = "1";
    }

    // 3. Generamos ID único para el registro
    const rowId = crypto.randomUUID().replace(/-/g, '').substring(0, 20);
    processedRegistry[rowId] = mappedRow;
  });

  return processedRegistry;
}

export async function createEntityWithRegistry(operatorId, entityData, excelData, columnAliases, excelHeaders) {
  if (!db) throw new Error("Database connection not available");

  try {
    // PROCESAMIENTO: Ahora usa headers originales como llaves
    const processedRegistry = processExcelRows(excelData, excelHeaders);

    // 1. CREAR REGISTRO DE ASAMBLEÍSTAS
    const registryRef = await addDoc(collection(db, "assemblyRegistriesList"), {
      assemblyRegistries: processedRegistry,
      createdAt: new Date().toISOString()
    });

    // 2. CREAR LA ENTIDAD
    // Guardamos los alias por separado como referencia para el frontend
    const newEntity = {
      name: entityData.name,
      nit: entityData.nit || "",
      typeID: entityData.type,
      city: entityData.city || "",
      address: entityData.address || "",
      adminEntity: {
        name: entityData.adminName || "",
        email: entityData.adminEmail || "",
        phone: entityData.adminPhone || ""
      },
      assemblyRegistriesListId: registryRef.id,
      columnAliases: columnAliases || {}, // Se guarda la referencia { "Original": "Alias" }
      headers: excelHeaders || [],
      databaseStatus: "done",
      createdAt: new Date().toISOString(),
      totalRegistries: excelData.length
    };

    const entityRef = await addDoc(collection(db, "entity"), newEntity);

    const operatorRef = doc(db, "user", operatorId);
    await updateDoc(operatorRef, {
      entities: arrayUnion(entityRef.id)
    });

    return { success: true, entityId: entityRef.id };

  } catch (error) {
    console.error("Error en la creación de entidad:", error);
    throw new Error(error.message || 'Error al procesar la entidad');
  }
}

export async function updateEntityDatabase(entityId, excelData, columnAliases, excelHeaders) {
  if (!db) throw new Error("Database connection not available");

  try {
    const processedRegistry = processExcelRows(excelData, excelHeaders);

    const newRegistryRef = await addDoc(collection(db, "assemblyRegistriesList"), {
      assemblyRegistries: processedRegistry,
      createdAt: new Date().toISOString(),
      relatedEntityId: entityId
    });

    const entityRef = doc(db, "entity", entityId);
    await updateDoc(entityRef, {
      assemblyRegistriesListId: newRegistryRef.id,
      columnAliases: columnAliases, // Permite editar o añadir nuevos alias en el futuro
      headers: excelHeaders,
      totalRegistries: excelData.length,
      databaseStatus: "done",
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error("Error actualizando BD de entidad:", error);
    throw new Error(error.message || 'Error al actualizar la base de datos');
  }
}
/**
 * Actualiza la información básica de una entidad (sin tocar el Excel).
 */
export async function updateEntityBasicData(entityId, data) {
  if (!db) throw new Error("Database connection not available");
  try {
    const entityRef = doc(db, "entity", entityId);

    const updateData = {
      name: data.name,
      nit: data.nit,
      typeID: data.type,
      city: data.city,
      address: data.address,
      adminEntity: {
        name: data.adminName,
        email: data.adminEmail,
        phone: data.adminPhone
      },
      updatedAt: new Date().toISOString()
    };

    await updateDoc(entityRef, updateData);
    return { success: true };
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar la entidad');
  }
}


export const deleteEntity = async (entityData) => {
  try {
    const { id: entityId, assemblyRegistriesListId } = entityData;

    // 1. Buscamos todas las asambleas de esta entidad
    const assembliesSnap = await getDocs(
      query(collection(db, "assembly"), where("entityId", "==", entityId))
    );

    // 2. Borramos cada asamblea (cascada a votos, preguntas, etc.)
    for (const aDoc of assembliesSnap.docs) {
      await deleteAssembly(aDoc.id);
    }

    const batch = writeBatch(db);

    // 3. Borrar el assemblyRegistriesList usando el ID que viene en la entidad
    if (assemblyRegistriesListId) {
      const registryRef = doc(db, "assemblyRegistriesList", assemblyRegistriesListId);
      batch.delete(registryRef);
    }

    // 4. Borrar el documento de la Entidad
    const entityRef = doc(db, "entity", entityId);
    batch.delete(entityRef);

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar entidad:", error);
    return { success: false, error: error.message };
  }
};
