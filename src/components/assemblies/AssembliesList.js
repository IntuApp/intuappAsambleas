"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  Video,
  Users,
} from "lucide-react";
import CustomButton from "@/components/basics/CustomButton";
import Loader from "@/components/basics/Loader";
import CustomText from "../basics/CustomText";
import CustomIcon from "../basics/CustomIcon";
import { getTypeName } from "@/lib/utils";
import CustomTypeAssembly from "../basics/CustomTypeAssembly";
import { useRouter } from "next/navigation";
import CustomStates from "./CustomStates";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function AssembliesList({
  data = [],
  loading = false,
  onCreateClick,
  getDetailUrl,
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [assemblyStatusFilter, setAssemblyStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  const filteredAssemblies = useMemo(() => {
    let filtered = [...data];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.operatorName?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by type
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    // Filter by status
    if (assemblyStatusFilter && assemblyStatusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === assemblyStatusFilter);
    }

    // Sort
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "status") {
      const statusOrder = { started: 1, create: 2, finished: 3 };
      filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }

    return filtered;
  }, [searchTerm, typeFilter, assemblyStatusFilter, sortBy, data]);

  const getStatusBadge = (status) => {
    if (status === "started" || status === "registries_finalized") {
      return {
        text: "En vivo",
        className: "bg-red-100 text-red-600",
        dot: true,
      };
    } else if (status === "finished") {
      return {
        text: "Finalizada",
        className: "bg-green-100 text-green-600",
        dot: false,
      };
    } else {
      return {
        text: "Próxima",
        className: "bg-orange-100 text-orange-600",
        dot: false,
      };
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssemblies.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredAssemblies.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <CustomText variant="TitleX" className="text-[#0E3C42] font-bold">
            Asambleas
          </CustomText>
          <CustomButton
            onClick={onCreateClick}
            icon={Plus}
            className="flex items-center gap-2 bg-[#94A2FF] !text-[#000000] hover:bg-[#7a8ce0] !font-bold px-6 py-3 font-semibold shadow-md transition"
          >
            Crear Asamblea
          </CustomButton>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Busca por nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#8B9DFF] transition"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#8B9DFF] transition bg-white"
            >
              <option value="">Tipo</option>
              <option value="all">Todos</option>
              <option value="Virtual">Virtual</option>
              <option value="Presencial">Presencial</option>
              <option value="Mixta">Mixta</option>
            </select>

            {/* Status Filter */}
            <select
              value={assemblyStatusFilter}
              onChange={(e) => setAssemblyStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#8B9DFF] transition bg-white"
            >
              <option value="">Estado</option>
              <option value="all">Todos</option>
              <option value="create">Próxima</option>
              <option value="started">En vivo</option>
              <option value="finished">Finalizada</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#8B9DFF] transition bg-white"
            >
              <option value="date">Ordenar por</option>
              <option value="date">Fecha</option>
              <option value="name">Nombre</option>
              <option value="status">Estado</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl p-1.5 gap-2">
              <CustomButton
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 p-2 rounded-lg font-bold transition-all ${viewMode === "grid"
                    ? "bg-[#EEF0FF] border border-[#94A2FF] shadow-sm text-[#4059FF]"
                    : "bg-[#FFFFFF] border border-[#DBE2E8] shadow-sm text-[#3D3D44]"
                  }`}
              >
                <CustomIcon path={ICON_PATHS.layoutGrid} size={16} />
                <CustomText
                  variant="labelL"
                  className={
                    viewMode === "grid" ? "text-[#4059FF] font-medium" : "text-[#3D3D44] font-medium"
                  }
                >
                  Vista tarjetas
                </CustomText>
              </CustomButton>
              <CustomButton
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 p-2 rounded-lg font-bold transition-all ${viewMode === "list"
                    ? "bg-[#EEF0FF] border border-[#94A2FF] shadow-sm text-[#4059FF]"
                    : "bg-[#FFFFFF] border border-[#DBE2E8] shadow-sm text-[#3D3D44]"
                  }`}
              >
                <CustomIcon path={ICON_PATHS.viewList} size={16} />
                <CustomText
                  variant="labelL"
                  className={
                    viewMode === "list" ? "text-[#4059FF] font-medium" : "text-[#3D3D44] font-medium"
                  }
                >
                  Vista lista
                </CustomText>
              </CustomButton>
            </div>
          </div>
        </div>

        {/* Assemblies Grid/List */}
        {currentItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No se encontraron asambleas</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentItems.map((assembly) => {
              const statusBadge = getStatusBadge(assembly.status);

              return (
                <div
                  key={assembly.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col gap-4"
                >
                  <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">
                    {assembly.name}
                  </CustomText>

                  <div className="space-y-2  flex-1">
                    <div className="flex gap-2">
                      <CustomText variant="bodyM" className="font-regular">Operador:</CustomText>
                      <CustomText variant="bodyM" className="font-bold">{assembly.operatorName}</CustomText>
                    </div>
                    <div className="flex gap-2">
                      <CustomText variant="bodyM" className="font-regular">Entidad:</CustomText>
                      <CustomText variant="bodyM" className="font-bold">{assembly.entityName}</CustomText>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1 mb-2">
                    <div className="flex gap-2">
                      <CustomText variant="bodyM" className="font-regular">Próxima asamblea:</CustomText>
                      <CustomText variant="bodyM" className="font-bold">{assembly.date || "Por definir"}</CustomText>
                    </div>
                    <div className="flex gap-2">
                      <CustomText variant="bodyM" className="font-regular">Hora:</CustomText>
                      <CustomText variant="bodyM" className="font-bold">{assembly.hour || "Por definir"}</CustomText>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 flex-wrap mb-2">
                    <div>
                      <CustomTypeAssembly type={assembly.typeId} className="px-4 py-2 rounded-full bg-white border border-[#DBE2E8]" />

                    </div>
                    <div>
                      <CustomStates status={assembly.statusID} className="px-3 py-1 rounded-full " />
                    </div>
                  </div>

                  <CustomButton
                    onClick={() => {
                      if (assembly.operatorId === "sin-operador") {
                        return;
                      }
                      router.push(`/admin/operadores/${assembly.operatorId}/${assembly.entityId}/${assembly.id}`)
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3"
                  >
                    <CustomIcon path={ICON_PATHS.eye} size={18} />
                    <CustomText className="font-bold">Ver Asamblea</CustomText>
                  </CustomButton>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-bold text-[#0E3C42]">
                      Nombre de la Asamblea
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-[#0E3C42]">
                      Operador
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-[#0E3C42]">
                      Entidad
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-[#0E3C42]">
                      Fecha
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-[#0E3C42]">
                      Hora
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-[#0E3C42]">
                      Tipo
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-[#0E3C42]">
                      Estado
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-bold text-[#0E3C42]">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentItems.map((assembly) => {
                    return (
                      <tr
                        key={assembly.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 align-middle">
                          <p className="font-medium text-[#0E3C42]">
                            {assembly.name}
                          </p>
                        </td>
                        <td className="px-6 py-4 align-middle text-sm text-gray-600">
                          {assembly.operatorName}
                        </td>
                        <td className="px-6 py-4 align-middle text-sm text-gray-600">
                          {assembly.entityName}
                        </td>
                        <td className="px-6 py-4 align-middle text-sm text-gray-600">
                          {assembly.date || "Por definir"}
                        </td>
                        <td className="px-6 py-4 align-middle text-sm text-gray-600">
                          {assembly.hour || "Por definir"}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <CustomTypeAssembly
                            type={assembly.typeId}
                            className="px-3 py-1.5 text-xs rounded-full bg-white border border-[#DBE2E8] w-max"
                          />
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <CustomStates
                            status={assembly.statusID}
                            className="px-3 py-1.5 text-xs rounded-full w-max"
                          />
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <div className="flex justify-center w-full">
                            <CustomButton
                              onClick={() => {
                                if (assembly.operatorId === "sin-operador") {
                                  return;
                                }
                                router.push(`/admin/operadores/${assembly.operatorId}/${assembly.entityId}/${assembly.id}`);
                              }}
                              className="p-2"
                              title="Ver Asamblea"
                            >
                              <CustomIcon path={ICON_PATHS.eye} size={20} />
                            </CustomButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <CustomButton
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition ${currentPage === 1
                ? "border-gray-200 text-black cursor-not-allowed"
                : "border-gray-300 text-black hover:bg-gray-50"
                }`}
            >
              <ChevronLeft size={20} />
            </CustomButton>

            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <CustomButton
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`w-10 h-10 rounded-lg border transition ${currentPage === pageNumber
                      ? "bg-[#8B9DFF] text-white border-[#8B9DFF]"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {pageNumber}
                  </CustomButton>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <span key={pageNumber} className="text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <CustomButton
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition ${currentPage === totalPages
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <ChevronRight size={20} />
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
}
