import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { Download, Upload, FileSpreadsheet, Trash2, Check } from "lucide-react";

import CustomInput from "@/components/basics/CustomInput";
import { ExcelEditor } from "@/components/basics/ExcelEditor";

import {
  validateExcelStructure,
  validateExcelTotals,
} from "@/lib/excelValidation";
import {
  createEntity,
  createEntityAdmin,
  createAssemblyRegistriesList,
} from "@/lib/entities";
import { getEntityTypes } from "@/lib/masterData";
import { colombiaCities } from "@/lib/colombiaCities";
import CustomText from "../basics/CustomText";
import CustomSelect from "../basics/CustomSelect";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/app/constans/iconPaths";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import SuccessModal from "../modals/SuccessModal";
import EntityBasicDataStep from "./EntityBasicDataStep";
import EntityExcelUploadStep from "./EntityExcelUploadStep";

export default function CreateEntityForm({
  operatorId,
  representativeId,
  onCancel,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [entityTypes, setEntityTypes] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [excelFileName, setExcelFileName] = useState("");
  const [columnAliases, setColumnAliases] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEntity, setCreatedEntity] = useState(null);

  // Form State
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

  const handleFileUpload = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (rawData.length === 0) {
        toast.error("El archivo está vacío");
        return;
      }
      const headers = rawData[0];
      const data = XLSX.utils.sheet_to_json(ws);

      const rowValidation = validateExcelStructure(data);

      setExcelHeaders(headers);
      setExcelData(data);
      setExcelFileName(file.name);

      if (!rowValidation.valid) {
        toast.warn(
          <div>
            <p className="font-bold">Advertencia: Datos incompletos</p>
            <ul className="list-disc pl-4 text-xs max-h-20 overflow-y-auto mt-2 text-yellow-800">
              {rowValidation.errors.slice(0, 3).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {rowValidation.errors.length > 3 && <li>...</li>}
            </ul>
          </div>,
          { autoClose: 10000 },
        );
      } else {
        toast.success("Archivo cargado. Verifique los datos en el paso 4.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmCreate = async () => {
    setShowConfirmationModal(false);
    await handleCreateEntity();
  };

  const handleCreateEntity = async () => {
    // Validations
    if (!entityForm.name || !entityForm.type) {
      toast.warn(
        "Por favor complete los campos obligatorios: Nombre de la entidad, Tipo de entidad y Ciudad",
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
      toast.error(
        <div>
          <p className="font-bold">Error en estructura de datos:</p>
          <ul className="list-disc pl-4 text-sm max-h-40 overflow-y-auto">
            {structureVal.errors.slice(0, 10).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>,
      );
      setLoading(false);
      return;
    }

    const totalVal = validateExcelTotals(excelData);
    if (!totalVal.valid) {
      toast.error(
        <div>
          <p className="font-bold">Error en coeficientes:</p>
          <ul className="list-disc pl-4 text-sm">
            {totalVal.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>,
      );
      setLoading(false);
      return;
    }

    // 1. Create Assembly Registry List
    let assemblyRegistriesListId = null;
    if (excelData.length > 0) {
      const resRegistries = await createAssemblyRegistriesList(excelData);
      if (resRegistries.success) {
        assemblyRegistriesListId = resRegistries.id;
      } else {
        toast.error("Error al guardar la base de datos de asambleístas");
        setLoading(false);
        return;
      }
    }

    // 2. Create Entity Admin
    const adminData = {
      name: entityForm.adminName,
      email: entityForm.adminEmail,
      phone: entityForm.adminPhone,
      role: "admin_entity",
    };

    const resAdmin = await createEntityAdmin(adminData);

    if (!resAdmin.success) {
      toast.error("Error creando administrador de la entidad");
      setLoading(false);
      return;
    }

    // 3. Create Entity
    const entityData = {
      name: entityForm.name,
      nit: entityForm.nit,
      type: entityForm.type,
      city: entityForm.city,
      address: entityForm.address,
      databaseStatus: "done",
      assemblyRegistriesListId: assemblyRegistriesListId,
      columnAliases: columnAliases || {}, // Save aliases
    };

    const resEntity = await createEntity(
      entityData,
      resAdmin.id,
      operatorId,
      representativeId,
    );

    if (resEntity.success) {
      setCreatedEntity(resEntity);
      setShowSuccessModal(true);
    } else {
      toast.error("Error creando entidad");
    }

    setLoading(false);
  };

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
        message={`Podrás completar o modificar su información más adelante.`}
      />
      <SuccessModal
        isOpen={showSuccessModal}
        message="La entidad ha sido creada y guardada correctamente. Ahora puedes añadir asambleas o gestionar sus datos."
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
