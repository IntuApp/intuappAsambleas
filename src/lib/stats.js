import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";

export async function getOperatorsCount() {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return 0;
    const data = await res.json();
    return data.operators;
  } catch (error) {
    console.error("Error getting operators count:", error);
    return 0;
  }
}

export async function getEntitiesCount() {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return 0;
    const data = await res.json();
    return data.entities;
  } catch (error) {
    console.error("Error getting entities count:", error);
    return 0;
  }
}
