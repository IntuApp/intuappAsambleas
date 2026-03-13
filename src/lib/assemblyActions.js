'use server';

import { db } from "@/lib/firebase";
// 🔥 CORRECCIÓN: Se agregaron arrayUnion y arrayRemove a la importación
import {
  writeBatch,
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

/**
 * Crea una asamblea y su respectivo registro de control de forma vinculada.
 */
export async function createFullAssembly(entityId, assemblyData, blockedIds) {
  if (!db) throw new Error("Database connection not available");

  try {
    const registrationRef = await addDoc(collection(db, "assemblyRegistrations"), {
      entityId: entityId,
      blockedProperties: blockedIds || [],
      registrations: [],
      createdAt: new Date().toISOString()
    });

    const newAssembly = {
      entityId: entityId,
      registrationRecordId: registrationRef.id,
      name: assemblyData.name,
      date: assemblyData.date,
      hour: assemblyData.hour,
      typeId: String(assemblyData.typeId),
      registerIsOpen: true,
      meetLink: assemblyData.meetLink || "",
      hasWppSupport: Boolean(assemblyData.hasWppSupport),
      wppPhone: assemblyData.wppPhone || "",
      accessMethod: "database_document",
      requireFullName: Boolean(assemblyData.requireFullName),
      requireEmail: Boolean(assemblyData.requireEmail),
      requirePhone: Boolean(assemblyData.requirePhone),
      canAddOtherRepresentatives: Boolean(assemblyData.canAddOtherRepresentatives),
      powerLimit: String(assemblyData.powerLimit || "0"),
      statusID: "1",
      createdAt: new Date().toISOString(),
    };

    const assemblyRef = await addDoc(collection(db, "assembly"), newAssembly);

    await updateDoc(doc(db, "assemblyRegistrations", registrationRef.id), {
      assemblyId: assemblyRef.id
    });

    return { success: true, assemblyId: assemblyRef.id };

  } catch (error) {
    console.error("Error creando asamblea completa:", error);
    throw new Error(error.message || 'Error al procesar la creación de la asamblea');
  }
}
/**
 * Actualiza los datos de una asamblea existente y sus restricciones de voto.
 */
export async function updateFullAssembly(assemblyId, assemblyData) {
  if (!db) throw new Error("Database connection not available");

  try {
    const batch = writeBatch(db);

    // 1. Referencia al documento de la asamblea
    const assemblyRef = doc(db, "assembly", assemblyId);

    // 2. Referencia al documento de registros (donde están los bloqueados)
    // Usamos el ID que viene en la data de la asamblea
    const registrationId = assemblyData.registrationRecordId;
    if (!registrationId) throw new Error("No se encontró el ID de registro de esta asamblea");
    const registrationRef = doc(db, "assemblyRegistrations", registrationId);

    // 3. Preparar los datos de actualización de la asamblea
    // Solo mapeamos los campos que están en el modal de edición
    const assemblyUpdates = {
      name: assemblyData.name,
      date: assemblyData.date,
      hour: assemblyData.hour,
      typeId: String(assemblyData.typeId),
      meetLink: assemblyData.meetLink || "",
      hasWppSupport: Boolean(assemblyData.hasWppSupport),
      wppPhone: assemblyData.wppPhone || "",
      requireFullName: Boolean(assemblyData.requireFullName),
      requireEmail: Boolean(assemblyData.requireEmail),
      requirePhone: Boolean(assemblyData.requirePhone),
      powerLimit: String(assemblyData.powerLimit || "0"),
      updatedAt: new Date().toISOString()
    };


    // 5. Ejecutar en batch para asegurar consistencia
    batch.update(assemblyRef, assemblyUpdates);

    await batch.commit();

    return { success: true };

  } catch (error) {
    console.error("Error actualizando asamblea completa:", error);
    throw new Error(error.message || 'Error al procesar la actualización de la asamblea');
  }
}

/**
 * Cambia el estado de la asamblea (1: Creada, 2: Live, 3: Finalizada)
 */
export async function updateAssemblyStatus(assemblyId, statusID) {
  try {
    const assemblyRef = doc(db, "assembly", assemblyId);
    await updateDoc(assemblyRef, {
      statusID: String(statusID),
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    throw new Error("Error al cambiar el estado: " + error.message);
  }
}

/**
 * Abre o cierra el proceso de registro de asambleístas
 */
export async function toggleRegistration(assemblyId, isOpen) {
  try {
    const assemblyRef = doc(db, "assembly", assemblyId);
    await updateDoc(assemblyRef, {
      registerIsOpen: isOpen,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    throw new Error("Error al cambiar estado de registro: " + error.message);
  }
}

/**
 * Agrega o elimina una propiedad del array blockedProperties en tiempo real.
 */
export async function updateLivePropertyBlock(registrationId, propertyId, isBlocking) {
  // Validación de seguridad para evitar errores 500 por parámetros faltantes
  if (!registrationId || !propertyId) {
    throw new Error("Faltan parámetros obligatorios (registrationId o propertyId)");
  }

  try {
    const regRef = doc(db, "assemblyRegistrations", registrationId);

    await updateDoc(regRef, {
      // 🔥 Ahora arrayUnion y arrayRemove funcionarán porque están importados
      blockedProperties: isBlocking
        ? arrayUnion(propertyId)
        : arrayRemove(propertyId),
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error("Error en updateLivePropertyBlock:", error);
    throw new Error("Error al actualizar restricción: " + error.message);
  }
}

export const deleteAssembly = async (assemblyId) => {
  try {
    const batch = writeBatch(db);

    const voteRef = doc(db, "assemblyVotes", assemblyId);
    batch.delete(voteRef);

    const questionRef = doc(db, "assemblyQuestions", assemblyId);
    batch.delete(questionRef);


    const registrationsSnap = await getDocs(
      query(collection(db, "assemblyRegistrations"), where("assemblyId", "==", assemblyId))
    );
    registrationsSnap.forEach((d) => batch.delete(d.ref));

    const assemblyRef = doc(db, "assembly", assemblyId);
    batch.delete(assemblyRef);

    // Ejecutar el lote
    await batch.commit();

    return { success: true };

  } catch (error) {
    console.error("Error eliminando asamblea:", error);
    return { success: false, error: error.message };
  }
};

export async function deleteAssemblyRegistry(registrationRecordId, mainDocument, propertyOwnerId, isMainProperty) {
  try {
    // 1. Obtenemos el documento maestro directamente por su ID
    const regRef = doc(db, "assemblyRegistrations", registrationRecordId);
    const snap = await getDoc(regRef);

    if (!snap.exists()) {
      throw new Error("No se encontró el registro maestro de la asamblea.");
    }

    const data = snap.data();

    // 2. Buscamos el objeto EXACTO del usuario (necesario para que arrayRemove funcione)
    const regToUpdate = (data.registrations || []).find(r => r.mainDocument === mainDocument);

    if (!regToUpdate) {
      throw new Error("El asambleísta no existe en los registros actuales.");
    }

    // 3. Lógica de Eliminación (Principal vs Secundaria)
    if (isMainProperty) {
      // Si es la propiedad principal: Borramos TODO el registro del usuario
      await updateDoc(regRef, {
        registrations: arrayRemove(regToUpdate)
      });
    } else {
      // Si es propiedad manual: Filtramos solo la propiedad que queremos borrar
      const updatedProps = regToUpdate.representedProperties.filter(
        p => p.ownerId !== propertyOwnerId
      );

      // Creamos el nuevo objeto actualizado
      const newReg = {
        ...regToUpdate,
        representedProperties: updatedProps
      };

      // Realizamos el cambio atómico: sacamos el viejo y metemos el nuevo
      await updateDoc(regRef, {
        registrations: arrayRemove(regToUpdate)
      });
      await updateDoc(regRef, {
        registrations: arrayUnion(newReg)
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar el registro atómicamente:", error);
    throw new Error(error.message);
  }
}
/**
 * Cancela una pregunta específica (cambia su estado a '4')
 */
export async function cancelAssemblyQuestion(assemblyId, questionId) {
  try {
    const qRef = doc(db, "assemblyQuestions", assemblyId);
    const snap = await getDoc(qRef);

    if (!snap.exists()) throw new Error("No se encontró el documento de preguntas");

    const data = snap.data();
    const questions = data.questions || [];

    // 1. Buscamos la pregunta que queremos cancelar
    const questionToCancel = questions.find(q => q.id === questionId);

    if (!questionToCancel) throw new Error("Pregunta no encontrada");

    // 2. Creamos una copia de la pregunta con el nuevo estado (4 = CANCELED)
    const updatedQuestion = {
      ...questionToCancel,
      statusId: "4"
    };

    // 3. Operación atómica: Sacamos la vieja y metemos la actualizada
    await updateDoc(qRef, {
      questions: arrayRemove(questionToCancel)
    });

    await updateDoc(qRef, {
      questions: arrayUnion(updatedQuestion)
    });

    return { success: true };
  } catch (error) {
    console.error("Error al cancelar la pregunta:", error);
    throw new Error(error.message);
  }
}
/**
 * Actualiza el estado de una pregunta (Iniciar, Finalizar, Reabrir)
 */
export async function updateQuestionStatus(assemblyId, questionId, newStatusId, meta = {}) {
  try {
    const qRef = doc(db, "assemblyQuestions", assemblyId);
    const snap = await getDoc(qRef);

    if (!snap.exists()) throw new Error("No se encontró el documento de preguntas");

    const data = snap.data();
    const questions = data.questions || [];

    // 1. Buscamos la pregunta original exacta (necesaria para el arrayRemove)
    const questionToUpdate = questions.find(q => q.id === questionId);

    if (!questionToUpdate) throw new Error("Pregunta no encontrada");

    // 2. Creamos la versión actualizada de la pregunta
    const updatedQuestion = {
      ...questionToUpdate,
      statusId: String(newStatusId),
      ...meta
    };

    // 3. Operación atómica de Firebase
    await updateDoc(qRef, {
      questions: arrayRemove(questionToUpdate)
    });

    await updateDoc(qRef, {
      questions: arrayUnion(updatedQuestion)
    });

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar el estado de la pregunta:", error);
    throw new Error(error.message);
  }
}
// Ejemplo de cómo debería ser para que Firestore dispare el evento correctamente
export const updateUserSessionToken = async (assemblyId, documentId, newToken) => {
  const q = query(collection(db, "assemblyRegistrations"), where("assemblyId", "==", assemblyId));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const docRef = snap.docs[0].ref;
    const data = snap.docs[0].data();

    const updatedRegistrations = data.registrations.map(reg => {
      if (reg.mainDocument === documentId) {
        return { ...reg, sessionToken: newToken };
      }
      return reg;
    });

    await updateDoc(docRef, { registrations: updatedRegistrations });
  }
};