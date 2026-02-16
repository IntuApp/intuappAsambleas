"use client";
import React, { useEffect, useState } from "react";
import OperatorList from "./OperatorList";
import CustomText from "../basics/CustomText";
import OperatorsSearchBar from "../searchBar/OperatorsSearchBar";

export default function OperatorsList({
  operators = [],
  onCreateEntity,
  onManageOperator,
  onCreateAssembly,
  onViewAssembly,
}) {
  const ITEMS_PER_PAGE = 6;

  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [processedOperators, setProcessedOperators] = useState(operators);

  const filteredOperators = operators.filter((operator) => {
    const matchesSearch = operator.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      !filterType || String(operator.type) === String(filterType);
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    setProcessedOperators(operators);
  }, [operators]);

  return (
    <div className="space-y-6 w-full h-full">
      <OperatorsSearchBar
        operators={operators}
        onChange={setProcessedOperators}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {filteredOperators.length > 0 ? (
        <>
          <OperatorList
            viewMode={viewMode}
            operators={processedOperators}
            onManageOperator={onManageOperator}
            onCreateAssembly={onCreateAssembly}
            onViewAssembly={onViewAssembly}
          />
        </>
      ) : (
        <div>
          <CustomText variant="labelL">No hay Operarios</CustomText>
        </div>
      )}
    </div>
  );
}
