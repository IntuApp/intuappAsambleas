import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(request, { params }) {
  const { id } = await params; // operatorId

  try {
    const q = query(collection(db, "entity"), where("operatorId", "==", id));
    const querySnapshot = await getDocs(q);

    const entities = [];
    querySnapshot.forEach((doc) => {
      entities.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(entities);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
