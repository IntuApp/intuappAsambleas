"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { toast } from "react-toastify"; // Asegúrate de tenerlo instalado
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import EntityBasicDataStep from "@/components/entities/EntityBasicDataStep";
import EntityExcelUploadStep from "@/components/entities/EntityExcelUploadStep";
import { createEntityWithRegistry } from "@/lib/entityActions";
import SuccessModal from "@/components/modal/SuccessModal";

const entityTypes = [
  { id: "1", name: "Sindicato" },
  { id: "2", name: "Propiedad Horizontal" },
  { id: "3", name: "Empresa" },
  { id: "4", name: "Cooperativa" },
];

export default function CrearEntidadPage() {
  const router = useRouter();
  const { operatorId } = useParams();

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
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // 1. Convertimos a JSON omitiendo celdas vacías
        const rawData = XLSX.utils.sheet_to_json(ws, { defval: null });

        if (rawData.length > 0) {
          // 2. Extraemos los headers REALES (evitamos las columnas vacías del archivo 2)
          const allKeys = Object.keys(rawData[0]);
          const realHeaders = allKeys.filter(key =>
            !key.startsWith("__EMPTY") &&
            key.trim() !== ""
          );

          // 3. Limpieza de filas: Solo columnas reales y filas con texto
          const cleanData = rawData
            .map(row => {
              let newRow = {};
              realHeaders.forEach(header => {
                newRow[header] = row[header];
              });
              return newRow;
            })
            .filter(row => {
              return Object.values(row).some(v => v !== null && String(v).trim() !== "");
            });

          // 4. Inicializar Aliases (Importante para que no salgan vacíos)
          const initialAliases = {};
          realHeaders.forEach(h => {
            initialAliases[h] = h;
          });

          setExcelHeaders(realHeaders);
          setExcelData(cleanData);
          setColumnAliases(initialAliases);

          toast.success("Archivo procesado correctamente");
        } else {
          toast.error("El archivo está vacío.");
        }
      } catch (error) {
        console.error("Error al leer Excel:", error);
        toast.error("Error procesando el archivo Excel");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  // ENVÍO FINAL A FIREBASE
  const handleSubmit = async () => {
    setErrorMsg("");

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
      // Clonamos la data para evitar referencias circulares
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
      console.error("Error en submit:", error);
      setErrorMsg(error.message || "Ocurrió un error al crear la entidad.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <SuccessModal
        isOpen={showSuccessModal}
        title="¡Entidad creada con éxito!"
        message="La entidad y su base de datos han sido configuradas correctamente."
        buttonText="Volver al Operador"
        onConfirm={() => router.push(`/admin/operadores/${operatorId}`)}
      />

      <div className="flex flex-col">
        <CustomText variant="TitleX" className="text-[#0E3C42] font-bold">
          Crear Entidad
        </CustomText>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
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

      {/* BOTONES DE ACCIÓN */}
      <div className="flex justify-end gap-4 mt-4">
        <CustomButton
          variant="secondary"
          className="px-8 py-3 border-[2px] rounded-full"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          <CustomText variant="labelL" className="font-bold text-[#0E3C42]">
            Cancelar
          </CustomText>
        </CustomButton>

        <CustomButton
          variant="primary"
          className="py-3 px-8 flex items-center justify-center gap-2 rounded-full"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {!isLoading && <CustomIcon path={ICON_PATHS.check} size={20} color="#00093F" />}
          <CustomText variant="labelL" className="font-bold">
            {isLoading ? "Procesando..." : "Crear Entidad"}
          </CustomText>
        </CustomButton>
      </div>
    </div>
  );
}