"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx"; // Importamos la librería para leer Excel
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import EntityBasicDataStep from "@/components/entities/EntityBasicDataStep";
import EntityExcelUploadStep from "@/components/entities/EntityExcelUploadStep";
import { createEntityWithRegistry } from "@/lib/entityActions";
import SuccessModal from "@/components/modal/SuccessModal";

// Tipos de entidad "hardcodeados" según tu imagen de BD. (Podrías traerlos de FB también)
const entityTypes = [
  { id: "1", name: "Sindicato" },
  { id: "2", name: "Propiedad Horizontal" },
  { id: "3", name: "Empresa" },
  { id: "4", name: "Cooperativa" },
];

export default function CrearEntidadPage() {
  const router = useRouter();
  const { operatorId } = useParams(); // ID del operador desde la URL
  console.log(operatorId);

  // Estados del Formulario Básico
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

  // Estados del Excel
  const [excelData, setExcelData] = useState([]);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [excelFileName, setExcelFileName] = useState("");
  const [columnAliases, setColumnAliases] = useState({});

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // LOGICA PARA LEER EL EXCEL AL SUBIRLO
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      // Convertimos la hoja a JSON. defval: "" evita que ignore celdas vacías
      const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

      if (data.length > 0) {
        setExcelHeaders(Object.keys(data[0]));
        setExcelData(data);
      } else {
        setErrorMsg("El archivo Excel está vacío.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // ENVÍO FINAL A FIREBASE
  const handleSubmit = async () => {
    setErrorMsg("");

    // Validaciones estrictas
    if (!entityForm.name || !entityForm.type) {
      setErrorMsg("El nombre de la entidad y el tipo son obligatorios.");
      return;
    }
    if (excelData.length === 0) {
      setErrorMsg("Debes cargar una base de datos de asambleístas válida.");
      return;
    }

    setIsLoading(true);
    try {
      // Asegurar que la información a enviar al backend sean objetos planos
      const plainExcelData = JSON.parse(JSON.stringify(excelData));

      const result = await createEntityWithRegistry(
        operatorId,
        entityForm,
        plainExcelData,
        columnAliases,
        excelHeaders
      );

      if (result.success) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full ">

      <SuccessModal
        isOpen={showSuccessModal}
        title="¡Entidad creada con éxito!"
        message="La entidad y su base de datos han sido configuradas."
        buttonText="Volver al Operador"
        onConfirm={() => router.push(`/admin/operadores/${operatorId}`)}
      />

      <div className="flex flex-col">
        <CustomText variant="TitleX" className="text-[#0E3C42] font-bold">
          Crear Entidad
        </CustomText>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl font-bold">
          {errorMsg}
        </div>
      )}

      {/* COMPONENTE 1: DATOS BÁSICOS */}
      <EntityBasicDataStep
        entityForm={entityForm}
        setEntityForm={setEntityForm}
        entityTypes={entityTypes}
      />

      {/* COMPONENTE 2: EXCEL Y ALIASES */}
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

      {/* BOTONES DE ACCIÓN (Cancel / Create) */}
      <div className="flex justify-end gap-4 mt-4">
        <CustomButton
          variant="secondary"
          className="px-6 py-3 border-[2px] rounded-full"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          <CustomText variant="labelL" className="font-bold text-[#0E3C42]">
            Cancelar
          </CustomText>
        </CustomButton>

        <CustomButton
          variant="primary"
          className="py-3 px-6 flex items-center justify-center gap-2 rounded-full"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          <CustomIcon path={ICON_PATHS.check} size={24} color="#00093F" />
          <CustomText variant="labelL" className="font-bold">
            {isLoading ? "Creando Entidad..." : "Crear Entidad"}
          </CustomText>
        </CustomButton>
      </div>

    </div>
  );
}