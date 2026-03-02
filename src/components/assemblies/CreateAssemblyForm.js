"use client";

import { useState, useMemo } from "react";
import CustomText from "@/components/basics/CustomText";
import CustomInput from "@/components/basics/CustomInput";
import CustomSelect from "@/components/basics/CustomSelect";
import CustomTimeInput from "@/components/basics/CustomTimeInput";
import CustomOptionSelect from "@/components/basics/CustomOptionSelect";
import CustomMultiSelect from "@/components/basics/CustomMultiSelect";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import { Search } from "lucide-react";
import ToggleSwitch from "@/components/basics/ToggleSwitch";
import ConfirmationModal from "@/components/modal/ConfirmationModal";
import SuccessModal from "@/components/modal/SuccessModal";
import { createFullAssembly } from "@/lib/assemblyActions";
import VoteRestrictionSection from "./VoteRestrictionSection";
import { useParams, useRouter } from "next/navigation";

export default function CreateAssemblyForm({ entityName, entityId, registries, onCancel, isOperator }) {
    const router = useRouter();
    const { operatorId } = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdId, setCreatedId] = useState("");

    // ESTADO DEL FORMULARIO
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        hour: "00",
        minute: "00",
        ampm: "AM",
        type: "Virtual", // Visual
        typeId: "2",    // DB: 1:Presencial, 2:Virtual, 3:Mixta
        meetLink: "",
        hasWppSupport: false,
        wppPhone: "",
        accessMethod: "database_document",
        requireFullName: true,
        requireEmail: false,
        requirePhone: false,
        canAddOtherRepresentatives: true,
        powerLimit: "",
    });

    // ESTADO DE RESTRICCIONES (Bloqueo de voto)
    const [blockedVoters, setBlockedVoters] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState(""); // "" | "blocked" | "unblocked"
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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
        if (!id) return;
        setBlockedVoters((prev) => {
            const next = new Set(prev); // Indispensable crear una nueva instancia
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Lógica de filtrado para la tabla de restricciones
    const filteredRegistries = useMemo(() => {
        return registries.filter((item) => {
            const matchesSearch =
                item.propiedad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.grupo?.toLowerCase().includes(searchTerm.toLowerCase());

            const isItemBlocked = blockedVoters.has(item.id);
            const matchesFilter =
                !filterType ||
                (filterType === "blocked" && isItemBlocked) ||
                (filterType === "unblocked" && !isItemBlocked);

            return matchesSearch && matchesFilter;
        });
    }, [registries, searchTerm, filterType, blockedVoters]);

    const totalPages = Math.ceil(filteredRegistries.length / itemsPerPage);
    const currentItems = filteredRegistries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSubmit = () => {
        if (!formData.name || !formData.date) return alert("Complete los campos obligatorios");
        setShowConfirmModal(true);
    };

    const onConfirmSubmit = async () => {
        setSubmitting(true);
        try {
            // Formateamos la hora en un solo string: "HH:mm AM/PM"
            const fullTimeStr = `${formData.hour}:${formData.minute} ${formData.ampm}`;

            // Enviamos los datos con la hora ya formateada
            const dataWithFormattedTime = {
                ...formData,
                hour: fullTimeStr
            };

            const res = await createFullAssembly(entityId, dataWithFormattedTime, Array.from(blockedVoters));

            if (res.success) {
                setCreatedId(res.assemblyId);
                setShowConfirmModal(false);
                setShowSuccessModal(true);
            }
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col w-full gap-5 pb-6">
            {/* HEADER */}
            <div>
                <CustomText variant="TitleL" as="h3" className="text-[#0E3C42] font-bold">Crear Asamblea</CustomText>
                <CustomText variant="bodyX" className="text-[#0E3C42] font-medium">En {entityName}</CustomText>
            </div>

            {/* 1. DATOS ASAMBLEA */}
            <div className="w-full bg-white border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5 shadow-sm">
                <CustomText variant="bodyX" as="h5" className="text-[#0E3C42] font-bold">1. Datos Asamblea</CustomText>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CustomInput label="Nombre de la asamblea" value={formData.name} onChange={(e) => onInputChange("name", e.target.value)} placeholder="Ej. Asamblea Ordinaria 2026" classLabel="text-[#333333] font-bold" classInput="pl-4 pr-4 py-3 rounded-lg border" />
                    <CustomInput label="Fecha" type="date" value={formData.date} onChange={(e) => onInputChange("date", e.target.value)} classLabel="text-[#333333] font-bold" classInput="pl-4 pr-4 py-3 rounded-lg border" />
                    <CustomTimeInput label="Hora de inicio" value={{ hour: formData.hour, minute: formData.minute, ampm: formData.ampm }}
                        onChange={(val) => { onInputChange("hour", val.hour); onInputChange("minute", val.minute); onInputChange("ampm", val.ampm); }} />
                </div>
                <CustomOptionSelect label="Tipo de asamblea" value={formData.type} onChange={(v) => onInputChange("type", v)}
                    options={[{ label: "Presencial", value: "Presencial" }, { label: "Virtual", value: "Virtual" }, { label: "Mixta", value: "Mixta" }]} classContentOptions="flex flex-col md:flex-row" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CustomInput label="Link de videollamada" disabled={formData.type === "Presencial"} value={formData.meetLink} onChange={(e) => onInputChange("meetLink", e.target.value)} classLabel="text-[#333333] font-bold" classInput="pl-4 pr-4 py-3 rounded-lg border" />
                    <CustomOptionSelect label="Soporte por WhatsApp" value={formData.hasWppSupport} onChange={(v) => onInputChange("hasWppSupport", v)} options={[{ label: "Sí", value: true }, { label: "No", value: false }]} classContentOptions="flex flex-col md:flex-row" />
                    <CustomInput label="Número de WhatsApp" disabled={!formData.hasWppSupport} value={formData.wppPhone} onChange={(e) => onInputChange("wppPhone", e.target.value)} classLabel="text-[#333333] font-bold" classInput="pl-4 pr-4 py-3 rounded-lg border" />
                </div>
            </div>

            {/* 2. CONFIGURACIÓN REGISTRO */}
            <div className="w-full bg-white border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5 shadow-sm">
                <CustomText variant="bodyX" as="h5" className="text-[#0E3C42] font-bold">2. Configuración de registro</CustomText>
                <CustomMultiSelect label="Solicitar información adicional" value={[formData.requireFullName && "name", formData.requireEmail && "email", formData.requirePhone && "phone"].filter(Boolean)}
                    onChange={(v) => { onInputChange("requireFullName", v.includes("name")); onInputChange("requireEmail", v.includes("email")); onInputChange("requirePhone", v.includes("phone")); }}
                    options={[{ label: "Nombre completo", value: "name" }, { label: "Email", value: "email" }, { label: "Teléfono", value: "phone" }]} />
                <CustomOptionSelect label="¿Puede añadir otras representaciones?" value={formData.canAddOtherRepresentatives} onChange={(v) => onInputChange("canAddOtherRepresentatives", v)} options={[{ label: "Sí", value: true }, { label: "No", value: false }]} classContentOptions="grid grid-cols-3 md:flex-row" />
            </div>

            {/* 3. PODERES */}
            <div className="w-full bg-white border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5 shadow-sm">
                <CustomText variant="bodyX" as="h5" className="text-[#0E3C42] font-bold">3. Poderes</CustomText>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CustomSelect label="Límite de Poderes" value={formData.powerLimit} onChange={(e) => onInputChange("powerLimit", e.target.value)} classLabel="text-[#000000] font-bold" >
                        <option value="" className="text-[#333333]">Sin límite</option><option value="1" className="text-[#333333] ">1</option><option value="2" className="text-[#333333] ">2</option><option value="3" className="text-[#333333] ">3</option><option value="4" className="text-[#333333] ">4</option><option value="5" className="text-[#333333] ">5</option><option value="6" className="text-[#333333] ">6</option><option value="7" className="text-[#333333] ">7</option><option value="8" className="text-[#333333] ">8</option><option value="9" className="text-[#333333] ">9</option><option value="10" className="text-[#333333] ">10</option>
                    </CustomSelect>
                </div>
            </div>

            {/* 4. RESTRICCIÓN DE VOTO */}
            <VoteRestrictionSection
                registries={registries}
                blockedVoters={blockedVoters}
                onToggleVote={onToggleVote}
            />

            {/* BOTONES ACCIÓN */}
            <div className="flex justify-end gap-4 mt-5">
                <CustomButton variant="secondary" onClick={onCancel} className="px-8 py-3 rounded-full">
                    <CustomText variant="bodyM" as="span" className="text-[#0E3C42] font-bold">Cancelar</CustomText>
                </CustomButton>
                <CustomButton variant="primary" onClick={handleSubmit} disabled={submitting} className="px-6 py-3 flex gap-2">
                    <CustomIcon path={ICON_PATHS.check} />
                    <CustomText variant="bodyM" as="span" className="text-[#0E3C42] font-bold">Crear Asamblea</CustomText>
                </CustomButton>
            </div>

            <ConfirmationModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={onConfirmSubmit} title="Confirmar Restricciones"
                message={`¿Confirma el bloqueo de ${blockedVoters.size} asambleístas para esta asamblea?`} confirmText="Confirmar" isLoading={submitting} />
            <SuccessModal isOpen={showSuccessModal} title="¡Éxito!" message="Asamblea configurada correctamente." buttonText="Ver Asamblea"
                onConfirm={() => router.push(isOperator ? `/operario/${entityId}/${createdId}` : `/admin/operadores/${operatorId}/${entityId}/${createdId}`)} />
        </div>
    );
}