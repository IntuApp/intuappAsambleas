import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const q = query(collection(db, "user"), where("role", "==", "3"));
    const querySnapshot = await getDocs(q);

    const operators = [];
    querySnapshot.forEach((doc) => {
      operators.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(operators);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
