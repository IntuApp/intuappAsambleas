import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { Check } from "lucide-react";

import {
  validateExcelStructure,
  validateExcelTotals,
} from "@/lib/excelValidation";

import { createEntity, createAssemblyRegistriesList } from "@/lib/entities";

import { getEntityTypes } from "@/lib/masterData";

import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

import ConfirmationModal from "@/components/modals/ConfirmationModal";
import SuccessModal from "../modals/SuccessModal";

import EntityBasicDataStep from "./EntityBasicDataStep";
import EntityExcelUploadStep from "./EntityExcelUploadStep";

export default function CreateEntityForm({ operatorId, onCancel, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [entityTypes, setEntityTypes] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [excelFileName, setExcelFileName] = useState("");
  const [columnAliases, setColumnAliases] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEntity, setCreatedEntity] = useState(null);

  const [entityForm, setEntityForm] = useState({
    name: "",
    nit: "",
    type: "",
    city: "",
    address: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
  });

  const isCreateDisabled =
    loading ||
    !entityForm.name.trim() ||
    !entityForm.type ||
    !entityForm.address.trim() ||
    excelData.length === 0;

  /* =====================================================
     FETCH TYPES
  ===================================================== */

  useEffect(() => {
    const fetchTypes = async () => {
      const res = await getEntityTypes();
      if (res.success) {
        setEntityTypes(res.data);
      }
    };
    fetchTypes();
  }, []);

  const getTypeNameInSpanish = (typeName) => {
    const translations = {
      Residential: "Residencial",
      Commercial: "Comercial",
      Mixed: "Mixto",
      "Horizontal Property": "Propiedad Horizontal",
    };
    return translations[typeName] || typeName;
  };

  /* =====================================================
     EXCEL UPLOAD
  ===================================================== */

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];

      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (rawData.length === 0) {
        toast.error("El archivo está vacío");
        return;
      }

      const headers = rawData[0];
      const data = XLSX.utils.sheet_to_json(ws);

      const validation = validateExcelStructure(data);

      setExcelHeaders(headers);
      setExcelData(data);
      setExcelFileName(file.name);

      if (!validation.valid) {
        toast.warn("El archivo tiene filas incompletas.");
      } else {
        toast.success("Archivo cargado correctamente.");
      }
    };

    reader.readAsBinaryString(file);
  };

  /* =====================================================
     CREATE FLOW
  ===================================================== */

  const handleConfirmCreate = async () => {
    setShowConfirmationModal(false);
    await handleCreateEntity();
  };

  const handleCreateEntity = async () => {
    if (!entityForm.name || !entityForm.type) {
      toast.warn(
        "Por favor complete los campos obligatorios: Nombre y Tipo de entidad",
      );
      return;
    }

    if (excelData.length === 0) {
      toast.warn(
        "Debe cargar la base de datos de asambleístas para crear la entidad.",
      );
      return;
    }

    setLoading(true);

    const structureVal = validateExcelStructure(excelData);
    if (!structureVal.valid) {
      toast.error("Error en estructura del archivo Excel.");
      setLoading(false);
      return;
    }

    const totalVal = validateExcelTotals(excelData);
    if (!totalVal.valid) {
      toast.error("Error en los coeficientes del Excel.");
      setLoading(false);
      return;
    }

    /* 1️⃣ Crear Assembly Registries */
    const resRegistries = await createAssemblyRegistriesList(excelData);

    if (!resRegistries.success) {
      toast.error("Error al guardar la base de datos de asambleístas");
      setLoading(false);
      return;
    }

    // Normalizar aliases
    const normalizedColumnAliases = {};

    excelHeaders.forEach((header) => {
      const alias = columnAliases?.[header];

      // Solo guardar alias si es diferente al header original
      if (alias && alias.trim() && alias.trim() !== header) {
        normalizedColumnAliases[header] = alias.trim();
      }
    });
    const assemblyRegistriesListId = resRegistries.id;

    /* 2️⃣ Crear Entity con admin embebido */
    const entityData = {
      name: entityForm.name,
      nit: entityForm.nit,
      type: entityForm.type,
      city: entityForm.city,
      address: entityForm.address,
      databaseStatus: "done",
      assemblyRegistriesListId,

      // Guardar headers reales
      headers: excelHeaders,

      // Guardar solo aliases distintos
      columnAliases: normalizedColumnAliases,

      adminEntity: {
        name: entityForm.adminName,
        email: entityForm.adminEmail,
        phone: entityForm.adminPhone,
      },
    };

    const resEntity = await createEntity(entityData, operatorId);

    if (resEntity.success) {
      setCreatedEntity(resEntity);
      setShowSuccessModal(true);
    } else {
      toast.error("Error creando entidad");
    }

    setLoading(false);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="gap-5 flex flex-col h-full">
      <ConfirmationModal
        entityForm={entityForm}
        isOpen={showConfirmationModal}
        confirmText="Si"
        cancelText="Cancelar"
        onConfirm={handleConfirmCreate}
        onClose={() => setShowConfirmationModal(false)}
        title="¿Registrar nueva entidad?"
        message="Podrás completar o modificar su información más adelante."
      />

      <SuccessModal
        isOpen={showSuccessModal}
        message="La entidad ha sido creada correctamente."
        onConfirm={() => {
          setShowSuccessModal(false);
          if (onSuccess && createdEntity) {
            onSuccess(createdEntity);
          }
        }}
      />

      <EntityBasicDataStep
        entityForm={entityForm}
        setEntityForm={setEntityForm}
        entityTypes={entityTypes}
        getTypeNameInSpanish={getTypeNameInSpanish}
      />

      <EntityExcelUploadStep
        handleFileUpload={handleFileUpload}
        excelData={excelData}
        setExcelData={setExcelData}
        excelHeaders={excelHeaders}
        setExcelHeaders={setExcelHeaders}
        excelFileName={excelFileName}
        setExcelFileName={setExcelFileName}
        columnAliases={columnAliases}
        setColumnAliases={setColumnAliases}
      />

      <div className="flex justify-end gap-4 mt-8">
        <CustomButton
          variant="secondary"
          size="L"
          className="px-4 py-2 border-[2px]"
          onClick={onCancel}
        >
          <CustomText variant="labelL" className="font-bold text-[#0E3C42]">
            Cancelar
          </CustomText>
        </CustomButton>

        <CustomButton
          variant="primary"
          className="py-3 px-4 flex gap-2"
          onClick={() => setShowConfirmationModal(true)}
          disabled={isCreateDisabled}
        >
          <CustomIcon path={ICON_PATHS.check} size={24} />
          <CustomText variant="labelL" className="font-bold">
            Crear Entidad
          </CustomText>
        </CustomButton>
      </div>
    </div>
  );
}
