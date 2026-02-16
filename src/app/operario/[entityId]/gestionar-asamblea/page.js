"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getEntityById,
  getAssemblyRegistriesList,
  resetAssemblyRegistries,
} from "@/lib/entities";
import { getAssemblyById, updateAssembly } from "@/lib/assembly";
import { resetAllQuestionsAnswers } from "@/lib/questions";
import { deleteAllAssemblyUsers } from "@/lib/assemblyUser";
import { storage } from "@/lib/firebase";
import { ref, listAll, deleteObject } from "firebase/storage";
import { toast } from "react-toastify";
import Loader from "@/components/basics/Loader";
import {
  parseHour,
  buildHourString,
  validateAssemblyForm,
} from "@/lib/validacion";
import EditAssemblySection from "@/components/sections/EditAssemblySection";

export default function ManageAssemblyPage() {
  const { entityId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assemblyId = searchParams.get("assemblyId");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [entityName, setEntityName] = useState("");

  const [registries, setRegistries] = useState([]);
  const [blockedVoters, setBlockedVoters] = useState(new Set());

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

  /* =========================
     Fetch inicial
  ========================= */

  useEffect(() => {
    const fetchData = async () => {
      if (!assemblyId) {
        toast.error("ID de asamblea no proporcionado");
        router.back();
        return;
      }

      const entityRes = await getEntityById(entityId);
      if (entityRes.success) {
        setEntityName(entityRes.data.name);

        if (entityRes.data.assemblyRegistriesListId) {
          const listRes = await getAssemblyRegistriesList(
            entityRes.data.assemblyRegistriesListId,
          );

          if (listRes.success) {
            const regArray = Object.entries(listRes.data).map(
              ([id, value]) => ({ id, ...value }),
            );
            setRegistries(regArray);
          }
        }
      }

      const assemblyRes = await getAssemblyById(assemblyId);
      if (!assemblyRes.success) {
        toast.error("Error cargando asamblea");
        return;
      }

      const data = assemblyRes.data;
      const parsed = parseHour(data.hour);

      setFormData({
        name: data.name || "",
        date: data.date || "",
        ...parsed,
        type: data.type || "Virtual",
        meetLink: data.meetLink || "",
        hasWppSupport: data.hasWppSupport ?? true,
        wppPhone: data.wppPhone || "",
        accessMethod: data.accessMethod || "database_document",
        requireFullName: data.requireFullName ?? false,
        requireEmail: data.requireEmail ?? true,
        requirePhone: data.requirePhone ?? false,
        canAddOtherRepresentatives: data.canAddOtherRepresentatives ?? true,
        powerLimit: data.powerLimit || "",
      });

      if (data.blockedVoters) {
        setBlockedVoters(new Set(data.blockedVoters));
      }

      setLoading(false);
    };

    fetchData();
  }, [entityId, assemblyId, router]);

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

  /* =========================
     Handlers
  ========================= */

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleToggleVote = (id, isBlocked) => {
    setBlockedVoters((prev) => {
      const set = new Set(prev);
      isBlocked ? set.delete(id) : set.add(id);
      return set;
    });
  };

  const handleSubmit = async () => {
    const error = validateAssemblyForm(formData);
    if (error) return toast.error(error);

    setSubmitting(true);

    const newHour = buildHourString(formData);
    const current = await getAssemblyById(assemblyId);
    let status = current.data.status;

    if (
      current.data.status === "finished" &&
      (current.data.date !== formData.date || current.data.hour !== newHour)
    ) {
      status = "create";

      try {
        if (current.data.entityId) {
          const ent = await getEntityById(current.data.entityId);
          if (ent.success && ent.data.assemblyRegistriesListId) {
            await resetAssemblyRegistries(ent.data.assemblyRegistriesListId);
          }
        }

        if (current.data.questions?.length) {
          await resetAllQuestionsAnswers(current.data.questions);
        }

        await deleteAllAssemblyUsers(assemblyId);

        const powersRef = ref(storage, `powers/${assemblyId}`);
        const powersList = await listAll(powersRef);

        await Promise.all(
          powersList.prefixes.map(async (folder) => {
            const files = await listAll(folder);
            return Promise.all(files.items.map((file) => deleteObject(file)));
          }),
        );
      } catch {
        toast.warn("Algunos datos no pudieron resetearse");
      }
    }

    const res = await updateAssembly(assemblyId, {
      ...formData,
      hour: newHour,
      blockedVoters: Array.from(blockedVoters),
      status,
      updatedAt: new Date().toISOString(),
    });

    setSubmitting(false);

    if (res.success) {
      toast.success("Asamblea actualizada");
      router.push(`/operario/${entityId}/${assemblyId}`);
    } else {
      toast.error("Error al actualizar");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <EditAssemblySection
      entityName={entityName}
      mode="edit"
      formData={formData}
      onInputChange={handleInputChange}
      registries={registries}
      blockedVoters={blockedVoters}
      onToggleVote={handleToggleVote}
      submitting={submitting}
      onCancel={() => router.back()}
      onSubmit={handleSubmit}
    />
  );
}
