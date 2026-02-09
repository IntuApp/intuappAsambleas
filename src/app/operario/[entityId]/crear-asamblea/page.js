"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getEntityById,
  getAssemblyRegistriesList,
  toggleVoteBlock,
} from "@/lib/entities";
import {
  createAssembly,
  getAssemblyById,
  updateAssembly,
} from "@/lib/assembly";

import { toast } from "react-toastify";
import Loader from "@/components/basics/Loader";
import {
  Calendar,
  ChevronRight,
  Home,
  Search,
  AlertTriangle,
  X,
} from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/ui/TopBar";
import CustomText from "@/components/basics/CustomText";
import CustomInput from "@/components/basics/inputs/CustomInput";
import CustomSelect from "@/components/basics/inputs/CustomSelect";
import CustomButton from "@/components/basics/CustomButton";
import CustomTimeInput from "@/components/basics/inputs/CustomTimeInput";
import CustomOptionSelect from "@/components/basics/inputs/CustomOptionSelect";
import CustomMultiSelect from "@/components/basics/inputs/CustomMultiSelect";
import ToggleSwitch from "@/components/basics/ToggleSwitch";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import SuccessModal from "@/components/modals/SuccessModal";
import VoteRestrictionSection from "@/components/assemblies/VoteRestrictionSection";

const CreateAssemblyPage = () => {
  const { id, entityId } = useParams(); // id is operatorId
  const router = useRouter();
  const searchParams = useSearchParams();
  const editAssemblyId = searchParams.get("edit");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [entityName, setEntityName] = useState("");
  const [entity, setEntity] = useState(null);

  // Registries State
  const [registries, setRegistries] = useState([]);
  const [registriesMap, setRegistriesMap] = useState({}); // To keep IDs
  const [blockedVoters, setBlockedVoters] = useState(new Set()); // Set of Registry IDs
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAssemblyId, setCreatedAssemblyId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    hour: "08",
    minute: "00",
    ampm: "AM",
    type: "Virtual",
    meetLink: "",
    hasWppSupport: true,
    wppPhone: "",
    accessMethod: "database_document",
    requireFullName: false,
    requireEmail: true,
    requirePhone: false,
    canAddOtherRepresentatives: true,
    powerLimit: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (entityId) {
        const res = await getEntityById(entityId);
        if (res.success) {
          setEntityName(res.data.name);
          setEntity(res.data);
          // Fetch Registries if available
          if (res.data.assemblyRegistriesListId) {
            const resList = await getAssemblyRegistriesList(
              res.data.assemblyRegistriesListId,
            );
            if (resList.success) {
              setRegistriesMap(resList.data);
              const regArray = Object.entries(resList.data).map(
                ([key, value]) => ({
                  id: key,
                  ...value,
                }),
              );
              setRegistries(regArray);
            }
          }
        }
      }

      // If Editing, fetch assembly data
      if (editAssemblyId) {
        const resAssembly = await getAssemblyById(editAssemblyId);
        if (resAssembly.success) {
          const data = resAssembly.data;

          // Parse time
          let hour = "08";
          let minute = "00";
          let ampm = "AM";

          if (data.hour) {
            const match = data.hour.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
            if (match) {
              hour = match[1].padStart(2, "0");
              minute = match[2];
              ampm = match[3].toUpperCase();
            }
          }

          setFormData({
            name: data.name || "",
            date: data.date || "",
            hour,
            minute,
            ampm,
            type: data.type || "Virtual",
            meetLink: data.meetLink || "",
            hasWppSupport:
              data.hasWppSupport !== undefined ? data.hasWppSupport : true,
            wppPhone: data.wppPhone || "",
            accessMethod: data.accessMethod || "database_document",
            requireFullName: data.requireFullName || false,
            requireEmail:
              data.requireEmail !== undefined ? data.requireEmail : true,
            requirePhone: data.requirePhone || false,
            canAddOtherRepresentatives:
              data.canAddOtherRepresentatives !== undefined
                ? data.canAddOtherRepresentatives
                : true,
            powerLimit: data.powerLimit || "",
          });

          if (data.blockedVoters) {
            setBlockedVoters(new Set(data.blockedVoters));
          }
        } else {
          toast.error("Error al cargar la asamblea para editar");
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [entityId, editAssemblyId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const processAssemblyCreation = async (isModalFlow = false) => {
    setSubmitting(true);

    const assemblyData = {
      name: formData.name,
      date: formData.date,
      hour: `${formData.hour}:${formData.minute} ${formData.ampm}`,
      type: formData.type,
      meetLink: formData.meetLink,
      hasWppSupport: formData.hasWppSupport,
      wppPhone: formData.wppPhone,
      accessMethod: formData.accessMethod,
      requireFullName: formData.requireFullName,
      requireEmail: formData.requireEmail,
      requirePhone: formData.requirePhone,
      canAddOtherRepresentatives: formData.canAddOtherRepresentatives,
      powerLimit: formData.powerLimit,
      blockedVoters: Array.from(blockedVoters), // Save blocked IDs
    };

    if (editAssemblyId) {
      // Get current assembly status
      const currentAssembly = await getAssemblyById(editAssemblyId);

      // If assembly was finished, only reset to 'create' status if date or hour changed
      if (
        currentAssembly.success &&
        currentAssembly.data.status === "finished"
      ) {
        const dateChanged = currentAssembly.data.date !== assemblyData.date;
        const hourChanged = currentAssembly.data.hour !== assemblyData.hour;

        if (dateChanged || hourChanged) {
          assemblyData.status = "create";
        }
      }

      const res = await updateAssembly(editAssemblyId, assemblyData);
      setSubmitting(false);

      if (res.success) {
        if (isModalFlow) {
          setShowSuccessModal(true);
          setShowConfirmModal(false);
          // For edit, we might want to stay or redirect. Following original logic: redirect.
          setCreatedAssemblyId(editAssemblyId);
        } else {
          toast.success("Asamblea actualizada correctamente");
          router.push(`/operario/${entityId}/${editAssemblyId}`);
        }
      } else {
        toast.error("Error al actualizar la asamblea");
      }
    } else {
      const res = await createAssembly(
        {
          ...assemblyData,
          createdAt: new Date().toISOString(),
        },
        entityId,
      );
      setSubmitting(false);

      if (res.success) {
        if (isModalFlow) {
          setCreatedAssemblyId(res.id);
          setShowSuccessModal(true);
          setShowConfirmModal(false);
        } else {
          toast.success("Asamblea creada correctamente");
          router.push(`/operario/${entityId}/${res.id}`);
        }
      } else {
        toast.error("Error al crear la asamblea");
      }
    }
  };

  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.name)
      return toast.error("El nombre de la asamblea es requerido");
    if (!formData.date) return toast.error("La fecha es requerida");
    if (formData.type === "Virtual" && !formData.meetLink)
      return toast.error(
        "El link de videollamada es requerido para asambleas virtuales",
      );

    // Future date validation
    const now = new Date();
    const [year, month, day] = formData.date.split("-").map(Number);
    let hour = parseInt(formData.hour);
    if (formData.ampm === "PM" && hour < 12) hour += 12;
    if (formData.ampm === "AM" && hour === 12) hour = 0;
    const minute = parseInt(formData.minute);

    const assemblyDateTime = new Date(year, month - 1, day, hour, minute);

    if (assemblyDateTime <= now) {
      return toast.error(
        "La fecha y hora de la asamblea debe ser posterior a la actual",
      );
    }

    // Check for blocked voters
    if (blockedVoters.size > 0 && !editAssemblyId) {
      setShowConfirmModal(true);
    } else {
      processAssemblyCreation(false);
    }
  };

  // Pagination Logic
  const filteredRegistries = registries.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchLower),
    );
  });

  const handleToggleVoteBlock = async (registryId, currentBlocked) => {
    const res = await toggleVoteBlock(
      entity?.assemblyRegistriesListId,
      registryId,
      !currentBlocked,
    );
    if (res.success) {
      // Toast removed intentionally as per requirement
      // toast.success(currentBlocked ? "Voto habilitado" : "Voto bloqueado");
      // Actualizar el estado local para que se refleje en la UI inmediatamente
      setRegistries((prev) =>
        prev.map((r) =>
          r.id === registryId ? { ...r, voteBlocked: !currentBlocked } : r,
        ),
      );
      // Sincronizar con el Set de blockedVoters de la asamblea
      setBlockedVoters((prev) => {
        const newSet = new Set(prev);
        if (!currentBlocked) {
          newSet.add(registryId);
        } else {
          newSet.delete(registryId);
        }
        return newSet;
      });
    } else {
      toast.error("Error al actualizar estado");
    }
  };

  const totalPages = Math.ceil(filteredRegistries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegistries.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[1128px]">
      <div className="flex-1 gap-8 flex flex-col">
        <div className="">
          <CustomText
            variant="TitleL"
            as="h3"
            className="text-[#0E3C42] font-bold"
          >
            {editAssemblyId ? "Gestionar" : "Crear"} Asamblea
          </CustomText>
          <CustomText variant="bodyX" className="text-[#0E3C42] font-medium">
            En {entityName}
          </CustomText>
        </div>

        <div className="max-w-[1128px] max-h-[517px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5 shadow-soft">
          <CustomText
            variant="bodyX"
            as="h5"
            className="text-[#0E3C42] font-bold"
          >
            1. Datos Asamblea
          </CustomText>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CustomInput
              label="Nombre de la asamblea"
              variant="labelM"
              className="max-w-[344px] max-h-[80px]"
              classLabel="text-[#333333] font-bold"
              classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Escriba aquí un nombre descriptivo"
            />

            <CustomSelect
              label="Fecha de la asamblea"
              variant="labelM"
              type="date"
              className="max-w-[344px] max-h-[80px] "
              classLabel="text-[#333333] font-bold"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              placeholder="Seleccione la fecha"
            />

            <CustomTimeInput
              label="Hora de inicio"
              required
              value={formData.time}
              onChange={(val) => setFormData({ ...formData, time: val })}
            />
          </div>
          <div className="">
            <CustomOptionSelect
              label="Tipo de asamblea"
              required
              value={formData.type}
              onChange={(v) => handleInputChange("type", v)}
              options={[
                { label: "Presencial", value: "Presencial" },
                { label: "Virtual", value: "Virtual" },
                { label: "Mixta", value: "Mixta" },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CustomInput
              label="Link de videollamada"
              variant="labelM"
              className="max-w-[344px] max-h-[80px]"
              classLabel="text-[#333333] font-bold"
              classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
              value={formData.meetLink}
              onChange={(e) => handleInputChange("meetLink", e.target.value)}
              placeholder="Pega el link de la llamada aquí"
            />
            <CustomOptionSelect
              label="¿Vas a tener Soporte por WhatsApp?"
              required
              value={formData.hasWppSupport}
              onChange={(v) => handleInputChange("hasWppSupport", v)}
              options={[
                { label: "Sí", value: true },
                { label: "No", value: false },
              ]}
            />
            <CustomInput
              label="Número de WhatsApp para Soporte"
              variant="labelM"
              className="max-w-[344px] max-h-[80px]"
              classLabel="text-[#333333] font-bold"
              classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
              value={formData.wppPhone}
              onChange={(e) => handleInputChange("wppPhone", e.target.value)}
              disabled={!formData.hasWppSupport}
              placeholder="Escriba aquí el número para soporte"
            />
          </div>
        </div>

        {/* 2. Configuración de registro */}
        <div className="max-w-[1128px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5 shadow-soft">
          <CustomText
            variant="bodyX"
            as="h5"
            className="text-[#0E3C42] font-bold"
          >
            2. Configuración de registro para asambleístas
          </CustomText>
          <CustomText variant="bodyL" className="text-[#333333] font-regular">
            Defina cómo ingresarán los Asambleístas
          </CustomText>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomOptionSelect
              label="Método de Ingreso"
              required
              value={formData.accessMethod}
              onChange={(v) => handleInputChange("accessMethod", v)}
              options={[
                {
                  label: "Documento de la base de datos",
                  value: "database_document",
                },
              ]}
            />
          </div>

          <div>
            <CustomMultiSelect
              label="Solicitar información adicional"
              optional
              value={formData.extraInfo}
              onChange={(v) => handleInputChange("extraInfo", v)}
              options={[
                { label: "Nombre y apellido", value: "name" },
                { label: "Correo electrónico", value: "email" },
                { label: "Número de teléfono", value: "phone" },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomOptionSelect
              label="¿El asambleísta puede añadir otras representaciones?"
              required
              value={formData.canAddOtherRepresentatives}
              onChange={(v) =>
                handleInputChange("canAddOtherRepresentatives", v)
              }
              options={[
                { label: "Sí", value: true },
                { label: "No", value: false },
              ]}
            />
          </div>
        </div>

        {/* 3. Poderes */}
        <div className="max-w-[1128px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-6 shadow-soft">
          <CustomText
            variant="bodyX"
            as="h5"
            className="text-[#0E3C42] font-bold"
          >
            3. Poderes{" "}
          </CustomText>
          <CustomText variant="bodyL" className="text-[#333333] font-regular">
            Defina el número máximo de poderes que un propietario puede tener.
          </CustomText>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomSelect
              label="Límite de Poderes por Propietario"
              variant="labelM"
              classLabel="text-[#333333] font-bold"
              value={formData.powerLimit}
              onChange={(e) => handleInputChange("powerLimit", e.target.value)}
            >
              <option value="">Sin límite</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </CustomSelect>
          </div>
        </div>

        {/* 4. Restricción de voto */}
        <div className="max-w-[1128px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-6 shadow-soft">
          <VoteRestrictionSection
            registries={registries}
            blockedVoters={blockedVoters}
            onToggleVote={handleToggleVoteBlock}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-8 py-3 rounded-full border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 bg-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 rounded-full bg-[#8B9DFF] hover:bg-[#7a8ce0] text-white font-semibold shadow-md transition disabled:opacity-70 flex items-center gap-2"
          >
            {submitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {editAssemblyId ? "Actualizar" : "Crear"} Asamblea
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => processAssemblyCreation(true)}
        title="Restricción de voto"
        message={`Ha restringido el voto de ${blockedVoters.size} asambleístas. ¿Confirma que esta información es correcta y que cumple el reglamento interno?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        isLoading={submitting}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        title="¡Asamblea creada con éxito!"
        message="La asamblea ha sido creada y configurada correctamente con las restricciones definidas."
        buttonText="Ir a la asamblea"
        onConfirm={() => {
          setShowSuccessModal(false);
          router.push(`/operario/${entityId}/${createdAssemblyId}`);
        }}
      />
    </div>
  );
};

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 3L4.5 8.5L2 6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CreateAssemblyPage;
