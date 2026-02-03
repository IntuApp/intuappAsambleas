"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { login, useAuth, resetPassword } from "@/lib/auth";

import CustomInput from "@/components/basics/CustomInput";
import CustomButton from "@/components/basics/CustomButton";
import CustomTitle from "@/components/basics/CustomTitle";
import CustomText from "@/components/basics/CustomText";
import { getUserRole } from "@/lib/userDetails";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    if (user) {
      (async () => {
        const role = user.role || (await getUserRole({ uid: user.uid }));
        if (role === "1") {
          router.push("/superAdmin");
        } else if (role === "2") {
          router.push("/administrador");
        } else if (role === "3") {
          router.push("/operario");
        } else {
          router.push("/");
        }
      })();
    }
  }, [user, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.warn("Por favor ingresa tu correo electrónico y contraseña.");
      return;
    }

    try {
      const userSession = await login(email, password);
      const role = userSession.role;
      if (role === "1") {
        router.push("/superAdmin");
      } else if (role === "2") {
        router.push("/administrador");
      } else if (role === "3") {
        router.push("/operario");
      } else {
        router.push("/");
      }
    } catch (error) {
      toast.error("Correo o contraseña incorrectos.");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.warn("Por favor ingresa tu correo electrónico.");
      return;
    }

    try {
      await resetPassword(email);
      toast.success("¡Correo de restablecimiento enviado!");
      setIsResetMode(false);
    } catch (error) {
      toast.error("Error al enviar el correo. Verifica el correo ingresado.");
    }
  };

  return (
    <div
      id="login-container"
      className="bg-[#F3F6F9] w-full h-screen flex justify-center items-center"
    >
      <div className="flex justify-center items-center max-w-[1128px] w-full max-h-[698px] h-full">
        <div className="flex justify-center items-center max-w-[552px] max-h-[698px] w-full h-full">
          <div className="flex flex-col justify-center items-start max-w-[455px] max-h-[480px] w-full h-full gap-8">
            <div className="w-full max-h-[80px] h-full ">
              <CustomTitle as="h2" className="text-[#0E3C42] mb-2">
                {isResetMode ? "Restablecer contraseña" : "Bienvenido"}
              </CustomTitle>

              <CustomText variant="bodyL" className="font-normal">
                {isResetMode
                  ? "Te enviaremos un enlace para restablecer tu contraseña."
                  : "Accede a tu cuenta y disfruta de todos nuestros servicios."}
              </CustomText>
            </div>

            <div className="w-full">
              <div className="flex flex-col gap-6">
                <CustomInput
                  variant="labelM"
                  label="Correo"
                  type="email"
                  placeholder="Escribe aquí tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full gap-2"
                  classLabel="font-bold"
                  classInput="bg-[#FFFFFF] rounded-lg border border-[#D3DAE0] px-6 py-5 text-[18px]"
                />

                {!isResetMode && (
                  <CustomInput
                    variant="labelM"
                    label="Contraseña"
                    type="password"
                    placeholder="Escribe aquí tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full gap-2"
                    classLabel="font-bold"
                    classInput="bg-[#FFFFFF] rounded-lg border border-[#D3DAE0] px-6 py-5 text-[18px]"
                  />
                )}

                <CustomButton
                  className={`w-full gap-2 py-4 px-6 border-[2px]`}
                  onClick={isResetMode ? handleResetPassword : handleLogin}
                  variant="primary"
                  disabled={!email || !password}
                >
                  <CustomText variant="labelL" className="font-bold">
                    {isResetMode ? "Restablecer contraseña" : "Iniciar sesión"}
                  </CustomText>
                </CustomButton>
              </div>
            </div>
            <div className="flex justify-center items-center w-full">
              <div className="max-w-[228px] max-h-[56px] w-full md:max-w-[328px] md:max-h-[46px] w-full ">
                <CustomText variant="bodyM" className=" text-center">
                  {isResetMode
                    ? "¿Ya recordaste tu contraseña?"
                    : "¿Problemas para iniciar sesión?"}
                </CustomText>

                <div className="max-w-[228px] max-h-[56px] w-full md:max-w-[328px] md:max-h-[46px] flex justify-around">
                  {isResetMode ? (
                    <Link
                      href="#"
                      onClick={() => setIsResetMode(false)}
                      className="text-[#4059FF] text-[16px] leading-[24px] font-bold underline"
                    >
                      Volver al inicio de sesión
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="https://wa.me/573005199651"
                        className="text-[#4059FF] text-[16px] leading-[24px] font-bold underline"
                      >
                        Contactar Soporte
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full h-full flex justify-center items-center max-w-[552px] max-h-[598px] md:max-w-[552px] md:max-h-[650px]">
          <img
            src="/bg/bg.png"
            alt="Login"
            className="w-full h-full rounded-[56px] object-cover"
          />
          <div className="absolute flex flex-col text-center w-[401px] h-[64px] w-full h-full md:w-[501px] md:h-[74px]">
            <img
              src="/logos/logo-intuapp/component.png"
              alt="Logo"
              className="w-full h-[75px]"
            />
            <CustomTitle as="h4" className="text-[#0E3C42] mb-2">
              Lo complejo hecho simple
            </CustomTitle>
          </div>
        </div>
      </div>
    </div>
  );
}
