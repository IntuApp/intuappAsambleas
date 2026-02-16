"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getOperatorById,
  updateOperator,
  deleteOperator,
} from "@/lib/operators";

import { getAssemblyRegistriesList, getEntitiesByOperator } from "@/lib/entities";
import { getEntityTypes } from "@/lib/masterData";

import Loader from "@/components/basics/Loader";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import EntitiesList from "@/components/entities/EntitiesList";
import OperatorEditModal from "@/components/operators/OperatorEditModal";

import ConfirmationModal from "@/components/modals/ConfirmationModal";
import SuccessModal from "@/components/modals/SuccessModal";

import { ICON_PATHS } from "@/constans/iconPaths";
import { toast } from "react-toastify";
import { usePageTitle } from "@/context/PageTitleContext";
import { getAllAssemblies } from "@/lib/assembly";

const OperatorDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { setSegmentTitle } = usePageTitle();

  const [loading, setLoading] = useState(true);
  const [operatorData, setOperatorData] = useState(null);
  const [entities, setEntities] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🔥 ÚNICO estado de formulario
  const [formData, setFormData] = useState({
    name: "",
    nit: "",
    city: "",
    email: "",
    password: "",
    representativeName: "",
    representativeEmail: "",
    representativePhone: "",
  });

  /* ======================================================
     FETCH OPERATOR
  ====================================================== */

  const fetchOperatorData = useCallback(async () => {
    if (!id) return;

    setLoading(true);

    const res = await getOperatorById(id);

    console.log(res.data);

    if (!res.success) {
      toast.error("Error cargando operador");
      router.push("/superAdmin/operadores");
      return;
    }

    const data = res.data;
    setOperatorData(data);
    setSegmentTitle(id, data.name);

    setFormData({
      name: data.name || "",
      nit: data.nit || "",
      city: data.city || "",
      email: data.email || "",
      password: "",
      representativeName: data.representative?.name || "",
      representativeEmail: data.representative?.email || "",
      representativePhone: data.representative?.phone || "",
    });

    const resEntities = await getEntitiesByOperator(res.data.id);

    if (resEntities.success) {
      const rawEntities = resEntities.data;

      // 🔥 Traer todas las asambleas
      const assemblyRes = await getAllAssemblies();
      const allAssemblies = assemblyRes.success ? assemblyRes.data : [];

      const enrichedEntities = await Promise.all(
        rawEntities.map(async (e) => {
          // Filtrar asambleas de esta entidad
          const entityAssemblies = allAssemblies.filter(
            (a) => a.entityId === e.id,
          );

          // 🔵 Asamblea activa
          const activeAssembly = entityAssemblies.find(
            (a) => a.status === "started",
          );

          // 🟡 Próxima asamblea (no finalizada ni iniciada)
          const futureAssemblies = entityAssemblies
            .filter((a) => a.status !== "finished" && a.status !== "started")
            .sort((a, b) => new Date(a.date) - new Date(b.date));

          const nextAssembly = futureAssemblies[0] || null;

          // 🔢 Conteo de asambleistas
          let asambleistasCount = 0;

          if (e.assemblyRegistriesListId) {
            const listRes = await getAssemblyRegistriesList(
              e.assemblyRegistriesListId,
            );

            if (listRes.success && listRes.data) {
              asambleistasCount = Object.keys(listRes.data).length;
            }
          }

          return {
            ...e,
            asambleistasCount,
            nextAssembly: nextAssembly
              ? {
                  date: nextAssembly.date,
                  time: nextAssembly.hour,
                }
              : null,
            activeAssembly: activeAssembly
              ? {
                  name: activeAssembly.name,
                  startedAgo: "",
                  id: activeAssembly.id,
                }
              : null,
            hasAssemblies: entityAssemblies.length > 0,
          };
        }),
      );

      setEntities(enrichedEntities);
    }

    setLoading(false);
  }, [id, router, setSegmentTitle]);

  useEffect(() => {
    fetchOperatorData();
    getEntityTypes().then((res) => {
      if (res.success) setEntityTypes(res.data);
    });
  }, [fetchOperatorData]);

  /* ======================================================
     UPDATE OPERATOR
  ====================================================== */

  const handleSaveOperator = async () => {
    setLoading(true);

    const updatedData = {
      name: formData.name,
      nit: formData.nit,
      city: formData.city,
      email: formData.email,
      representative: {
        name: formData.representativeName,
        email: formData.representativeEmail,
        phone: formData.representativePhone,
      },
    };

    if (formData.password) {
      updatedData.password = formData.password;
    }

    const res = await updateOperator(id, updatedData);

    if (res.success) {
      toast.success("Operador actualizado correctamente");
      setIsEditModalOpen(false);
      fetchOperatorData();
    } else {
      toast.error("Error al actualizar operador");
    }

    setLoading(false);
  };

  /* ======================================================
     DELETE OPERATOR
  ====================================================== */

  const handleConfirmDeleteOperator = async () => {
    setIsDeleting(true);

    const res = await deleteOperator(id);

    if (res.success) {
      setShowDeleteModal(false);
      setShowSuccessModal(true);
    } else {
      toast.error("Error al eliminar operador");
      setIsDeleting(false);
    }
  };

  /* ======================================================
     RENDER
  ====================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!operatorData) return null;

  return (
    <>
      <div className="flex flex-col w-full max-w-[1128px]">
        <div className="flex flex-col gap-8">
          <OperatorEditModal
            isOpen={isEditModalOpen}
            formData={formData}
            setFormData={setFormData}
            confirmEmail={confirmEmail}
            setConfirmEmail={setConfirmEmail}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            loading={loading}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleSaveOperator}
          />

          {!isEditModalOpen && (
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <CustomText
                  variant="TitleL"
                  className="font-bold text-[#0E3C42]"
                >
                  {operatorData.name}
                </CustomText>

                <CustomButton
                  variant="primary"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-5 py-3 flex items-center gap-1"
                >
                  <CustomIcon path={ICON_PATHS.delete} size={20} />
                  <CustomText variant="bodyM" className="font-bold">
                    Eliminar Operador
                  </CustomText>
                </CustomButton>
              </div>

              <div className="bg-white rounded-3xl border p-8">
                <div className="flex justify-between mb-6">
                  <CustomText variant="bodyX" className="font-bold">
                    Información General
                  </CustomText>

                  <CustomButton
                    variant="primary"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-1 px-4 py-2"
                  >
                    <CustomIcon path={ICON_PATHS.pencil} size={20} />
                    <CustomText variant="labelL" className="font-bold">
                      Editar información
                    </CustomText>
                  </CustomButton>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <Info label="NIT" value={operatorData.nit} />
                  <Info label="Ciudad" value={operatorData.city} />
                  <Info label="Correo" value={operatorData.email} />
                  <Info
                    label="Representante"
                    value={operatorData.representative?.name}
                  />
                  <Info
                    label="Correo representante"
                    value={operatorData.representative?.email}
                  />
                  <Info
                    label="Celular representante"
                    value={operatorData.representative?.phone}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <CustomText
                    variant="TitleX"
                    className="text-[#0E3C42] font-bold"
                  >
                    Entidades
                  </CustomText>
                  <CustomButton
                    variant="primary"
                    className="py-3 px-4 flex gap-2"
                    onClick={() =>
                      router.push(`/superAdmin/operadores/${id}/crear-entidad`)
                    }
                  >
                    <CustomIcon path={ICON_PATHS.add} size={24} />
                    <CustomText variant="labelL" className="font-bold">
                      Crear Entidad
                    </CustomText>
                  </CustomButton>
                </div>

                <EntitiesList
                  entities={entities}
                  onManageEntity={(entity) =>
                    router.push(`/superAdmin/operadores/${id}/${entity.id}`)
                  }
                  onCreateAssembly={(e) =>
                    router.push(
                      `/superAdmin/operadores/${id}/${e.id}/crear-asamblea`,
                    )
                  }
                  onViewAssembly={(e) =>
                    router.push(
                      `/superAdmin/operadores/${id}/${e.id}/${e.activeAssembly.id}`,
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDeleteOperator}
        entityForm={operatorData}
        title="Eliminar operador"
        message="Esta acción eliminará permanentemente el operador."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        title="Operador eliminado"
        message="El operador fue eliminado correctamente."
        buttonText="Volver a operadores"
        onConfirm={() => router.push("/superAdmin/operadores")}
      />
    </>
  );
};

const Info = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <CustomText variant="labelM" className="text-gray-500">
      {label}
    </CustomText>
    <div className="font-bold">{value || "-"}</div>
  </div>
);

export default OperatorDetailPage;
