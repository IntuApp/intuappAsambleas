"use client";

import { useState, useMemo, useEffect } from "react";
import CustomText from "@/components/basics/CustomText";
import CustomInput from "@/components/basics/CustomInput";
import CustomSelect from "@/components/basics/CustomSelect";
import CustomTimeInput from "@/components/basics/CustomTimeInput";
import CustomOptionSelect from "@/components/basics/CustomOptionSelect";
import CustomMultiSelect from "@/components/basics/CustomMultiSelect";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import { X } from "lucide-react"; // Para el botón de cerrar modal
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import SuccessModal from "@/components/modal/SuccessModal";
import { updateFullAssembly } from "@/lib/assemblyActions"; // Debes crear esta acción
import VoteRestrictionSection from "./VoteRestrictionSection";

export default function AssemblyEditModal({
    isOpen,
    onClose,
    assemblyData, // La data actual de la asamblea
    entityId,
    handleSaveAssembly
}) {
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // ESTADO DEL FORMULARIO INICIALIZADO CON assemblyData
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        hour: "",
        minute: "",
        ampm: "AM",
        type: "Virtual",
        typeId: "2",
        meetLink: "",
        hasWppSupport: false,
        wppPhone: "",
        requireFullName: true,
        requireEmail: false,
        requirePhone: false,
        canAddOtherRepresentatives: true,
        powerLimit: "",
    });

    const [blockedVoters, setBlockedVoters] = useState(new Set());

    // EFECTO PARA CARGAR LOS DATOS CUANDO SE ABRE EL MODAL
    useEffect(() => {
        if (assemblyData && isOpen) {
            // Procesar la hora (ej: "03:30 PM" -> hour: 03, minute: 30, ampm: PM)
            const timeParts = assemblyData.hour?.split(/[: ]/) || ["12", "00", "AM"];

            setFormData({
                ...assemblyData,
                hour: timeParts[0],
                minute: timeParts[1],
                ampm: timeParts[2] || "AM",
            });

            // Cargar votantes bloqueados si vienen en la data (asumimos array 'restrictedVoters')
            if (assemblyData.restrictedVoters) {
                setBlockedVoters(new Set(assemblyData.restrictedVoters));
            }
        }
    }, [assemblyData, isOpen]);

    if (!isOpen) return null;

    const onInputChange = (field, value) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };
            // Sincronizar typeId si cambia el type
            if (field === "type") {
                const mapping = { Presencial: "1", Virtual: "2", Mixta: "3" };
                newData.typeId = mapping[value];
            }
            return newData;
        });
    };

    const onToggleVote = (id) => {
        setBlockedVoters((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.date) return alert("Campos obligatorios faltantes");
        handleSaveAssembly(formData);
        setShowConfirmModal(true);
    };

    const onConfirmSubmit = async () => {
        setSubmitting(true);
        try {
            const fullTimeStr = `${formData.hour || "12"}:${formData.minute || "00"} ${formData.ampm || "AM"}`;

            const dataToUpdate = {
                ...formData,
                hour: fullTimeStr,
            };

            const res = await updateFullAssembly(
                entityId,
                assemblyData.id,
                dataToUpdate,
                Array.from(blockedVoters)
            );

            if (res.success) {
                setShowConfirmModal(false);
                setShowSuccessModal(true);
            }
        } catch (error) {
            alert("Error al actualizar: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="">
            <div className="w-full overflow-y-auto relative flex flex-col gap-4">

                {/* STICKY HEADER */}
                <div className="sticky top-0 z-10 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <CustomText variant="TitleL" className="text-[#0E3C42] font-bold text-2xl">Editar Asamblea</CustomText>
                    </div>
                </div>

                <div className=" flex flex-col gap-8">
                    {/* SECCIÓN 1: DATOS */}
                    <section className="bg-white border border-[#F3F6F9] rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                        <CustomText variant="bodyX" className="text-[#0E3C42] font-bold border-b pb-2">1. Datos Generales</CustomText>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <CustomInput label="Nombre de la asamblea" value={formData.name} onChange={(e) => onInputChange("name", e.target.value)} classLabel="text-[#333333] font-bold" classInput="pl-4 pr-4 py-3 rounded-lg border" />
                            <CustomInput label="Fecha" type="date" value={formData.date} onChange={(e) => onInputChange("date", e.target.value)} classLabel="text-[#333333] font-bold" classInput="pl-4 pr-4 py-3 rounded-lg border" />
                            <CustomTimeInput label="Hora de inicio" value={{ hour: formData.hour, minute: formData.minute, ampm: formData.ampm }}
                                onChange={(val) => { onInputChange("hour", val.hour); onInputChange("minute", val.minute); onInputChange("ampm", val.ampm); }} />
                        </div>
                        <CustomOptionSelect label="Tipo de asamblea" value={formData.type} onChange={(v) => onInputChange("type", v)}
                            options={[{ label: "Presencial", value: "Presencial" }, { label: "Virtual", value: "Virtual" }, { label: "Mixta", value: "Mixta" }]} classContentOptions="flex flex-col md:flex-row" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <CustomInput label="Link" disabled={formData.type === "Presencial"} value={formData.meetLink} onChange={(e) => onInputChange("meetLink", e.target.value)} classLabel="text-[#333333] font-bold" classInput="pl-4 pr-4 py-3 rounded-lg border" />
                            <CustomOptionSelect label="Soporte por WhatsApp" value={formData.hasWppSupport} onChange={(v) => onInputChange("hasWppSupport", v)} options={[{ label: "Sí", value: true }, { label: "No", value: false }]} classContentOptions="flex flex-col md:flex-row" />
                            <CustomInput label="Número WhatsApp" value={formData.wppPhone} onChange={(e) => onInputChange("wppPhone", e.target.value)} classLabel="text-[#333333] font-bold" classInput="pl-4 pr-4 py-3 rounded-lg border" />
                        </div>
                    </section>

                    {/* SECCIÓN 2 & 3: CONFIGURACIÓN Y PODERES (Simplificado en grid) */}
                    <section className="bg-white border border-[#F3F6F9] rounded-3xl p-6 shadow-sm">
                        <CustomText variant="bodyX" className="text-[#0E3C42] font-bold mb-4">2. Configuración de registro</CustomText>
                        <CustomMultiSelect
                            label="Datos requeridos"
                            value={[formData.requireFullName && "name", formData.requireEmail && "email", formData.requirePhone && "phone"].filter(Boolean)}
                            onChange={(v) => { onInputChange("requireFullName", v.includes("name")); onInputChange("requireEmail", v.includes("email")); onInputChange("requirePhone", v.includes("phone")); }}
                            options={[{ label: "Nombre", value: "name" }, { label: "Email", value: "email" }, { label: "Teléfono", value: "phone" }]}
                        />
                    </section>
                    <section className="bg-white border border-[#F3F6F9] rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
                        <div>
                            <CustomText variant="bodyX" className="text-[#0E3C42] font-bold mb-4">3. Poderes</CustomText>
                            <CustomSelect label="Límite de Poderes" value={formData.powerLimit} onChange={(e) => onInputChange("powerLimit", e.target.value)}>
                                <option value="">Sin límite</option>
                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                            </CustomSelect>
                        </div>
                    </section>

                    {/* FOOTER ACCIONES */}
                    <div className="flex justify-end gap-4 pb-4">
                        <CustomButton variant="secondary" onClick={onClose} className="px-8 py-3 rounded-full">
                            Cancelar
                        </CustomButton>
                        <CustomButton variant="primary" onClick={handleSubmit} disabled={submitting} className="px-10 py-3 flex gap-2 rounded-full">
                            <CustomIcon path={ICON_PATHS.check} />
                            Guardar Cambios
                        </CustomButton>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={onConfirmSubmit}
                title="¿Actualizar Asamblea?"
                message="Los cambios se aplicarán de inmediato para todos los asambleístas."
                confirmText="Actualizar"
                isLoading={submitting}
            />

            <SuccessModal
                isOpen={showSuccessModal}
                title="¡Actualizado!"
                message="La asamblea se ha modificado con éxito."
                buttonText="Cerrar"
                onConfirm={() => {
                    setShowSuccessModal(false);
                    onClose();
                }}
            />
        </div>
    );
}