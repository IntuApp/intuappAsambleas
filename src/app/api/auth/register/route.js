import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth-service";

export async function POST(request) {
  try {
    const userData = await request.json();
    const result = await registerUser(userData);
    return NextResponse.json(result);
  } catch (error) {
    let status = 500;
    if (error.message === "El correo ya está registrado") status = 400;

    return NextResponse.json({ error: error.message }, { status });
  }
}
