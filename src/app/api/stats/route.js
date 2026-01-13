import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";

export async function GET() {
  try {
    // Operators count
    const qOps = query(collection(db, "user"), where("role", "==", "3"));
    const snapshotOps = await getCountFromServer(qOps);
    const operatorsCount = snapshotOps.data().count;

    // Entities count
    const collEnts = collection(db, "entity");
    const snapshotEnts = await getCountFromServer(collEnts);
    const entitiesCount = snapshotEnts.data().count;

    return NextResponse.json({
      operators: operatorsCount,
      entities: entitiesCount,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
