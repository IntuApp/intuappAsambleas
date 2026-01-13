"use client";

import Header from "@/components/headers/HeaderSuperAdmin";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Settings,
  Grid3x3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getOperators } from "@/lib/operators";
import { getEntitiesByOperator } from "@/lib/entities";

const OperadoresPage = () => {
  const router = useRouter();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  useEffect(() => {
    const fetchOperators = async () => {
      const data = await getOperators();

      // Fetch entity count for each operator
      const operatorsWithEntities = await Promise.all(
        data.map(async (op) => {
          const entitiesRes = await getEntitiesByOperator(op.id);
          return {
            ...op,
            entitiesCount: entitiesRes.success ? entitiesRes.data.length : 0,
          };
        })
      );

      setOperators(operatorsWithEntities);
      setLoading(false);
    };
    fetchOperators();
  }, []);

  const handleCreate = () => {
    router.push("/superAdmin/operadores/crear");
  };

  const filteredOperators = operators.filter((op) =>
    op.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full">
      <header className="flex items-center justify-between w-full mb-6">
        <h1 className="text-[40px] font-bold text-[#0E3C42]">
          Operadores Logísticos
        </h1>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#6A7EFF] hover:bg-[#5b6ef0] text-white px-6 py-3 rounded-full font-medium shadow-md transition"
        >
          <Plus size={20} />
          Crear Operador
        </button>
      </header>

      <div className="bg-white rounded-2xl p-6 mb-8  flex gap-4 mb-8">
        <div className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Busca por nombre"
            className="w-full outline-none text-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2 min-w-[200px]">
          <span className="text-gray-500">Ordenar por</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-auto text-gray-400"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              viewMode === "grid"
                ? "bg-white text-[#8B9DFF] shadow-sm"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 size={18} />
            <span className="text-sm font-medium">Vista tarjetas</span>
          </button>
          <div className="w-px bg-gray-300"></div>
          <button
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              viewMode === "list"
                ? "bg-white text-[#8B9DFF] shadow-sm"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("list")}
          >
            <List size={18} />
            <span className="text-sm font-medium">Vista lista</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando operadores...</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOperators.map((op) => (
            <div
              key={op.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative"
            >
              <div className="absolute top-6 right-6 w-10 h-10 bg-[#0E3C42] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {op.name?.charAt(0).toUpperCase()}
              </div>

              <h3 className="text-xl font-bold text-[#0E3C42] mb-4 pr-12">
                {op.name}
              </h3>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex gap-1">
                  <span className="text-gray-500">Entidades:</span>
                  <span className="font-semibold text-gray-800">
                    {op.entitiesCount || 0}
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="text-gray-500">Ciudad:</span>
                  <span className="font-semibold text-gray-800">
                    {op.city || "Sin ciudad"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push(`/superAdmin/operadores/${op.id}`)}
                className="mt-auto w-full py-2.5 bg-[#8B9DFF] hover:bg-[#7a8ce0] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Settings size={18} />
                Gestionar
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="py-4 px-6 font-bold text-[#0E3C42]">
                    Operador
                  </th>
                  <th className="py-4 px-6 font-bold text-[#0E3C42]">
                    Entidades
                  </th>
                  <th className="py-4 px-6 font-bold text-[#0E3C42]">Ciudad</th>
                  <th className="py-4 px-6 font-bold text-[#0E3C42]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOperators.map((op) => (
                  <tr
                    key={op.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">
                        {op.name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {op.entitiesCount || 0}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {op.city || "Sin ciudad"}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() =>
                          router.push(`/superAdmin/operadores/${op.id}`)
                        }
                        className="w-8 h-8 rounded-full bg-[#8B9DFF] flex items-center justify-center text-white hover:bg-[#7a8ce0]"
                        title="Gestionar"
                      >
                        <Settings size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default OperadoresPage;
