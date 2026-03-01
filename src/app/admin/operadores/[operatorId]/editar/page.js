"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CustomInput from "@/components/basics/CustomInput"; // Ajusta ruta si es /inputs/CustomInput
import CustomSelect from "@/components/basics/CustomSelect"; // Ajusta ruta
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import CustomText from "@/components/basics/CustomText";
import ConfirmationModal from "@/components/modal/ConfirmationModal"; // Ajusta ruta
import SuccessModal from "@/components/modal/SuccessModal"; // Ajusta ruta
import { ICON_PATHS } from "@/constans/iconPaths";
import { colombiaCities } from "@/constans/colombiaCities";

import { listenToOperatorById } from "@/lib/user";
import { updateOperator } from "@/lib/userActions";

const EditarOperadorPage = () => {
    const router = useRouter();
    const { id } = useParams(); // Extraemos el ID del operador de la URL
    const mode = "edit"; // Forzamos el modo a edición para los textos dinámicos

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

    // Estados de UI y modales
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Cargar datos del operador al montar la página
    useEffect(() => {
        if (!id) return;

        const unsubscribe = listenToOperatorById(id, (data) => {
            if (data) {
                // Poblamos el estado mapeando la estructura de la base de datos a los inputs
                setFormDataOperator({
                    name: data.name || "",
                    nit: data.nit || "",
                    city: data.city || "",
                    email: data.email || "",
                    representativeName: data.representative?.name || "",
                    representativeEmail: data.representative?.email || "",
                    representativePhone: data.representative?.phone || "",
                    password: "", // La dejamos vacía por seguridad
                });
                setConfirmEmail(data.email || "");
            } else {
                setErrorMsg("No se encontró el operador.");
            }
            setIsLoadingData(false);
        });

        return () => unsubscribe();
    }, [id]);

    // Validación antes de abrir el modal
    const handlePreSubmit = () => {
        setErrorMsg("");

        // Validaciones básicas (La contraseña no es obligatoria en edición)
        if (!formDataOperator.name || !formDataOperator.city || !formDataOperator.email) {
            setErrorMsg("Por favor, completa los campos obligatorios.");
            return;
        }
        if (formDataOperator.email !== confirmEmail) {
            setErrorMsg("Los correos electrónicos no coinciden.");
            return;
        }
        
        // Si escribió algo en contraseña, debe coincidir con la confirmación
        if (formDataOperator.password || confirmPassword) {
            if (formDataOperator.password !== confirmPassword) {
                setErrorMsg("Las contraseñas no coinciden.");
                return;
            }
        }

        setShowConfirmationModal(true);
    };

    // Ejecución de la actualización
    const handleConfirmUpdate = async () => {
        setShowConfirmationModal(false);
        setIsLoading(true);
        setErrorMsg("");

        try {
            // Mapeamos los datos para enviarlos con la estructura correcta
            const dataToSend = {
                name: formDataOperator.name,
                nit: formDataOperator.nit,
                city: formDataOperator.city,
                email: formDataOperator.email,
                representative: {
                    name: formDataOperator.representativeName,
                    email: formDataOperator.representativeEmail,
                    phone: formDataOperator.representativePhone,
                }
            };

            // SOLO enviamos la contraseña si el usuario decidió cambiarla
            if (formDataOperator.password.trim() !== "") {
                dataToSend.password = formDataOperator.password;
            }

            // Llamamos a la server action que creamos antes
            const result = await updateOperator(id, dataToSend);
            
            if (result.success) {
                setShowSuccessModal(true);
            }
        } catch (error) {
            setErrorMsg(error.message || "Hubo un error al actualizar el operador.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return <div className="p-8"><CustomText variant="bodyL">Cargando datos del operador...</CustomText></div>;
    }

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* MODALES ACTUALIZADOS PARA EDICIÓN */}
            <ConfirmationModal
                isOpen={showConfirmationModal}
                confirmText="Sí, guardar"
                cancelText="Cancelar"
                onConfirm={handleConfirmUpdate}
                onClose={() => setShowConfirmationModal(false)}
                title="¿Guardar los cambios?"
                message="Se actualizará la información del operador logístico."
            />

            <SuccessModal
                isOpen={showSuccessModal}
                title="¡Actualizado con éxito!"
                message="La información del operador ha sido guardada."
                buttonText="Volver al Perfil"
                onConfirm={() => router.push(`/admin/operadores/${id}`)} 
            />

            {/* HEADER */}
            <div className="flex flex-col">
                <CustomText variant="TitleX" className="text-[#0E3C42] font-bold">
                    Editar Operador
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
                    Modifique los campos a continuación para actualizar el operador.
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
                    Asigne el correo y la contraseña para el ingreso a la plataforma. (Deje la contraseña en blanco para no modificarla).
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
                        label="Nueva Contraseña (Opcional)"
                        type="password"
                        placeholder="Escriba aquí para cambiar"
                        optional
                        className="w-full"
                        classLabel="text-[#333333] font-bold"
                        classInput="w-full pl-4 pr-4 py-3 rounded-lg border focus:border-[#94A2FF] outline-none transition-colors"
                        value={formDataOperator.password}
                        onChange={(e) => setFormDataOperator({ ...formDataOperator, password: e.target.value })}
                    />

                    <CustomInput
                        label="Confirmar nueva contraseña"
                        type="password"
                        placeholder="Escriba aquí la contraseña"
                        optional
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
                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                    </CustomText>
                </CustomButton>
            </div>
        </div>
    );
};

export default EditarOperadorPage;