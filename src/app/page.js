"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/basics/CustomButton";
import CustomInput from "@/components/basics/CustomInput";
import CustomText from "@/components/basics/CustomText";
import { loginUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);

  // Estados para manejar la carga y los errores
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setErrorMsg("");
    setIsLoading(true);

    try {
      // Llamamos a la Server Action
      const user = await loginUser(email, password);

      // Redirigimos dependiendo del rol que nos devuelva Firebase
      if (user.role === "1") {
        router.push("/admin");
      } else if (user.role === "3") {
        router.push("/operario");
      }
    } catch (error) {
      setErrorMsg(error.message || "Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    // Aquí iría tu lógica de Firebase para recuperar contraseña
    console.log("Restablecer para:", email);
  };

  return (
    // Contenedor principal: min-h-screen garantiza que ocupe todo el alto, p-4 da respiro en móviles
    <div className="min-h-screen w-full bg-[#F3F6F9] flex justify-center items-center p-4 md:p-8">

      {/* Wrapper central: Se divide en 1 columna en móvil, 2 columnas en lg (pantallas grandes) */}
      <div className="w-full max-w-[1128px] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">

        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="w-full max-w-[455px] flex flex-col gap-8">

          {/* Textos de cabecera */}
          <div className="w-full flex flex-col gap-2">
            <CustomText variant="TitleL" as="h2" className="text-[#0E3C42]">
              {isResetMode ? "Restablecer contraseña" : "Bienvenido"}
            </CustomText>
            <CustomText variant="bodyL" className="font-normal text-gray-600">
              {isResetMode
                ? "Te enviaremos un enlace para restablecer tu contraseña."
                : "Accede a tu cuenta y disfruta de todos nuestros servicios."}
            </CustomText>
          </div>

          {/* Formulario (Usamos la etiqueta <form> para que funcione el botón "Enter" del teclado) */}
          <form className="w-full flex flex-col gap-6" onSubmit={isResetMode ? handleResetPassword : handleLogin}>

            {/* Mensaje de error dinámico */}
            {errorMsg && (
              <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
                {errorMsg}
              </div>
            )}

            <CustomInput
              variant="labelM"
              label="Correo"
              type="email"
              placeholder="Escribe aquí tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              classLabel="font-bold text-[#0E3C42]"
              classInput="bg-[#FFFFFF] rounded-lg border border-[#D3DAE0] px-6 py-4 text-[16px] md:text-[18px] focus:outline-none focus:border-[#94A2FF] transition-colors"
            />

            {!isResetMode && (
              <CustomInput
                variant="labelM"
                label="Contraseña"
                type="password"
                placeholder="Escribe aquí tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                classLabel="font-bold text-[#0E3C42]"
                classInput="bg-[#FFFFFF] rounded-lg border border-[#D3DAE0] px-6 py-4 text-[16px] md:text-[18px] focus:outline-none focus:border-[#94A2FF] transition-colors"
              />
            )}

            <CustomButton
              type="submit"
              className="w-full py-4 px-6 mt-2"
              variant="primary"
              disabled={!email || (!isResetMode && !password) || isLoading}
            >
              <CustomText variant="labelL" className="font-bold">
                {isLoading
                  ? "Cargando..."
                  : (isResetMode ? "Restablecer contraseña" : "Iniciar sesión")}
              </CustomText>
            </CustomButton>
          </form>

          {/* Enlaces inferiores */}
          <div className="flex flex-col items-center gap-2 mt-4">
            <CustomText variant="bodyM" className="text-center text-gray-600">
              {isResetMode
                ? "¿Ya recordaste tu contraseña?"
                : "¿Problemas para iniciar sesión?"}
            </CustomText>

            {isResetMode ? (
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="text-[#4059FF] text-[16px] leading-[24px] font-bold underline hover:text-blue-800 transition-colors"
              >
                Volver al inicio de sesión
              </button>
            ) : (
              <Link
                href="https://wa.me/573005199651"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4059FF] text-[16px] leading-[24px] font-bold underline hover:text-blue-800 transition-colors"
              >
                Contactar Soporte
              </Link>
            )}
          </div>
        </div>

        <div className="hidden lg:flex relative w-full max-w-[552px] h-[600px] justify-center items-center">
          <img
            src="/bg/bg.png"
            alt="Fondo Login"
            className="w-full h-full rounded-[56px] object-cover shadow-xl"
          />
          <div className="absolute flex flex-col items-center text-center gap-4">
            <img
              src="/logos/logoIntuapp/component.png"
              alt="Logo Intuapp"
              className="w-[200px] object-contain"
            />
            <CustomText variant="TitleL" as="h4" className="text-[#0E3C42]">
              Lo complejo hecho simple
            </CustomText>
          </div>
        </div>

      </div>
    </div>
  );
}