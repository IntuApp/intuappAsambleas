"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import OperatorsSearchBar from "@/components/searchBar/OperatorsSearchBar";
import { listenToOperators } from "@/lib/user"; // Importamos el oyente de Firebase

const OperadoresPage = () => {
    const router = useRouter();

    // 1. Estado para almacenar TODOS los operadores desde Firebase
    const [operators, setOperators] = useState([]);
    // 2. Estado para almacenar los operadores ya filtrados por tu SearchBar
    const [filteredOperators, setFilteredOperators] = useState([]);
    // 3. Estado de la vista actual
    const [viewMode, setViewMode] = useState("grid");

    // Traemos los operadores en tiempo real al montar la página
    useEffect(() => {
        const unsubscribe = listenToOperators((data) => {
            setOperators(data);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Header */}
            <div className="flex justify-between items-center">
                <CustomText variant="TitleX" className="text-[#0E3C42] font-bold">
                    Operadores Logísticos
                </CustomText>
                <CustomButton
                    variant="primary"
                    className="py-3 px-4 flex gap-2 items-center"
                    onClick={() => router.push("/admin/operadores/crear")}
                >
                    <CustomIcon path={ICON_PATHS.add || "M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"} size={24} />
                    <CustomText variant="labelL" className="font-bold">
                        Crear Operador
                    </CustomText>
                </CustomButton>
            </div>

            {/* Componente de Búsqueda (Tu componente) */}
            <OperatorsSearchBar
                operators={operators}
                onChange={setFilteredOperators} // El searchbar nos devuelve la lista filtrada aquí
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            {/* Renderizado Condicional: Vista Tarjetas vs Vista Lista */}
            {viewMode === "grid" ? (
                // --- VISTA TARJETAS (Grid) ---
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOperators.map((operator) => {
                        const name = operator.representative?.name || operator.name || "Sin nombre";


                        return (
                            <div key={operator.id} className="bg-white p-6 rounded-[24px] border border-[#F3F6F9] shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
                                <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
                                    {name}
                                </CustomText>

                                <div className="flex flex-col gap-2 pt-4">

                                    <CustomText variant="labelL" className="text-[#3D3D44] font-regular">
                                        Entidades: <span className="font-bold text-[#0E3C42]">{operator.entities?.length || 0}</span>
                                    </CustomText>

                                    <CustomText variant="labelL" className="text-[#3D3D44] font-regular">
                                        Ubicación: <span className="font-bold text-[#0E3C42]">{operator.city || "No definida"}</span>
                                    </CustomText>
                                </div>

                                <CustomButton
                                    variant="primary"
                                    className="w-full mt-2 py-2 flex justify-center items-center gap-2 bg-[#94A2FF] text-[#00093F] rounded-full font-bold hover:bg-opacity-90"
                                    onClick={() => router.push(`/admin/operadores/${operator.id}`)}
                                >
                                    {/* Ajusta este ICON_PATHS a tu icono de engranaje */}
                                    <CustomIcon path={ICON_PATHS.settings || "M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"} size={18} />
                                    Gestionar
                                </CustomButton>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // --- VISTA LISTA (Tabla) ---
                <div className="bg-white rounded-[24px] border border-[#F3F6F9] shadow-sm overflow-hidden w-full">
                    <table className="w-full text-left border-collapse">
                        <thead className="border-b border-gray-100 bg-white">
                            <tr>
                                <th className="py-4 px-6 font-bold text-[#0E3C42] text-[16px]">Operador</th>
                                <th className="py-4 px-6 font-bold text-[#0E3C42] text-[16px]"># Entidades</th>
                                <th className="py-4 px-6 font-bold text-[#0E3C42] text-[16px]">Ubicación</th>
                                <th className="py-4 px-6 font-bold text-[#0E3C42] text-[16px] text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOperators.map((operator) => {
                                const name = operator.representative?.name || operator.name || "Sin nombre";
                                const plan = operator.plan || "Plan Básico";
                                const renewal = operator.renewalDate || "10 Jun 2026";
                                const inMora = operator.inMora || false;

                                return (
                                    <tr key={operator.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-5 px-6 text-[#838383] text-[14px]">
                                            {name}
                                        </td>
                                        <td className="py-5 px-6 text-[#838383] text-[14px]">
                                            {operator.entities?.length || 0}
                                        </td>
                                        <td className="py-5 px-6 text-[#838383] text-[14px]">
                                            {operator.city || "No definida"}
                                        </td>
                                        <td className="py-5 px-6 flex justify-center">
                                            <button
                                                onClick={() => router.push(`/admin/operadores/${operator.id}`)}
                                                className="w-10 h-10 flex justify-center items-center bg-[#94A2FF] text-[#00093F] rounded-full hover:bg-[#8090ff] transition-all"
                                            >
                                                <CustomIcon path={ICON_PATHS.settings || "M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"} size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OperadoresPage;