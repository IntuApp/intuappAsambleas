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
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import OperatorsList from "@/components/operators/OperatorsList";

const OperadoresPage = () => {
  const router = useRouter();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  useEffect(() => {
    const fetchOperators = async () => {
      const data = await getOperators();
      setOperators(data.data);
      setLoading(false);
    };
    fetchOperators();
  }, []);

  const filteredOperators = operators.filter((op) =>
    op.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <CustomText variant="TitleX" className="text-[#0E3C42] font-bold">
          Operadores Logísticos
        </CustomText>
        <CustomButton
          variant="primary"
          className="py-3 px-4 flex gap-2"
          onClick={() => router.push("/superAdmin/operadores/crear")}
        >
          <CustomIcon path={ICON_PATHS.add} size={24} />
          <CustomText variant="labelL" className="font-bold">
            Crear Operador
          </CustomText>
        </CustomButton>
      </div>
      <OperatorsList
        operators={filteredOperators}
        loading={loading}
        onManageOperator={(operator) =>
          router.push(`/superAdmin/operadores/${operator.id}`)
        }
      />
    </div>
  );
};
export default OperadoresPage;
