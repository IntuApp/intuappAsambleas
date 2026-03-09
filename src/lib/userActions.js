// src/lib/userActions.js
'use server' // <-- Obligatorio para que Next.js sepa que esto es seguro

import { db } from "@/lib/firebase";
import { doc, collection, addDoc, updateDoc, deleteDoc, getDoc } from "firebase/firestore"; // <-- Agregamos addDoc
import bcrypt from "bcryptjs"; // <-- Agregamos bcrypt
import { deleteEntity } from "./entityActions";

export async function createOperator(operatorData) {
  if (!db) throw new Error("Database connection not available");

  try {
    // 1. Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(operatorData.password, 10);

    // 2. Preparar el objeto del usuario
    const newUser = {
      ...operatorData,
      role: "3", 
      password: hashedPassword,
      createdAt: new Date().toISOString(), 
      entities: [], 
    };

    // 3. Guardar en Firestore
    const docRef = await addDoc(collection(db, "user"), newUser);

    // 4. Retornar éxito
    return { success: true, id: docRef.id };

  } catch (error) {
    console.error("Error creando operador: ", error);
    throw new Error(error.message || 'Error al crear el operador');
  }
}

export async function updateOperator(id, operatorData) {
  if (!db) throw new Error("Database connection not available");
  try {
    const docRef = doc(db, "user", id);
    
    // OJO: Si estás actualizando contraseña, deberías hashearla con bcrypt primero.
    // Si no cambian la contraseña, asegúrate de NO enviar el campo password en operatorData
    
    await updateDoc(docRef, {
      ...operatorData,
      updatedAt: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar el operador');
  }
}

export async function deleteOperator(userId) {
  if (!db) throw new Error("Database connection not available");
  
  try {
    const userRef = doc(db, "user", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const entityIds = userData.entities || [];

      for (const entityId of entityIds) {
        const entityRef = doc(db, "entity", entityId); 
        const entitySnap = await getDoc(entityRef);
        
        if (entitySnap.exists()) {
          const entityData = { id: entitySnap.id, ...entitySnap.data() };
          const resEntity = await deleteEntity(entityData);
          
          if (!resEntity.success) {
            console.error(`No se pudo borrar la entidad ${entityId}:`, resEntity.error);
          }
        }
      }
    }

    await deleteDoc(userRef);

    return { success: true };
  } catch (error) {
    console.error("Error crítico eliminando Operador y sus entidades:", error);
    return { success: false, error: error.message };
  }
}