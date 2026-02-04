"use client";
import React, { useEffect, useState } from "react";
import EntityList from "./EntityList";
import CustomText from "../basics/CustomText";
import EntitiesSearchBar from "../searchBar/EntitiesSearchBar";

export default function EntitiesList({
  entities = [],
  onCreateEntity,
  onManageEntity,
  onCreateAssembly,
  onViewAssembly,
}) {
  const ITEMS_PER_PAGE = 6;

  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [processedEntities, setProcessedEntities] = useState(entities);

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch = entity.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      !filterType || String(entity.type) === String(filterType);
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    setProcessedEntities(entities);
  }, [entities]);

  return (
    <div className="space-y-6 w-full h-full">
      <EntitiesSearchBar
        entities={entities}
        onChange={setProcessedEntities}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {filteredEntities.length > 0 ? (
        <>
          <EntityList
            viewMode={viewMode}
            entities={processedEntities}
            onManageEntity={onManageEntity}
            onCreateAssembly={onCreateAssembly}
            onViewAssembly={onViewAssembly}
          />
        </>
      ) : (
        <div>
          <CustomText variant="labelL">No hay entidades</CustomText>
        </div>
      )}
    </div>
  );
}
