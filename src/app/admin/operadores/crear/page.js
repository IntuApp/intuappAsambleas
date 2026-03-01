"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomInput from "@/components/basics/CustomInput"; // Ajusta la ruta si es distinta
import CustomSelect from "@/components/basics/CustomSelect"; // Asumo que tienes este componente
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import CustomText from "@/components/basics/CustomText";
import ConfirmationModal from "@/components/modal/ConfirmationModal"; // Ajusta rutas
import SuccessModal from "@/components/modal/SuccessModal"; // Ajusta rutas
import { ICON_PATHS } from "@/constans/iconPaths";
import { colombiaCities } from "@/constans/colombiaCities";
import { createOperator } from "@/lib/userActions"; // Tu server action


const CrearOperadorPage = () => {
    const router = useRouter();
    const mode = "create"; // O lo recibes por props si reutilizas el componente

    // Estados del formulario
    const [formDataOperator, setFormDataOperator] = useState({
        name: "",
        nit: "",
        city: "",
        representativeName: "",
        representativeEmail: "",
        representativePhone: "",
        email: "",
        password: "",
    });

    const [confirmEmail, setConfirmEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Estados de modales y feedback
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdOperatorId, setCreatedOperatorId] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // 1. Validación previa antes de abrir el modal de confirmación
    const handlePreSubmit = () => {
        setErrorMsg("");

        // Validaciones básicas
        if (!formDataOperator.name || !formDataOperator.city || !formDataOperator.email || !formDataOperator.password) {
            setErrorMsg("Por favor, completa los campos obligatorios.");
            return;
        }
        if (formDataOperator.email !== confirmEmail) {
            setErrorMsg("Los correos electrónicos no coinciden.");
            return;
        }
        if (formDataOperator.password !== confirmPassword) {
            setErrorMsg("Las contraseñas no coinciden.");
            return;
        }

        // Si todo está bien, abrimos el modal
        setShowConfirmationModal(true);
    };

    // 2. Ejecución real hacia Firebase tras confirmar
    const handleConfirmCreate = async () => {
        setShowConfirmationModal(false);
        setIsLoading(true);
        setErrorMsg("");

        try {
            // Mapeamos los datos planos a la estructura que espera tu base de datos
            const dataToSend = {
                name: formDataOperator.name,
                nit: formDataOperator.nit,
                city: formDataOperator.city,
                email: formDataOperator.email,
                password: formDataOperator.password,
                representative: {
                    name: formDataOperator.representativeName,
                    email: formDataOperator.representativeEmail,
                    phone: formDataOperator.representativePhone,
                }
            };

            const result = await createOperator(dataToSend);
            
            if (result.success) {
                setCreatedOperatorId(result.id);
                setShowSuccessModal(true); // Mostramos modal de éxito
            }
        } catch (error) {
            setErrorMsg(error.message || "Hubo un error al crear el operador.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <ConfirmationModal
                isOpen={showConfirmationModal}
                confirmText="Sí"
                cancelText="Cancelar"
                onConfirm={handleConfirmCreate}
                onClose={() => setShowConfirmationModal(false)}
                title="¿Registrar nuevo operador?"
                message="Podrás modificar su información más adelante."
            />

            <SuccessModal
                isOpen={showSuccessModal}
                title="¡Operador creado con éxito!"
                message="El operador ha sido creado correctamente."
                buttonText="Gestionar Operador"
                onConfirm={() => router.push(`/admin/operadores/${createdOperatorId}`)} 
            />

            {/* HEADER */}
            <div className="flex flex-col">
                <CustomText variant="TitleX" className="text-[#0E3C42] font-bold">
                    Crear Operador
                </CustomText>
            </div>

            {/* MENSAJE DE ERROR */}
            {errorMsg && (
                <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
                    <CustomText variant="labelL" className="font-bold">{errorMsg}</CustomText>
                </div>
            )}

            {/* SECCIÓN 1: DATOS DEL OPERADOR */}
            <div className="max-h-[517px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5">
                <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">
                    1. Datos del {mode === "edit" ? "operador" : "nuevo operador"}
                </CustomText>

                <CustomText variant="bodyL" className="text-[#333333] font-regular">
                    Complete los campos a continuación para registrar un nuevo operador.
                </CustomText>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <CustomInput
                        label="Nombre del Operador"
                        name="name"
                        placeholder="Escribe aquí el nombre"
                        className="w-full"
                        classLabel="text-[#333333] font-bold"
                        classInput="w-full pl-4 pr-4 py-3 rounded-lg border focus:border-[#94A2FF] outline-none transition-colors"
                        value={formDataOperator.name}
                        onChange={(e) => setFormDataOperator({ ...formDataOperator, name: e.target.value })}
                    />

                    <CustomInput
                        label="NIT"
                        name="nit"
                        placeholder="Escribe aquí el NIT"
                        optional
                        className="w-full"
                        classLabel="text-[#333333] font-bold"
                        classInput="w-full pl-4 pr-4 py-3 rounded-lg border focus:border-[#94A2FF] outline-none transition-colors"
                        value={formDataOperator.nit}
                        onChange={(e) => setFormDataOperator({ ...formDataOperator, nit: e.target.value })}
                    />

                    <CustomSelect
                        label="Ciudad"
                        className="w-full"
                        classLabel="text-[#333333] font-bold"
                        classSelect="text-[#838383] font-normal border-[#D3DAE0] w-full py-3 px-4 rounded-lg focus:border-[#94A2FF] outline-none transition-colors"
                        value={formDataOperator.city}
                        onChange={(e) => setFormDataOperator({ ...formDataOperator, city: e.target.value })}
                    >
                        <option value="">Selecciona aquí tu ciudad</option>
                        {colombiaCities.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </CustomSelect>
                </div>

                <div className="rounded-t border border-[#D3DAE0]"></div>
                
                <CustomText variant="bodyL" className="text-[#333333] font-regular">
                    Ingrese los datos del representante legal o funcionario
                </CustomText>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <CustomInput
                        label="Nombre del Representante"
                        placeholder="Escribe aquí el nombre"
                        optional
                        className="w-full"
                        classLabel="text-[#333333] font-bold"
                        classInput="w-full pl-4 pr-4 py-3 rounded-lg border focus:border-[#94A2FF] outline-none transition-colors"
                        value={formDataOperator.representativeName}
                        onChange={(e) => setFormDataOperator({ ...formDataOperator, representativeName: e.target.value })}
                    />

                    <CustomInput
                        label="Correo"
                        placeholder="Escribe aquí el correo"
                        optional
                        className="w-full"
                        classLabel="text-[#333333] font-bold"
                        classInput="w-full pl-4 pr-4 py-3 rounded-lg border focus:border-[#94A2FF] outline-none transition-colors"
                        value={formDataOperator.representativeEmail}
                        onChange={(e) => setFormDataOperator({ ...formDataOperator, representativeEmail: e.target.value })}
                    />

                    <CustomInput
                        label="Número de celular"
                        placeholder="Escribe aquí el número"
                        optional
                        className="w-full"
                        classLabel="text-[#333333] font-bold"
                        classInput="w-full pl-4 pr-4 py-3 rounded-lg border focus:border-[#94A2FF] outline-none transition-colors"
                        value={formDataOperator.representativePhone}
                        onChange={(e) => setFormDataOperator({ ...formDataOperator, representativePhone: e.target.value })}
                    />
                </div>
            </div>

            {/* SECCIÓN 2: CREDENCIALES DE ACCESO */}
            <div className="w-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5">
                <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">
                    2. {mode === "edit" ? "Credenciales de acceso" : "Crear usuario"}
                </CustomText>

                <CustomText variant="bodyL" className="text-[#333333] font-regular">
                    Asigne el correo y la contraseña para el ingreso a la plataforma.
                </CustomText>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                        label="Correo"
                        placeholder="Escribe aquí el correo"
                        className="w-full"
                        classLabel="text-[#333333] font-bold"
                        classInput="w-full pl-4 pr-4 py-3 rounded-lg border focus:border-[#94A2FF] outline-none transition-colors"
                        value={formDataOperator.email}
                        onChange={(e) => setFormDataOperator({ ...formDataOperator, email: e.target.value })}
                    />

                    <CustomInput
                        label="Confirmar correo"
                        placeholder="Escribe aquí el correo"
                        className="w-full"
                        classLabel="text-[#333333] font-bold"
                        classInput="w-full pl-4 pr-4 py-3 rounded-lg border focus:border-[#94A2FF] outline-none transition-colors"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                    />
                </div>
                
                <div className="rounded-t border border-[#D3DAE0]"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                        label="Contraseña"
                        type="password"
                        placeholder="Escriba aquí la contraseña"
                        className="w-full"
                        classLabel="text-[#333333] font-bold"
                        classInput="w-full pl-4 pr-4 py-3 rounded-lg border focus:border-[#94A2FF] outline-none transition-colors"
                        value={formDataOperator.password}
                        onChange={(e) => setFormDataOperator({ ...formDataOperator, password: e.target.value })}
                    />

                    <CustomInput
                        label="Confirmar contraseña"
                        type="password"
                        placeholder="Escriba aquí la contraseña"
                        className="w-full"
                        classLabel="text-[#333333] font-bold"
                        classInput="w-full pl-4 pr-4 py-3 rounded-lg border focus:border-[#94A2FF] outline-none transition-colors"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex justify-end gap-4 mt-2">
                <CustomButton
                    variant="secondary"
                    className="px-6 py-3 border-[2px] rounded-full"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    <CustomText variant="labelL" className="font-bold text-[#0E3C42]">
                        Cancelar
                    </CustomText>
                </CustomButton>

                <CustomButton
                    variant="primary"
                    className="py-3 px-6 flex items-center justify-center gap-2 rounded-full"
                    onClick={handlePreSubmit}
                    disabled={isLoading}
                >
                    <CustomIcon path={ICON_PATHS.check || "M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"} size={24} color="#00093F" />
                    <CustomText variant="labelL" className="font-bold">
                        {isLoading ? "Creando..." : "Crear Operador"}
                    </CustomText>
                </CustomButton>
            </div>
        </div>
    );
};

export default CrearOperadorPage;