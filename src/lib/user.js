import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";

export function listenToOperators(callback) {
  const q = query(collection(db, "user"), where("role", "==", "3"));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    try {
      const operators = await Promise.all(
        snapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          const entitiesIds = userData.entities || []; 

          const populatedEntities = await Promise.all(
            entitiesIds.map(async (entityId) => {
              const entityRef = doc(db, "entity", entityId); 
              const entitySnap = await getDoc(entityRef);
              
              if (!entitySnap.exists()) return null;
              
              const entityData = entitySnap.data();
              let typeName = "Desconocido";

              if (entityData.typeID) { 
                const typeRef = doc(db, "type-entity", String(entityData.typeID));
                const typeSnap = await getDoc(typeRef);
                if (typeSnap.exists()) {
                  typeName = typeSnap.data().name; 
                }
              }

              return {
                id: entityId,
                ...entityData,
                typeName: typeName,
              };
            })
          );

          return {
            id: userDoc.id,
            ...userData,
            entitiesData: populatedEntities.filter((e) => e !== null),
          };
        })
      );

      callback(operators);
    } catch (error) {
      console.error("Error trayendo operadores con sus entidades cruzadas:", error);
    }
  });

  return unsubscribe;
}

export function listenToOperatorById(id, callback) {
  const docRef = doc(db, "user", id);

  const unsubscribe = onSnapshot(docRef, async (docSnap) => {
    if (!docSnap.exists()) {
      callback(null); // Si el operador no existe o fue borrado
      return;
    }

    try {
      const userData = docSnap.data();
      const entitiesIds = userData.entities || [];

      // Poblamos las entidades cruzando con la colección "entity" y "type-entity"
      const populatedEntities = await Promise.all(
        entitiesIds.map(async (entityId) => {
          const entityRef = doc(db, "entity", entityId);
          const entitySnap = await getDoc(entityRef);
          
          if (!entitySnap.exists()) return null;
          
          const entityData = entitySnap.data();
          let typeName = "Desconocido";

          if (entityData.typeID) {
            const typeRef = doc(db, "type-entity", String(entityData.typeID));
            const typeSnap = await getDoc(typeRef);
            if (typeSnap.exists()) {
              typeName = typeSnap.data().name;
            }
          }

          return {
            id: entityId,
            ...entityData,
            typeName,
          };
        })
      );

      callback({
        id: docSnap.id,
        ...userData,
        entitiesData: populatedEntities.filter((e) => e !== null),
      });
    } catch (error) {
      console.error("Error trayendo detalles del operador:", error);
    }
  });

  return unsubscribe;
}
