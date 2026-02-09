"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import AssemblySearchBar from "@/components/searchBar/AssemblySearch";
import CustomStates from "../basics/CustomStates";

import ConfirmationModal from "@/components/modals/ConfirmationModal";
import SuccessModal from "@/components/modals/SuccessModal";

import { ICON_PATHS } from "@/constans/iconPaths";
import { deleteAssembly } from "@/lib/assembly";
import CustomTypeAssembly from "../basics/CustomTypeAssembly";

const EntityAssembliesSection = ({ entityId, assemblies }) => {
  const router = useRouter();

  const [localAssemblies, setLocalAssemblies] = useState(assemblies);

  // filtros
  const [assemblySearchTerm, setAssemblySearchTerm] = useState("");
  const [assemblyTypeFilter, setAssemblyTypeFilter] = useState("");
  const [assemblyStatusFilter, setAssemblyStatusFilter] = useState("");
  const [assemblySort, setAssemblySort] = useState("");

  // modales
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setLocalAssemblies(assemblies);
  }, [assemblies]);

  const filteredAssemblies = useMemo(() => {
    let result = [...localAssemblies];

    if (assemblySearchTerm) {
      result = result.filter((a) =>
        a.name?.toLowerCase().includes(assemblySearchTerm.toLowerCase()),
      );
    }

    if (assemblyTypeFilter) {
      result = result.filter((a) => a.type === assemblyTypeFilter);
    }

    if (assemblyStatusFilter) {
      result = result.filter((a) => a.status === assemblyStatusFilter);
    }

    if (assemblySort === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (assemblySort === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (assemblySort === "recent") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [
    localAssemblies,
    assemblySearchTerm,
    assemblyTypeFilter,
    assemblyStatusFilter,
    assemblySort,
  ]);

  // abrir modal confirmación
  const handleOpenDeleteModal = (assembly) => {
    setSelectedAssembly(assembly);
    setShowConfirmModal(true);
  };

  // eliminar definitivamente
  const handleConfirmDelete = async () => {
    if (!selectedAssembly) return;

    setIsDeleting(true);

    const result = await deleteAssembly(selectedAssembly.id);

    if (result.success) {
      setLocalAssemblies((prev) =>
        prev.filter((a) => a.id !== selectedAssembly.id),
      );
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } else {
      alert("Error al eliminar la asamblea: " + result.error);
    }

    setIsDeleting(false);
  };

  return (
    <>
      <div className="bg-[#FFFFFF] max-w-[1128px] rounded-3xl border border-[#F3F6F9] p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <CustomText
            variant="bodyX"
            as="h5"
            className="font-bold text-[#0E3C42]"
          >
            Asambleas
          </CustomText>

          <CustomButton
            variant="primary"
            onClick={() => router.push(`/operario/${entityId}/crear-asamblea`)}
            className="flex items-center gap-1 px-4 py-2"
          >
            <CustomIcon path={ICON_PATHS.add} size={20} />
            <CustomText variant="bodyM" className="font-bold">
              Crear asamblea
            </CustomText>
          </CustomButton>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <AssemblySearchBar
            searchTerm={assemblySearchTerm}
            onSearchChange={setAssemblySearchTerm}
            typeFilter={assemblyTypeFilter}
            onTypeChange={setAssemblyTypeFilter}
            statusFilter={assemblyStatusFilter}
            onStatusChange={setAssemblyStatusFilter}
            sortBy={assemblySort}
            onSortChange={setAssemblySort}
          />
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-6 font-bold">Nombre</th>
                <th className="py-4 px-6 font-bold">Fecha</th>
                <th className="py-4 px-6 font-bold">Hora</th>
                <th className="py-4 px-6 font-bold text-center">Tipo</th>
                <th className="py-4 px-6 font-bold text-center">Estado</th>
                <th className="py-4 px-6 font-bold text-center">Acción</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssemblies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    No hay asambleas creadas aún.
                  </td>
                </tr>
              ) : (
                filteredAssemblies.map((assembly) => (
                  <tr key={assembly.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">{assembly.name}</td>
                    <td className="py-4 px-6">{assembly.date || "-"}</td>
                    <td className="py-4 px-6">{assembly.hour || "-"}</td>
                    <td className="py-4 px-6 text-center">
                      <CustomTypeAssembly
                        type={assembly.type}
                        className="justify-center bg-transparent border border-[#DBE2E8]"
                      />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <CustomStates
                        status={assembly.status}
                        className="px-3 py-1 rounded-full"
                      />
                    </td>
                    <td className="py-4 px-6 flex justify-center gap-2">
                      <CustomButton
                        variant="primary"
                        onClick={() =>
                          router.push(`/operario/${entityId}/${assembly.id}`)
                        }
                        className="p-2"
                      >
                        <CustomIcon path={ICON_PATHS.eye} size={22} />
                      </CustomButton>

                      <CustomButton
                        variant="secondary"
                        onClick={() => handleOpenDeleteModal(assembly)}
                        className="p-2"
                      >
                        <CustomIcon path={ICON_PATHS.delete} size={22} />
                      </CustomButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CONFIRMACIÓN */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        entityForm={selectedAssembly}
        title="Eliminar asamblea"
        message="Esta acción eliminará permanentemente la asamblea."
        confirmText="Eliminar"
        isLoading={isDeleting}
      />

      {/* MODAL ÉXITO */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Asamblea eliminada"
        message="La asamblea fue eliminada correctamente."
        buttonText="Aceptar"
        onConfirm={() => {
          setShowSuccessModal(false);
          router.refresh();
        }}
      />
    </>
  );
};

export default EntityAssembliesSection;
