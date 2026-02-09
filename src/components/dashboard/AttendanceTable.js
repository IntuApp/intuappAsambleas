import React, { useState } from "react";
import {
  Search,
  Download,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
} from "lucide-react";
import Button from "../basics/Button";
import CustomButton from "../basics/CustomButton";
import CustomText from "../basics/CustomText";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

const AttendanceTable = ({
  registries,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  onAction,
  assemblyType,
  showActions = true,
  mode = "operator",
  onAddRegistry,
  assembyStatus,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Registry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "",
    grupo: "",
    propiedad: "",
    coeficiente: "",
    documento: "",
  });

  const filteredItems = registries
    .filter((item) => {
      if (activeTab === "Registrados")
        return item.registerInAssembly === true && !item.isDeleted;
      if (activeTab === "Pendientes")
        return item.registerInAssembly !== true && !item.isDeleted;
      if (activeTab === "Registros eliminados") return item.isDeleted === true;
      return false;
    })
    .filter((item) => {
      const search = searchTerm.toLowerCase();
      return (
        String(item.propiedad || "")
          .toLowerCase()
          .includes(search) ||
        String(item.documento || "")
          .toLowerCase()
          .includes(search) ||
        String(item.grupo || "")
          .toLowerCase()
          .includes(search)
      );
    });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const availableTabs =
    mode === "funcionario"
      ? ["Registrados", "Pendientes"]
      : ["Registrados", "Pendientes", "Registros eliminados"];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.tipo ||
      !formData.propiedad ||
      !formData.coeficiente ||
      !formData.documento
    ) {
      return; // Handled by required attribute
    }
    onAddRegistry(formData);
    setIsModalOpen(false);
    setFormData({
      tipo: "",
      grupo: "",
      propiedad: "",
      coeficiente: "",
      documento: "",
    });
  };

  return (
    <div className="bg-white rounded-[32px] p-4 md:p-8 shadow-sm border border-gray-100 flex flex-col font-primary">
      <div className="flex flex-col gap-5 mb-6">
        <h3 className="text-xl font-bold text-[#0E3C42]">Asistencia</h3>
        <div className="flex flex-wrap gap-2">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-3 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[#E0E7FF] text-black shadow-sm"
                  : "bg-transparent text-gray-400 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[#333333] mb-6 text-sm">
        Aquí puedes ver a los Asambleistas que ya se registraron.
      </p>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6 md:mb-8">
        <div className="flex-1 relative group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Busca por torre, # de unidad privada o cédula"
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-[#0E3C42] outline-none focus:border-[#8B9DFF] transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select className="border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#8B9DFF] bg-white min-w-[140px] text-sm text-gray-600 font-bold h-[48px] flex-1 md:flex-none">
            <option>Ver todos</option>
          </select>

          {activeTab === "Pendientes" && mode !== "funcionario" && (
            <CustomButton
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 py-2 px-4"
            >
              <CustomIcon path={ICON_PATHS.add} size={16} />
              <CustomText variant="labelL" className="font-bold">
                Añadir asambleísta
              </CustomText>
            </CustomButton>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-xs font-bold text-gray-800 uppercase tracking-wider">
              <th className="py-4 px-6">Tipo</th>
              <th className="py-4 px-6">Grupo</th>
              <th className="py-4 px-6"># Propiedad</th>
              {mode !== "funcionario" && (
                <>
                  <th className="py-4 px-6">Coeficiente</th>
                  <th className="py-4 px-6">Documento</th>
                  {activeTab === "Registrados" && (
                    <th className="py-4 px-6 text-center">Poder</th>
                  )}
                </>
              )}
              {mode === "funcionario" ? (
                <th className="py-4 px-6 text-center">Voto Bloqueado</th>
              ) : (
                activeTab === "Registrados" &&
                showActions &&
                assembyStatus !== "finished" && (
                  <th className="py-4 px-6 text-center">Acción</th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white">
            {currentItems.map((item, idx) => (
              <tr
                key={item.id || idx}
                className="border-b border-gray-50 hover:bg-gray-50 transition text-sm text-[#0E3C42]"
              >
                <td className="py-4 px-6 text-gray-500 font-medium">
                  {item.tipo || "-"}
                </td>
                <td className="py-4 px-6 text-gray-500 font-medium">
                  {item.grupo || "-"}
                </td>
                <td className="py-4 px-6 text-[#0E3C42] font-medium uppercase">
                  {item.propiedad || "---"}
                </td>

                {mode !== "funcionario" && (
                  <>
                    <td className="py-4 px-6 text-gray-500 font-medium">
                      {item.coeficiente || "0"}%
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-medium">
                      {item.documento || "-"}
                    </td>
                    {activeTab !== "Pendientes" && (
                      <td className="py-4 px-6 text-center">
                        {item.powerUrl ? (
                          <a
                            href={item.powerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4059FF] justify-center hover:underline flex  gap-1 font-bold text-[14px]"
                          >
                            <img src="/logos/users/iconFile.png" alt="x" />
                            Descargar Poder
                          </a>
                        ) : (
                          <div className="flex justify-center">
                            <span
                              className={`px-6 py-1.5 rounded-full border text-[13px] font-bold bg-white border-gray-200 text-[#0E3C42]`}
                            >
                              {item.role === "owner"
                                ? "Propietario"
                                : "Poder físico"}
                            </span>
                          </div>
                        )}
                      </td>
                    )}
                  </>
                )}

                {mode === "funcionario" ? (
                  <td className="py-4 px-6 text-center">
                    <span>{item.voteBlocked ? "Sí" : "No"}</span>
                  </td>
                ) : (
                  activeTab !== "Pendientes" &&
                  showActions && (
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {activeTab !== "Registros eliminados" ? (
                          <button
                            onClick={() => onAction(item, "delete")}
                            title="Mover a eliminados"
                            className="p-2 rounded-full transition bg-[#94A2FF] text-black font-black hover:bg-[#8B9FFD]"
                          >
                            <Trash2 size={20} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onAction(item, "restore")}
                            title="Restaurar"
                            className="p-2 rounded-lg transition bg-green-50 text-green-500 hover:bg-green-100"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )
                )}
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="py-16 text-center text-gray-300 font-bold italic"
                >
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-2 text-gray-400 hover:text-[#0E3C42] disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                currentPage === i + 1
                  ? "bg-[#D9E9E9] text-[#0E3C42] shadow-sm"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-2 text-gray-400 hover:text-[#0E3C42] disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* ADD REGISTRY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-lg w-full relative animate-in zoom-in duration-300 shadow-2xl">
            <h3 className="text-[28px] font-bold text-[#0E3C42] mb-2">
              Añadir asambleísta
            </h3>
            <p className="text-gray-400 text-sm mb-8">
              Ingrese los datos de la nueva unidad privada para esta asamblea.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="text-sm font-bold text-[#0E3C42] mb-1.5 block">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8B9DFF] text-sm font-medium"
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-sm font-bold text-[#0E3C42] mb-1.5 block">
                    Grupo
                  </label>
                  <input
                    type="text"
                    placeholder="Torre / Bloque"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8B9DFF] text-sm font-medium"
                    value={formData.grupo}
                    onChange={(e) =>
                      setFormData({ ...formData, grupo: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-[#0E3C42] mb-1.5 block">
                  # Propiedad <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Número de unidad"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8B9DFF] text-sm font-medium"
                  value={formData.propiedad}
                  onChange={(e) =>
                    setFormData({ ...formData, propiedad: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="text-sm font-bold text-[#0E3C42] mb-1.5 block">
                    Coeficiente <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="0.0000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8B9DFF] text-sm font-medium"
                    value={formData.coeficiente}
                    onChange={(e) =>
                      setFormData({ ...formData, coeficiente: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-sm font-bold text-[#0E3C42] mb-1.5 block">
                    Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Cédula / NIT"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8B9DFF] text-sm font-medium"
                    value={formData.documento}
                    onChange={(e) =>
                      setFormData({ ...formData, documento: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="flex-1 !text-black"
                >
                  <Check size={20} />
                  Confirmar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
