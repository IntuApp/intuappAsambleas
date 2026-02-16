"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getEntityById,
  getAssemblyRegistriesList,
  updateEntity,
  deleteEntity,
} from "@/lib/entities";
import { getAssemblyById } from "@/lib/assembly";
import { getEntityTypes } from "@/lib/masterData";

import Loader from "@/components/basics/Loader";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";

import EntityDatabaseManager from "@/components/entities/EntityDatabaseManager";
import EntityAssembliesSection from "@/components/entities/EntityAssembliesSection";
import EntityEditModal from "@/components/entities/EntityEditModal";

import ConfirmationModal from "@/components/modals/ConfirmationModal";
import SuccessModal from "@/components/modals/SuccessModal";

import { ICON_PATHS } from "@/constans/iconPaths";
import { getIconPath, getTypeName } from "@/lib/utils";
import { toast } from "react-toastify";
import { usePageTitle } from "@/context/PageTitleContext";

const EntityDetailPage = () => {
  const { entityId } = useParams();
  const router = useRouter();
  const { setSegmentTitle } = usePageTitle();

  const [loading, setLoading] = useState(true);
  const [entityData, setEntityData] = useState(null);
  const [assemblies, setAssemblies] = useState([]);
  const [registries, setRegistries] = useState([]);
  const [registriesCreatedAt, setRegistriesCreatedAt] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [entityTypes, setEntityTypes] = useState([]);

  // 🔥 modales eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    nit: "",
    type: "",
    city: "",
    address: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
  });

  const fetchEntityData = useCallback(async () => {
    if (!entityId) return;

    setLoading(true);
    const res = await getEntityById(entityId);

    if (!res.success) {
      toast.error("Error cargando entidad");
      router.push(`/operario/entidades`);
      return;
    }

    const data = res.data;
    setEntityData(data);
    setSegmentTitle(entityId, data.name);

    setFormData({
      name: data.name || "",
      nit: data.nit || "",
      type: data.type || "",
      city: data.city || "",
      address: data.address || "",
    });

    if (data.assemblyRegistriesListId) {
      const resList = await getAssemblyRegistriesList(
        data.assemblyRegistriesListId,
      );
      if (resList.success) {
        setRegistries(Object.values(resList.data));
        setRegistriesCreatedAt(resList.createdAt);
      }
    }

    if (Array.isArray(data.lastUpdateOwners)) {
      const results = await Promise.all(
        data.lastUpdateOwners.map((id) => getAssemblyById(id)),
      );
      setAssemblies(results.filter((r) => r.success).map((r) => r.data));
    } else if (data.lastUpdateOwners) {
      const resAssembly = await getAssemblyById(data.lastUpdateOwners);
      if (resAssembly.success) setAssemblies([resAssembly.data]);
    }

    setLoading(false);
  }, [entityId, router, setSegmentTitle]);

  useEffect(() => {
    fetchEntityData();
    getEntityTypes().then((res) => res.success && setEntityTypes(res.data));
  }, [fetchEntityData]);

  const handleSaveEntity = async () => {
    setLoading(true);
    const res = await updateEntity(entityId, formData);

    if (res.success) {
      toast.success("Entidad actualizada correctamente");
      setIsEditModalOpen(false);
      fetchEntityData();
    } else {
      toast.error("Error al actualizar entidad");
    }
    setLoading(false);
  };

  // 🔥 eliminar entidad
  const handleConfirmDeleteEntity = async () => {
    setIsDeleting(true);
    const res = await deleteEntity(entityId);

    if (res.success) {
      setShowDeleteModal(false);
      setShowSuccessModal(true);
    } else {
      toast.error("Error al eliminar entidad");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!entityData) return null;

  return (
    <>
      <div className="flex flex-col w-full max-w-[1128px]">
        <div className="flex flex-col gap-8">
          <EntityEditModal
            isOpen={isEditModalOpen}
            entityForm={formData}
            setEntityForm={setFormData}
            entityTypes={entityTypes}
            loading={loading}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleSaveEntity}
          />

          {!isEditModalOpen && (
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <CustomText
                  variant="TitleL"
                  className="font-bold text-[#0E3C42]"
                >
                  {entityData.name}
                </CustomText>

                <CustomButton
                  variant="primary"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-5 py-3 flex items-center gap-1"
                >
                  <CustomIcon path={ICON_PATHS.delete} size={20} />
                  <CustomText variant="bodyM" className="font-bold">
                    Eliminar Entidad
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
                  <Info label="NIT" value={entityData.nit} />
                  <Info
                    label="Tipo entidad"
                    value={getTypeName(entityData)}
                    icon={
                      <CustomIcon path={getIconPath(entityData)} size={14} />
                    }
                  />
                  <Info label="Asambleístas" value={registries.length} />
                  <Info label="Ciudad" value={entityData.city} />
                  <Info label="Dirección" value={entityData.address} />
                  <Info label="Admin" value={entityData.adminEntity.name} />
                  <Info label="Email" value={entityData.adminEntity.email} />
                  <Info label="Teléfono" value={entityData.adminEntity.phone} />
                </div>
              </div>

              <EntityAssembliesSection
                createAssemblyRoute={() => router.push(`/operario/${entityId}/crear-asamblea`)}
                viewAssemblyRoute={(assemblyId) => router.push(`/operario/${entityId}/${assemblyId}`)}
                entityId={entityId}
                assemblies={assemblies}
              />

              <EntityDatabaseManager
                entityData={entityData}
                registries={registries}
                registriesCreatedAt={registriesCreatedAt}
                onRefresh={fetchEntityData}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL CONFIRMAR */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDeleteEntity}
        entityForm={entityData}
        title="Eliminar entidad"
        message="Esta acción eliminará permanentemente la entidad."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />

      {/* MODAL ÉXITO */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Entidad eliminada"
        message="La entidad fue eliminada correctamente."
        buttonText="Volver a entidades"
        onConfirm={() => router.push("/operario/entidades")}
      />
    </>
  );
};

const Info = ({ label, value, icon }) => (
  <div className="flex flex-col gap-1">
    <CustomText variant="labelM" className="text-gray-500">
      {label}
    </CustomText>
    <div className="flex items-center gap-2 font-bold">
      {icon}
      {value || "-"}
    </div>
  </div>
);

export default EntityDetailPage;
