"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { register } from "@/lib/auth";
import { createOperator } from "@/lib/operators";

import Loader from "@/components/basics/Loader";
import CustomButton from "@/components/basics/CustomButton";
import CustomText from "@/components/basics/CustomText";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

import ConfirmationModal from "@/components/modals/ConfirmationModal";
import SuccessModal from "@/components/modals/SuccessModal";
import OperatorDataBasicStep from "./OperatorBasicDataStep";

export default function CreateOperatorForm({ onCancel, onSuccess }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOperatorId, setCreatedOperatorId] = useState(null);

  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    nit: "",
    city: "",
    email: "",
    password: "",
    representativeName: "",
    representativeEmail: "",
    representativePhone: "",
    role: "3",
  });

  const [formDataRepresentative, setFormDataRepresentative] = useState({
    nameRepresentative: "",
    emailRepresentative: "",
    phoneRepresentative: "",
  });

  const isCreateDisabled =
    loading ||
    !formData.name.trim() ||
    !formData.city ||
    !formData.email.trim() ||
    !formData.password.trim();

  const handleConfirmCreate = async () => {
    setShowConfirmationModal(false);
    await handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (
      !formData.name ||
      !formData.city ||
      !formData.email ||
      !formData.password
    ) {
      toast.error(
        "Por favor complete los campos obligatorios: Nombre del Operador, Ciudad, Correo y Contraseña",
      );
      setLoading(false);
      return;
    }

    if (formData.email !== confirmEmail) {
      toast.error("Los correos no coinciden");
      setLoading(false);
      return;
    }

    if (formData.password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const userDataToRegister = {
        name: formData.name,
        nit: formData.nit,
        city: formData.city,
        email: formData.email,
        password: formData.password,
        role: "3",
        representative: {
          name: formData.representativeName || "",
          email: formData.representativeEmail || "",
          phone: formData.representativePhone || "",
        },
      };

      const resUser = await register(userDataToRegister);

      if (!resUser?.success) {
        toast.error(resUser.message || "Error creando operador");
        setLoading(false);
        return;
      }

      setCreatedOperatorId(resUser.id);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado creando operador");
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="gap-5 flex flex-col h-full">
      <ConfirmationModal
        isOpen={showConfirmationModal}
        confirmText="Si"
        cancelText="Cancelar"
        onConfirm={handleConfirmCreate}
        onClose={() => setShowConfirmationModal(false)}
        title="¿Registrar nuevo operador?"
        message="Podrás modificar su información más adelante."
      />

      {/* MODAL ÉXITO */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="¡Operador creado con éxito!"
        message="El operador ha sido creado correctamente."
        buttonText="Gestionar Operador"
        onConfirm={() => {
          setShowSuccessModal(false);

          if (onSuccess && createdOperatorId) {
            onSuccess({ id: createdOperatorId });
          } else if (createdOperatorId) {
            router.push(`/superAdmin/operadores/${createdOperatorId}`);
          }
        }}
      />

      {/* STEP DE DATOS */}
      <OperatorDataBasicStep
        formDataOperator={formData}
        setFormDataOperator={setFormData}
        confirmEmail={confirmEmail}
        setConfirmEmail={setConfirmEmail}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
      />

      {/* BOTONES */}
      <div className="flex justify-end gap-4 mt-8">
        <CustomButton
          variant="secondary"
          size="L"
          className="px-4 py-2 border-[2px]"
          onClick={onCancel}
        >
          <CustomText variant="labelL" className="font-bold text-[#0E3C42]">
            Cancelar
          </CustomText>
        </CustomButton>

        <CustomButton
          variant="primary"
          className="py-3 px-4 flex gap-2"
          onClick={() => setShowConfirmationModal(true)}
          disabled={isCreateDisabled}
        >
          <CustomIcon path={ICON_PATHS.check} size={24} />
          <CustomText variant="labelL" className="font-bold">
            Crear Operador
          </CustomText>
        </CustomButton>
      </div>
    </div>
  );
}
