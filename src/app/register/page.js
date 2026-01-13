"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import { getRoles } from "@/lib/userDetails";
import CustomInput from "@/components/basics/CustomInput";
import CustomButton from "@/components/basics/CustomButton";
import CustomTitle from "@/components/basics/CustomTitle";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    nit: "",
    city: "",
    phone: "",
    role: "",
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      const rolesData = await getRoles();
      setRoles(rolesData);
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.role) {
      toast.warn("Por favor completa los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        toast.success("Usuario registrado exitosamente");
        router.push("/login");
      } else {
        toast.error(
          "Error al registrar usuario: " +
            (result.message || "Error desconocido")
        );
      }
    } catch (error) {
      toast.error("Error al registrar usuario: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <CustomTitle level="h2" className="text-center mb-6">
          Registro de Usuario
        </CustomTitle>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <CustomInput
            label="Nombre Completo"
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
          />

          <CustomInput
            label="NIT / Documento"
            name="nit"
            placeholder="NIT"
            value={formData.nit}
            onChange={handleChange}
          />

          <CustomInput
            label="Ciudad"
            name="city"
            placeholder="Ciudad"
            value={formData.city}
            onChange={handleChange}
          />

          <CustomInput
            label="Teléfono"
            name="phone"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={handleChange}
          />

          <CustomInput
            label="Correo Electrónico"
            type="email"
            name="email"
            placeholder="Correo"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <CustomInput
            label="Contraseña"
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-700">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Seleccione un rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name || role.nombre || role.id}
                </option>
              ))}
            </select>
          </div>

          <CustomButton
            type="submit"
            className="w-full mt-4 bg-[#94A2FF] text-white font-bold py-3 rounded-full hover:bg-[#7e8ce0] transition-colors"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrar"}
          </CustomButton>
        </form>
      </div>
    </div>
  );
}
