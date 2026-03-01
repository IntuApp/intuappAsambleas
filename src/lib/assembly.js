import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, getDoc, where, getDocs } from "firebase/firestore";

/**
 * Escucha en tiempo real todas las asambleas
 */
export function listenToAssemblies(callback) {
  // Traemos todas las asambleas. Opcional: puedes añadir orderBy("createdAt", "desc")
  const q = query(collection(db, "assembly"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const assemblies = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(assemblies);
  }, (error) => {
    console.error("Error escuchando asambleas: ", error);
  });

  return unsubscribe;
}

/**
 * Escucha los estados de las asambleas y los convierte en un diccionario fácil de usar.
 * Ejemplo de salida: { "1": "CREATED", "3": "LIVE" }
 */
export function listenToAssemblyStatuses(callback) {
  const q = query(collection(db, "assemblyStatus"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const statuses = {};
    snapshot.docs.forEach((doc) => {
      statuses[doc.id] = doc.data().name; // Guardamos el ID como llave y el nombre como valor
    });
    callback(statuses);
  }, (error) => {
    console.error("Error escuchando estados de asambleas: ", error);
  });

  return unsubscribe;
}

/**
 * Escucha una asamblea específica y su registro de control en tiempo real.
 * Esto permitirá que el Quórum se actualice solo cuando alguien entre.
 */
export function listenToAssemblyLive(assemblyId, callback) {
  const assemblyRef = doc(db, "assembly", assemblyId);

  return onSnapshot(assemblyRef, async (assemblySnap) => {
    if (!assemblySnap.exists()) return callback(null);

    const assemblyData = assemblySnap.data();

    // Escuchamos también el documento de Registros (Asistencias/Bloqueos)
    const registrationRef = doc(db, "assemblyRegistrations", assemblyData.registrationRecordId);

    onSnapshot(registrationRef, (regSnap) => {
      if (!regSnap.exists()) {
        callback({ assembly: { id: assemblySnap.id, ...assemblyData }, registrations: null });
        return;
      }

      callback({
        assembly: { id: assemblySnap.id, ...assemblyData },
        registrations: {
          id: regSnap.id, // <--- ESTA LÍNEA ES VITAL
          ...regSnap.data()
        }
      });
    });
  });
}

/**
 * Trae la lista maestra de la entidad para comparar con los registrados
 */
export async function getEntityMasterList(registriesListId) {
  const docSnap = await getDoc(doc(db, "assemblyRegistriesList", registriesListId));
  if (!docSnap.exists()) return {};
  return docSnap.data().assemblyRegistries || {};
}

export function listenToAllAssembliesWithDetails(callback) {
  const q = query(collection(db, "assembly"));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    try {
      // 1. Extraemos todas las asambleas base
      const assembliesRaw = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 2. Traemos todos los Operadores Logísticos (role == "3") en una sola lectura
      const operatorsQuery = query(collection(db, "user"), where("role", "==", "3"));
      const operatorsSnap = await getDocs(operatorsQuery);
      const operatorsList = operatorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 3. Extraemos IDs de entidades únicos para no hacer lecturas duplicadas a Firestore
      const entityIds = [...new Set(assembliesRaw.map(a => a.entityId).filter(Boolean))];
      const entitiesMap = {};
      
      // Buscamos los nombres de las entidades
      await Promise.all(entityIds.map(async (eId) => {
        const eSnap = await getDoc(doc(db, "entity", eId));
        if (eSnap.exists()) {
          entitiesMap[eId] = eSnap.data().name;
        }
      }));

      // 4. Diccionarios para traducir IDs a textos
      const typeMap = { "1": "Virtual", "2": "Presencial", "3": "Mixta" };
      const statusMap = { "1": "create", "2": "started", "3": "finished" };

      // 5. Cruzamos toda la información
      const populatedAssemblies = assembliesRaw.map(asm => {
        // A. Obtener nombre de la entidad
        const entityName = entitiesMap[asm.entityId] || "Entidad Desconocida";
        
        // B. Buscar qué operador tiene este entityId dentro de su array 'entities'
        const assignedOperator = operatorsList.find(op => 
          op.entities && Array.isArray(op.entities) && op.entities.includes(asm.entityId)
        );
        
        const operatorName = assignedOperator ? assignedOperator.name : "Sin Operador asignado";
        
        // 🔥 AQUÍ AGREGAMOS EL ID DEL OPERADOR 🔥
        const operatorId = assignedOperator ? assignedOperator.id : "sin-operador";

        return {
          ...asm,
          entityName,
          operatorName,
          operatorId, // <--- Este es el nuevo campo vital
          type: typeMap[asm.typeId] || "Virtual", 
          status: statusMap[asm.statusID] || "create", 
        };
      });

      callback(populatedAssemblies);

    } catch (error) {
      console.error("Error cruzando datos de asambleas para el Dashboard:", error);
      callback([]);
    }
  });

  return unsubscribe;
}