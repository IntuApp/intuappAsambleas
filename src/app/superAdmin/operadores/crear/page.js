"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import Loader from "@/components/basics/Loader";
import { createOperator } from "@/lib/operators";
import CustomInput from "@/components/basics/CustomInput";
import { toast } from "react-toastify";

const CrearOperadorPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formDataOperator, setFormDataOperator] = useState({
    email: "",
    password: "",
    name: "",
    nit: "",
    city: "",
    representativeName: "",
    role: "3",
  });

  const [formDataRepresentative, setFormDataRepresentative] = useState({
    nameRepresentative: "",
    emailRepresentative: "",
    phoneRepresentative: "",
  });

  const handleChangeOperator = (e) => {
    setFormDataOperator({
      ...formDataOperator,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeRepresentative = (e) => {
    setFormDataRepresentative({
      ...formDataRepresentative,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Validations - Only required: name, city, email, password
    if (
      !formDataOperator.name ||
      !formDataOperator.city ||
      !formDataOperator.email ||
      !formDataOperator.password
    ) {
      toast.error(
        "Por favor complete los campos obligatorios: Nombre del Operador, Ciudad, Correo y Contraseña"
      );
      setLoading(false);
      return;
    }

    if (formDataOperator.email !== confirmEmail) {
      toast.error("Los correos no coinciden");
      setLoading(false);
      return;
    }

    if (formDataOperator.password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const userDataToRegister = {
        ...formDataOperator,
        representativeName: {
          name: formDataRepresentative.nameRepresentative,
          email: formDataRepresentative.emailRepresentative,
          phone: formDataRepresentative.phoneRepresentative,
        },
      };

      const resUser = await register(userDataToRegister);

      if (!resUser?.success) {
        toast.error(resUser.message || "Error creando operador");
        console.log(resUser);

        setLoading(false);
        return;
      }

      const resRep = await createOperator(formDataRepresentative, resUser.id);

      if (!resRep?.success) {
        toast.error("Operador creado pero falló representante");
        console.log(resRep);

        setLoading(false);
        return;
      }

      toast.success("Operador creado correctamente");
      router.push(`/superAdmin/operadores/${resUser.id}`);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <h1 className="text-[32px] font-bold text-[#0E3C42]">
        Crear Operador logístico
      </h1>

      {/* CARD 1 */}
      <div className="border border-[#D9E3FF] rounded-xl p-8 bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-[#0E3C42] mb-1">
          1. Datos del nuevo operador
        </h2>
        <p className="text-gray-500 mb-6">
          Complete los campos a continuación para registrar un nuevo operador.
        </p>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <CustomInput
            label="Nombre del Operador *"
            name="name"
            placeholder="Escribe aquí el nombre"
            value={formDataOperator.name}
            onChange={handleChangeOperator}
          />

          <CustomInput
            label="NIT"
            name="nit"
            placeholder="Escribe aquí el NIT"
            value={formDataOperator.nit}
            onChange={handleChangeOperator}
          />

          <div>
            <label className="font-medium text-sm">Ciudad *</label>
            <select
              name="city"
              value={formDataOperator.city}
              onChange={handleChangeOperator}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Selecciona aquí tu ciudad</option>
              <option value="Bogotá">Bogotá</option>
              <option value="Medellín">Medellín</option>
              <option value="Cali">Cali</option>
            </select>
          </div>
        </div>

        <p className="font-medium text-sm mb-6">
          Ingrese los datos del representante legal
        </p>

        <div className="grid grid-cols-3 gap-6 mb-10">
          <CustomInput
            label="Nombre del Representante"
            name="nameRepresentative"
            placeholder="Escribe aquí el nombre"
            value={formDataRepresentative.nameRepresentative}
            onChange={(e) =>
              setFormDataRepresentative({
                ...formDataRepresentative,
                nameRepresentative: e.target.value,
              })
            }
          />

          <CustomInput
            label="Correo"
            name="emailRepresentative"
            placeholder="Escribe aquí el correo"
            value={formDataRepresentative.emailRepresentative}
            onChange={handleChangeRepresentative}
          />

          <CustomInput
            label="Número de celular"
            name="phoneRepresentative"
            placeholder="Escribe aquí el número"
            value={formDataRepresentative.phoneRepresentative}
            onChange={handleChangeRepresentative}
          />
        </div>
      </div>

      {/* CARD 2 */}
      <div className="border border-[#D9E3FF] rounded-xl p-8 bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-[#0E3C42] mb-1">
          2. Crear usuario
        </h2>
        <p className="text-gray-500 mb-6">
          Asigne el correo y la contraseña para el ingreso a la plataforma.
        </p>

        <div className="grid grid-cols-2 gap-6 mb-4 pb-5 border-b">
          <CustomInput
            label="Correo *"
            name="email"
            placeholder="Escribe aquí el correo"
            value={formDataOperator.email}
            onChange={handleChangeOperator}
          />

          <CustomInput
            label="Confirmar correo *"
            name="confirmEmail"
            placeholder="Escribe aquí el correo"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <CustomInput
            label="Contraseña *"
            name="password"
            type="password"
            placeholder="Escriba aquí la contraseña"
            value={formDataOperator.password}
            onChange={handleChangeOperator}
          />

          <CustomInput
            label="Confirmar contraseña *"
            name="confirmPassword"
            type="password"
            placeholder="Escriba aquí la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 rounded-full bg-[#6A7EFF] hover:bg-[#5b6ef0] text-white shadow-md"
        >
          Crear Operador
        </button>
      </div>
    </div>
  );
};

export default CrearOperadorPage;
