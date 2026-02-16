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
import { validateAssemblyForm, buildHourString } from "@/lib/validacion";

import { toast } from "react-toastify";
import Loader from "@/components/basics/Loader";
import EditAssemblySection from "@/components/sections/EditAssemblySection";

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
    hour: "00",
    minute: "00",
    ampm: "AM",
    type: "",
    meetLink: "",
    hasWppSupport: true,
    wppPhone: "",
    accessMethod: "database_document",
    requireFullName: true,
    requireEmail: false,
    requirePhone: false,
    canAddOtherRepresentatives: false,
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

  useEffect(() => {
    if (formData.type === "Presencial") {
      setFormData((prev) => ({
        ...prev,
        meetLink: "",
      }));
    }
    if (formData.hasWppSupport === false) {
      setFormData((prev) => ({
        ...prev,
        wppPhone: "",
      }));
    }
  }, [formData.type, formData.hasWppSupport]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const processAssemblyCreation = async (isModalFlow = false) => {
    setSubmitting(true);

    const assemblyData = {
      ...formData,
      hour: buildHourString(formData),
      blockedVoters: Array.from(blockedVoters),
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
    const error = validateAssemblyForm(formData);
    if (error) return toast.error(error);

    if (blockedVoters.size > 0 && !editAssemblyId) {
      setShowConfirmModal(true);
    } else {
      processAssemblyCreation(false);
    }
  };

  const handleToggleVoteBlock = async (registryId, currentBlocked) => {
    const res = await toggleVoteBlock(
      entity?.assemblyRegistriesListId,
      registryId,
      !currentBlocked,
    );
    if (res.success) {
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[1128px]">
      <EditAssemblySection
        entityName={entityName}
        mode={editAssemblyId ? "edit" : "create"}
        formData={formData}
        onInputChange={handleInputChange}
        registries={registries}
        blockedVoters={blockedVoters}
        onToggleVote={handleToggleVoteBlock}
        submitting={submitting}
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
        showConfirmModal={showConfirmModal}
        onConfirmSubmit={() => processAssemblyCreation(true)}
        onCloseConfirmModal={() => setShowConfirmModal(false)}
        showSuccessModal={showSuccessModal}
        onSuccessConfirm={() =>
          router.push(`/operario/${entityId}/${createdAssemblyId}`)
        }
      />
    </div>
  );
};

export default CreateAssemblyPage;
