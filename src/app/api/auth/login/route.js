import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth-service";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const user = await loginUser(email, password);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Login error:", error);

    let status = 500;
    if (error.message === "Usuario no encontrado") status = 404;
    if (error.message === "Contraseña incorrecta") status = 401;
    if (error.message === "Email and password are required") status = 400;

    return NextResponse.json({ error: error.message }, { status });
  }
}
