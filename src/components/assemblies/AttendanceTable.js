import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

const AttendanceTable = ({
    assembly,
    registrations = [],
    masterList = {},
    blockedProperties = [], // 🔥 NUEVO: Recibe el array de IDs bloqueados
    mode = "operador",      // 🔥 NUEVO: Define el modo de la tabla ('operador' o 'funcionario')
    onAction
}) => {
    const [activeTab, setActiveTab] = useState("Registrados");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Dependiendo del modo, mostramos unas pestañas u otras
    const availableTabs = mode === "funcionario"
        ? ["Registrados", "Pendientes"]
        : ["Registrados", "Pendientes", "Registros eliminados"];

    // --- 1. PROCESAMIENTO Y APLANAMIENTO DE DATOS ---
    const { registrados, pendientes, eliminados } = useMemo(() => {
        const reg = [];
        const pend = [];
        const elim = [];
        const occupiedIds = new Set();

        // A. Procesar Registrados (Aplanamos el array representedProperties)
        registrations?.forEach((userReg, userIndex) => {
            if (userReg.isDeleted) {
                elim.push(userReg);
                return;
            }

            (userReg.representedProperties || []).forEach((prop, propIndex) => {
                const masterInfo = masterList[prop.ownerId] || {};
                occupiedIds.add(prop.ownerId);

                reg.push({
                    ...masterInfo,
                    id: prop.ownerId,
                    tipo: masterInfo.Tipo || masterInfo.tipo,
                    grupo: masterInfo.Grupo || masterInfo.grupo,
                    propiedad: masterInfo.Propiedad || masterInfo.propiedad,
                    coeficiente: prop.coefi || masterInfo.Coeficiente || masterInfo.coeficiente,
                    votos: masterInfo.votos || masterInfo.Votos || prop.Votos,
                    documento: masterInfo.Documento || masterInfo.documento,
                    mainDocument: userReg.mainDocument,
                    firstName: userReg.firstName,
                    lastName: userReg.lastName,
                    role: prop.role,
                    power: prop.power,
                    addedByUser: prop.addedByUser,
                    userIndex,
                    propIndex,
                    registrationId: userReg.mainDocument
                });
            });
        });

        const getFromMaster = (data, key) => {
            const searchKey = key.toLowerCase().trim();
            const realKey = Object.keys(data).find(k => k.toLowerCase().trim().includes(searchKey));
            return realKey ? data[realKey] : null;
        };
        
        Object.entries(masterList).forEach(([id, data]) => {
            if (!occupiedIds.has(id)) {
                // Usamos la lógica de búsqueda flexible para asegurar que traiga el valor
                const votosFinales = getFromMaster(data, "voto") || getFromMaster(data, "votos") || data.Votos || "1";

                pend.push({
                    ...data,
                    id,
                    tipo: data.Tipo || data.tipo,
                    grupo: data.Grupo || data.grupo,
                    propiedad: data.Propiedad || data.propiedad,
                    coeficiente: data.Coeficiente || data.coeficiente,
                    votos: votosFinales, // 🔥 Cambiado de data.votos a votosFinales
                    documento: data.Documento || data.documento,
                });
            }
        });

        return { registrados: reg, pendientes: pend, eliminados: elim };
    }, [registrations, masterList]);


    const visibleColumns = useMemo(() => {
        // Unificamos todos los datos para saber si hay valores en alguna parte
        const allData = [...registrados, ...pendientes, ...eliminados];

        const cols = [
            { id: "tipo", label: "Tipo" },
            { id: "grupo", label: "Grupo" },
            { id: "propiedad", label: "# Propiedad" },
            { id: "coeficiente", label: "Coeficiente" },
            { id: "votos", label: "Votos" },
            { id: "documento", label: "Documento" },
        ];

        // Filtramos: Solo si al menos un registro tiene valor en esa columna
        return cols.filter(col =>
            allData.some(item => item[col.id] !== null && item[col.id] !== undefined)
        );
    }, [registrados, pendientes, eliminados]);
    // --- 2. FILTRADO POR PESTAÑA Y BÚSQUEDA ---
    const currentData = useMemo(() => {
        let source = [];
        if (activeTab === "Registrados") source = registrados;
        if (activeTab === "Pendientes") source = pendientes;
        if (activeTab === "Registros eliminados") source = eliminados;

        if (!searchTerm) return source;

        const lowerSearch = searchTerm.toLowerCase();
        return source.filter(item =>
            String(item.propiedad || "").toLowerCase().includes(lowerSearch) ||
            String(item.mainDocument || "").toLowerCase().includes(lowerSearch) ||
            String(item.documento || "").toLowerCase().includes(lowerSearch) ||
            String(item.grupo || "").toLowerCase().includes(lowerSearch) ||
            String(item.firstName || "").toLowerCase().includes(lowerSearch) ||
            String(item.lastName || "").toLowerCase().includes(lowerSearch)
        );
    }, [activeTab, registrados, pendientes, eliminados, searchTerm]);

    // --- 3. PAGINACIÓN ---
    const totalPages = Math.ceil(currentData.length / itemsPerPage) || 1;
    const currentItems = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // --- 4. RENDERIZADO CONDICIONAL DE PODER ---
    const renderPoder = (item) => {
        if (activeTab !== "Registrados") return "-";

        if (item.role === "owner") {
            return (
                <span className="px-4 py-1 rounded-full border border-gray-200 text-[#0E3C42] text-xs font-bold bg-gray-50">
                    Propietario
                </span>
            );
        }

        if (String(assembly?.typeId) === "1") {
            return (
                <span className="px-4 py-1 rounded-full border border-gray-200 text-[#0E3C42] text-xs font-bold bg-gray-50">
                    Poder físico
                </span>
            );
        }

        if (item.power) {
            return (
                <a
                    href={item.power}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4059FF] hover:underline flex items-center justify-center gap-2 font-bold text-xs"
                >
                    <img src="/logos/users/iconFile.png" alt="file" className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} />
                    Descargar poder
                </a>
            );
        } else {
            return (
                <span className="px-4 py-1 rounded-full border border-gray-200 text-[#0E3C42] text-xs font-bold bg-gray-50">
                    Poder físico
                </span>
            );
        }
    };

    return (
        <div className="w-full bg-white border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-6 shadow-soft mt-8">

            {/* HEADER Y PESTAÑAS */}
            <div className="flex flex-col gap-4">
                <CustomText variant="TitleM" className="font-bold text-[#0E3C42]">Asistencia</CustomText>
                <div className="flex flex-wrap gap-2">
                    {/* Renderizamos solo las pestañas permitidas por el modo */}
                    {availableTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === tab
                                ? "bg-[#E0E7FF] text-[#0E3C42] shadow-sm"
                                : "bg-transparent text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <CustomText variant="bodyM" className="text-[#838383]">
                    {activeTab === "Registrados" ? "Aquí puedes ver las unidades que ya confirmaron su asistencia." :
                        activeTab === "Pendientes" ? "Unidades que aún no se han registrado en la asamblea." :
                            "Historial de registros eliminados o anulados."}
                </CustomText>
            </div>

            {/* BUSCADOR */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Busca por torre, # de propiedad, documento o nombre"
                    className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-[#8B9DFF] transition-all"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>

            {/* TABLA */}
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            {/* RENDERIZADO DINÁMICO DE HEADERS */}
                            {visibleColumns.map(col => (
                                <th key={col.id} className="py-4 px-6">{col.label}</th>
                            ))}

                            {assembly?.requireFullName && activeTab === "Registrados" && (
                                <th className="py-4 px-6">Nombre</th>
                            )}

                            {activeTab === "Registrados" && (
                                <th className="py-4 px-6 text-center">Poder</th>
                            )}

                            {mode === "funcionario" && activeTab === "Registrados" && (
                                <th className="py-4 px-6 text-center ">Voto Bloqueado</th>
                            )}

                            {mode !== "funcionario" && activeTab !== "Pendientes" && (
                                <th className="py-4 px-6 text-center">Acción</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item, idx) => (
                            <tr key={item.id || idx} className="border-b border-gray-50 hover:bg-slate-50/50 transition text-sm text-[#0E3C42]">
                                {/* RENDERIZADO DINÁMICO DE CELDAS */}
                                {visibleColumns.map(col => (
                                    <td key={col.id} className={`py-4 px-6 ${col.id === 'propiedad' ? 'font-bold' : 'font-medium text-gray-500'}`}>
                                        {col.id === 'coeficiente'
                                            ? `${parseFloat(item[col.id] || 0).toFixed(4).replace(/\.?0+$/, "")}%`
                                            : (item[col.id] || "-")
                                        }
                                    </td>
                                ))}

                                {assembly?.requireFullName && activeTab === "Registrados" && (
                                    <td className="py-4 px-6 font-medium capitalize">
                                        {item.firstName ? `${item.firstName} ${item.lastName || ""}`.toLowerCase() : "-"}
                                    </td>
                                )}

                                {activeTab === "Registrados" && (
                                    <td className="py-4 px-6 text-center">
                                        {renderPoder(item)}
                                    </td>
                                )}

                                {mode === "funcionario" && activeTab === "Registrados" && (
                                    <td className="py-4 px-6 text-center font-bold">
                                        {blockedProperties.includes(item.id) ? (
                                            <span className="text-red-500 bg-red-50 px-3 py-1 rounded-md">Sí</span>
                                        ) : (
                                            <span className="text-gray-500">No</span>
                                        )}
                                    </td>
                                )}

                                {mode !== "funcionario" && activeTab !== "Pendientes" && (
                                    <td className="py-4 px-6 text-center">
                                        <CustomButton
                                            onClick={() => onAction && onAction(item, activeTab === "Registrados" ? "delete" : "restore")}
                                            className="p-2 rounded-full transition"
                                        >
                                            <CustomIcon path={activeTab === "Registrados" ? ICON_PATHS.delete : ICON_PATHS.refresh} size={20} />
                                        </CustomButton>
                                    </td>
                                )}
                            </tr>
                        ))}

                        {currentItems.length === 0 && (
                            <tr>
                                <td colSpan="10" className="py-12 text-center text-gray-400 font-medium">
                                    No se encontraron propiedades para mostrar en esta sección.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
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
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentPage === i + 1
                                ? "bg-[#D9E9E9] text-[#0E3C42]"
                                : "bg-transparent text-gray-500 hover:bg-gray-100"
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
        </div>
    );
};

export default AttendanceTable;