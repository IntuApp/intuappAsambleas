import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getEntityTypes() {
  try {
    const querySnapshot = await getDocs(collection(db, "type-entity"));
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
