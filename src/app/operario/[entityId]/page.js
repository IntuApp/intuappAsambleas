"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getEntityById,
  getAssemblyRegistriesList,
  updateEntity,
  deleteEntity,
} from "@/lib/entities";
import { getEntityTypes } from "@/lib/masterData";
import { colombiaCities } from "@/lib/colombiaCities";
import Loader from "@/components/basics/Loader";
import { toast } from "react-toastify";
import TopBar from "@/components/ui/TopBar";
import { usePageTitle } from "@/context/PageTitleContext";
import {
  Building2,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Download,
  Bot,
  Check,
  X,
  Save,
  MapPin,
  Settings,
  Users,
  Plus,
  Video,
} from "lucide-react";
import { getAssemblyById } from "@/lib/assembly";

import EntityDatabaseManager from "@/components/entities/EntityDatabaseManager";
import Button from "@/components/basics/Button";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/app/constans/iconPaths";
import { getIconPath } from "@/lib/utils";
import AssemblySearchBar from "@/components/searchBar/AssemblySearch";

const EntityDetailPage = () => {
  const { entityId } = useParams();
  const router = useRouter();
  const { setSegmentTitle } = usePageTitle();
  const [loading, setLoading] = useState(true);
  const [entityData, setEntityData] = useState(null);
  const [assemblies, setAssemblies] = useState([]); // Changed from activeAssembly to assemblies array
  const [registries, setRegistries] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [entityTypes, setEntityTypes] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    nit: "",
    type: "",
    city: "",
    address: "",
  });

  // Assembly filters
  const [assemblySearchTerm, setAssemblySearchTerm] = useState("");
  const [assemblyTypeFilter, setAssemblyTypeFilter] = useState("");
  const [assemblyStatusFilter, setAssemblyStatusFilter] = useState("");
  const [assemblySort, setAssemblySort] = useState("");

  const fetchEntityData = useCallback(async () => {
    if (!entityId) return;

    const res = await getEntityById(entityId);
    if (res.success) {
      setEntityData(res.data);
      setSegmentTitle(entityId, res.data.name);
      setFormData({
        name: res.data.name || "",
        nit: res.data.nit || "",
        type: res.data.type || "",
        city: res.data.city || "",
        address: res.data.address || "",
      });

      if (res.data.assemblyRegistriesListId) {
        const resList = await getAssemblyRegistriesList(
          res.data.assemblyRegistriesListId,
        );
        if (resList.success) {
          // Convert Map to Array
          const registriesArray = Object.values(resList.data);
          setRegistries(registriesArray);
        }
      }

      // Fetch all assemblies for this entity
      if (
        res.data.lastUpdateOwners &&
        Array.isArray(res.data.lastUpdateOwners)
      ) {
        const assemblyPromises = res.data.lastUpdateOwners.map((assemblyId) =>
          getAssemblyById(assemblyId),
        );
        const assemblyResults = await Promise.all(assemblyPromises);
        const fetchedAssemblies = assemblyResults
          .filter((result) => result.success)
          .map((result) => result.data);
        setAssemblies(fetchedAssemblies);
      } else if (res.data.lastUpdateOwners) {
        // Backward compatibility: if it's a single ID (string), convert to array
        const resAssembly = await getAssemblyById(res.data.lastUpdateOwners);
        if (resAssembly.success) {
          setAssemblies([resAssembly.data]);
        }
      }
    } else {
      toast.error("Error cargando entidad");
      router.push(`/operario/${entityId}`);
    }
    setLoading(false);
  }, [entityId, router, setSegmentTitle]);

  const fetchEntityTypes = async () => {
    const res = await getEntityTypes();
    if (res.success) {
      setEntityTypes(res.data);
    }
  };

  useEffect(() => {
    fetchEntityData();
    fetchEntityTypes();
  }, [fetchEntityData]);

  const handleSaveEntity = async () => {
    setLoading(true);
    const res = await updateEntity(entityId, formData);
    if (res.success) {
      toast.success("Entidad actualizada correctamente");
      setIsEditing(false);
      fetchEntityData();
    } else {
      toast.error("Error al actualizar entidad");
    }
    setLoading(false);
  };

  const handleDeleteEntity = async () => {
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar esta entidad? Esta acción no se puede deshacer.",
      )
    ) {
      setLoading(true);
      const res = await deleteEntity(entityId);
      if (res.success) {
        toast.success("Entidad eliminada correctamente");
        router.push(`/operario/entidades`);
      } else {
        toast.error("Error al eliminar entidad");
        setLoading(false);
      }
    }
  };

  const getTypeNameInSpanish = (typeName) => {
    const translations = {
      Residential: "Residencial",
      Commercial: "Comercial",
      Mixed: "Mixto",
      "Horizontal Property": "Propiedad Horizontal",
    };
    return translations[typeName] || typeName;
  };

  const getTypeLabel = (typeIdOrName) => {
    const typeObj = entityTypes.find((t) => t.id === typeIdOrName);
    if (typeObj) {
      return getTypeNameInSpanish(typeObj.name);
    }
    return getTypeNameInSpanish(typeIdOrName);
  };

  const filteredAssemblies = useMemo(() => {
    let result = [...assemblies];

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
    assemblies,
    assemblySearchTerm,
    assemblyTypeFilter,
    assemblyStatusFilter,
    assemblySort,
  ]);

  if (!entityData) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader />
      </div>
    );
  }
  return (
    <div className="flex flex-col w-full max-w-[1128px]">
      <div className="flex flex-col gap-8 mx-15">
        <div className="flex items-center justify-between">
          <CustomText
            variant="TitleL"
            as="h3"
            className="font-bold text-[#0E3C42]"
          >
            {entityData.name}
          </CustomText>
          <CustomButton
            variant="primary"
            onClick={handleDeleteEntity}
            className="px-5 py-3 flex items-center gap-1"
          >
            <CustomIcon path={ICON_PATHS.delete} size={20} />
            <CustomText variant="bodyM" className="font-bold">
              Eliminar Entidad
            </CustomText>
          </CustomButton>
        </div>

        {/* Section 1: General Info */}
        <div className="bg-white max-w-[1128px] rounded-3xl border border-[#F3F6F9] p-8">
          <div className="flex items-center justify-between mb-6">
            <CustomText
              variant="bodyX"
              as="h5"
              className="font-bold text-[#0E3C42]"
            >
              Información General
            </CustomText>
            {!isEditing ? (
              <CustomButton
                variant="primary"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-4 py-2"
              >
                <CustomIcon path={ICON_PATHS.pencil} size={20} />
                <CustomText variant="bodyM" className="font-bold">
                  Editar información
                </CustomText>
              </CustomButton>
            ) : (
              <div className="flex gap-2">
                <CustomButton
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  icon={X}
                  className="px-10 py-4 font-bold"
                >
                  Cancelar
                </CustomButton>
                <CustomButton
                  variant="primary"
                  onClick={handleSaveEntity}
                  className="font-bold px-6 py-3"
                  icon={Save}
                >
                  Guardar
                </CustomButton>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-1">
              <CustomText
                variant="labelM"
                className="font-medium text-[#3D3D44]"
              >
                Nit
              </CustomText>
              {isEditing ? (
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  value={formData.nit}
                  onChange={(e) =>
                    setFormData({ ...formData, nit: e.target.value })
                  }
                />
              ) : (
                <CustomText
                  variant="labelL"
                  className="font-medium text-[#000000]"
                >
                  {entityData.nit}
                </CustomText>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <CustomText
                variant="labelM"
                className="font-medium text-[#3D3D44]"
              >
                Tipo entidad
              </CustomText>
              {isEditing ? (
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="">Seleccionar</option>
                  {entityTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {getTypeNameInSpanish(type.name)}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <CustomText
                    variant="labelM"
                    className="flex items-center gap-1 font-medium text-[#000000] bg-[#D5DAFF] px-2 py-1 rounded-full"
                  >
                    <CustomIcon path={getIconPath(entityData)} size={14} />
                    {getTypeLabel(entityData.type)}
                  </CustomText>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <CustomText
                variant="labelM"
                className="font-medium text-[#3D3D44]"
              >
                Asambleistas registrados
              </CustomText>
              <CustomText
                variant="labelL"
                className="font-medium text-[#000000]"
              >
                {registries.length}
              </CustomText>
            </div>
            <div className="flex flex-col gap-1">
              <CustomText
                variant="labelM"
                className="font-medium text-[#3D3D44]"
              >
                Ciudad
              </CustomText>
              {isEditing ? (
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                >
                  <option value="">Seleccionar</option>
                  {colombiaCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              ) : (
                <CustomText
                  variant="labelL"
                  className="font-medium text-[#3D3D44]"
                >
                  {entityData.city}
                </CustomText>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <CustomText
                variant="labelM"
                className="font-medium text-[#3D3D44]"
              >
                Dirección
              </CustomText>
              {isEditing ? (
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              ) : (
                <CustomText
                  variant="labelL"
                  className="font-medium text-[#3D3D44]"
                >
                  {entityData.address}
                </CustomText>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Asambleas */}
        <div className="bg-[#FFFFFF] max-w-[1128px] rounded-3xl border border-[#F3F6F9] p-8">
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
              onClick={() =>
                router.push(`/operario/${entityId}/crear-asamblea`)
              }
              className="flex items-center gap-1 px-4 py-2"
            >
              <CustomIcon path={ICON_PATHS.add} size={20} />
              <CustomText variant="bodyM" className="font-bold">
                Crear asamblea
              </CustomText>
            </CustomButton>
          </div>

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

          {/* Assemblies Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead className="">
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-6 font-bold text-[#242330] text-[16px]">
                    Nombre de la Asamblea
                  </th>
                  <th className="py-4 px-6 font-bold text-[#242330] text-[16px]">
                    Fecha
                  </th>
                  <th className="py-4 px-6 font-bold text-[#242330] text-[16px]">
                    Hora
                  </th>
                  <th className="py-4 px-6 font-bold text-[#242330] text-center text-[16px]">
                    Tipo
                  </th>
                  <th className="py-4 px-6 font-bold text-[#242330] text-center text-[16px]">
                    Estado
                  </th>
                  <th className="py-4 px-6 font-bold text-[#242330] text-center text-[16px]">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {assemblies.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center text-gray-500 text-sm"
                    >
                      No hay asambleas creadas aún.
                    </td>
                  </tr>
                ) : (
                  filteredAssemblies.map((assembly) => {
                    const getStatusBadge = () => {
                      if (
                        assembly.status === "started" ||
                        assembly.status === "registries_finalized"
                      ) {
                        return {
                          text: "En vivo",
                          className: "bg-red-100 text-red-600",
                          dot: true,
                        };
                      } else if (assembly.status === "finished") {
                        return {
                          text: "Finalizada",
                          className: "bg-teal-100 text-teal-600",
                          dot: false,
                        };
                      } else {
                        return {
                          text: "Agendada",
                          className: "bg-orange-100 text-orange-600",
                          dot: false,
                        };
                      }
                    };

                    const statusBadge = getStatusBadge();

                    return (
                      <tr
                        key={assembly.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900 text-[14px]">
                            {assembly.name}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-[14px]">
                          {assembly.date || "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-[14px]">
                          {assembly.hour || "-"}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-[14px] text-[#000000] font-bold inline-flex items-center border rounded-full px-2 py-1 gap-1 font-bold ">
                            {assembly.type === "Presencial" ? (
                              <>
                                <Users size={14} />
                                Presencial
                              </>
                            ) : assembly.type === "Virtual" ? (
                              <>
                                <Video size={14} />
                                Virtual
                              </>
                            ) : (
                              <>
                                <Users size={14} />
                                Mixta
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusBadge.className}`}
                          >
                            {statusBadge.dot && (
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            )}
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="py-4 px-6 flex justify-center">
                          <CustomButton
                            variant="primary"
                            onClick={() =>
                              router.push(
                                `/operario/${entityId}/${assembly.id}`,
                              )
                            }
                            className=" p-2 "
                            title="Ver asamblea"
                          >
                            <CustomIcon path={ICON_PATHS.eye} size={24} />
                          </CustomButton>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Base de Datos de Asambleísta */}
        <EntityDatabaseManager
          entityData={entityData}
          registries={registries}
          onRefresh={fetchEntityData}
        />
      </div>
    </div>
  );
};

export default EntityDetailPage;
