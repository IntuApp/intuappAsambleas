"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getEntityById,
  getAssemblyRegistriesList,
  updateAssemblyRegistriesList,
  createAssemblyRegistriesList,
  updateEntity,
  deleteEntity,
} from "@/lib/entities";
import { getEntityTypes } from "@/lib/masterData";
import { colombiaCities } from "@/lib/colombiaCities";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Loader from "@/components/basics/Loader";
import { toast } from "react-toastify";
import { usePageTitle } from "@/context/PageTitleContext";
import Button from "@/components/basics/Button";
import {
  Building2,
  Edit2,
  Trash2,
  Search,
  Eye,
  CloudUpload,
  FileSpreadsheet,
  Check,
  X,
  Save,
  Users,
  Video,
  Plus,
} from "lucide-react";
import { getAssemblyById } from "@/lib/assembly";

import EntityDatabaseManager from "@/components/entities/EntityDatabaseManager";

export default function EntityDetailView({
  entityId,
  backUrl,
  basePath, // e.g., /superAdmin/operadores/123/entity/456 or /operario/entidades/456
  userRole = "admin", // 'superAdmin' or 'operator' to adjust some permissions if needed
}) {
  const router = useRouter();
  const { setSegmentTitle } = usePageTitle();
  const [loading, setLoading] = useState(true);
  const [entityData, setEntityData] = useState(null);
  const [assemblies, setAssemblies] = useState([]);
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

  // Pagination and Search State for Registries
  // (Removed as it is now handled in EntityDatabaseManager, but 'registries' state is still needed for passing data)

  // Excel Upload State (Removed - moved to component)

  const fetchEntityData = useCallback(async () => {
    if (!entityId) return;

    const res = await getEntityById(entityId);
    if (res.success) {
      setEntityData(res.data);
      if (setSegmentTitle) setSegmentTitle(entityId, res.data.name);
      setFormData({
        name: res.data.name || "",
        nit: res.data.nit || "",
        type: res.data.type || "",
        city: res.data.city || "",
        address: res.data.address || "",
      });

      if (res.data.assemblyRegistriesListId) {
        const resList = await getAssemblyRegistriesList(
          res.data.assemblyRegistriesListId
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
          getAssemblyById(assemblyId)
        );
        const assemblyResults = await Promise.all(assemblyPromises);
        const fetchedAssemblies = assemblyResults
          .filter((result) => result.success)
          .map((result) => result.data);
        setAssemblies(fetchedAssemblies);
      } else if (res.data.lastUpdateOwners) {
        // Backward compatibility
        const resAssembly = await getAssemblyById(res.data.lastUpdateOwners);
        if (resAssembly.success) {
          setAssemblies([resAssembly.data]);
        }
      }
    } else {
      toast.error("Error cargando entidad");
      if (backUrl) router.push(backUrl);
    }
    setLoading(false);
  }, [entityId, router, setSegmentTitle, backUrl]);

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
        "¿Estás seguro de que deseas eliminar esta entidad? Esta acción no se puede deshacer."
      )
    ) {
      setLoading(true);
      const res = await deleteEntity(entityId);
      if (res.success) {
        toast.success("Entidad eliminada correctamente");
        if (backUrl) router.push(backUrl);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader />
      </div>
    );
  }

  if (!entityData) return null;

  return (
    <div className="flex flex-col w-full">
      <div className="p-8 flex flex-col gap-8 w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] font-bold text-[#0E3C42]">
            {entityData.name}
          </h1>
          <Button
            variant="secondary"
            onClick={handleDeleteEntity}
            icon={Trash2}
          >
            Eliminar Entidad
          </Button>
        </div>

        {/* Section 1: General Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#0E3C42]">
              Información General
            </h2>
            {!isEditing ? (
              <Button
                variant="primary"
                size="S"
                onClick={() => setIsEditing(true)}
                icon={Edit2}
              >
                Editar información
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="S"
                  onClick={() => setIsEditing(false)}
                  icon={X}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="S"
                  onClick={handleSaveEntity}
                  icon={Save}
                >
                  Guardar
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Nit</label>
              {isEditing ? (
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  value={formData.nit}
                  onChange={(e) =>
                    setFormData({ ...formData, nit: e.target.value })
                  }
                />
              ) : (
                <p className="font-semibold text-gray-800 text-lg">
                  {entityData.nit}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">
                Tipo entidad
              </label>
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
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1">
                  <Building2 size={14} />
                  {getTypeLabel(entityData.type)}
                </span>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">
                Asambleistas registrados
              </label>
              <p className="font-semibold text-gray-800 text-lg">
                {registries.length}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Ciudad</label>
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
                <p className="font-semibold text-gray-800 text-lg">
                  {entityData.city}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">
                Dirección
              </label>
              {isEditing ? (
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              ) : (
                <p className="font-semibold text-gray-800 text-lg">
                  {entityData.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Asambleas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-[#0E3C42]">Asambleas</h2>
            <Button
              variant="primary"
              size="M"
              onClick={() => router.push(`${basePath}/crear-asamblea`)}
              icon={Plus}
            >
              Crear Asamblea
            </Button>
          </div>

          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 relative min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar asamblea por nombre"
                value={assemblySearchTerm}
                onChange={(e) => setAssemblySearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#8B9DFF] transition"
              />
            </div>
            <div className="w-full sm:w-auto">
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8B9DFF] bg-white"
                value={assemblyStatusFilter}
                onChange={(e) => setAssemblyStatusFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="create">Agendada</option>
                <option value="started">En vivo</option>
                <option value="finished">Finalizada</option>
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8B9DFF] bg-white"
                value={assemblyTypeFilter}
                onChange={(e) => setAssemblyTypeFilter(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="Virtual">Virtual</option>
                <option value="Presencial">Presencial</option>
                <option value="Mixta">Mixta</option>
              </select>
            </div>
          </div>

          {/* Assemblies Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-6 font-bold text-[#0E3C42] text-sm">
                    Nombre de la Asamblea
                  </th>
                  <th className="py-4 px-6 font-bold text-[#0E3C42] text-sm">
                    Fecha
                  </th>
                  <th className="py-4 px-6 font-bold text-[#0E3C42] text-sm hidden sm:table-cell">
                    Hora
                  </th>
                  <th className="py-4 px-6 font-bold text-[#0E3C42] text-sm hidden md:table-cell">
                    Tipo
                  </th>
                  <th className="py-4 px-6 font-bold text-[#0E3C42] text-sm">
                    Estado
                  </th>
                  <th className="py-4 px-6 font-bold text-[#0E3C42] text-sm">
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
                  assemblies
                    .filter((a) => {
                      const matchName = a.name
                        .toLowerCase()
                        .includes(assemblySearchTerm.toLowerCase());
                      const matchType = assemblyTypeFilter
                        ? a.type === assemblyTypeFilter
                        : true;
                      const matchStatus = assemblyStatusFilter
                        ? a.status === assemblyStatusFilter
                        : true;
                      return matchName && matchType && matchStatus;
                    })
                    .map((assembly) => {
                      // ... status logic ...
                      const statusBadge = {
                        text:
                          assembly.status === "started"
                            ? "En vivo"
                            : assembly.status === "finished"
                            ? "Finalizada"
                            : "Agendada",
                        className:
                          assembly.status === "started"
                            ? "bg-red-100 text-red-600"
                            : assembly.status === "finished"
                            ? "bg-teal-100 text-teal-600"
                            : "bg-orange-100 text-orange-600",
                        dot: assembly.status === "started",
                      };

                      return (
                        <tr
                          key={assembly.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition"
                        >
                          <td className="py-4 px-6">
                            <span className="font-medium text-gray-900">
                              {assembly.name}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {assembly.date || "-"}
                          </td>
                          <td className="py-4 px-6 text-gray-600 hidden sm:table-cell">
                            {assembly.hour || "-"}
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell text-sm text-gray-700">
                            {assembly.type}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusBadge.className}`}
                            >
                              {statusBadge.dot && (
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              )}
                              {statusBadge.text}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() =>
                                router.push(
                                  `${basePath}/asambleas/${assembly.id}`
                                )
                              }
                              className="w-10 h-10 rounded-full bg-[#8B9DFF] hover:bg-[#7a8ce0] flex items-center justify-center text-white transition shadow-md"
                              title="Ver asamblea"
                            >
                              <Eye size={18} />
                            </button>
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
}
