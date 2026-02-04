import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { Download, Upload, FileSpreadsheet, Trash2, Check } from "lucide-react";

import CustomInput from "@/components/basics/CustomInput";
import { ExcelEditor } from "@/components/basics/ExcelEditor";
import Button from "@/components/basics/Button"; // Standardized button

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

export default function CreateEntityForm({
  operatorId,
  representativeId,
  onCancel,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [entityTypes, setEntityTypes] = useState([]);

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

  // Excel State
  const [excelData, setExcelData] = useState([]);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [excelFileName, setExcelFileName] = useState("");

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
    };

    const resEntity = await createEntity(
      entityData,
      resAdmin.id,
      operatorId,
      representativeId,
    );

    if (resEntity.success) {
      toast.success("Entidad creada correctamente");
      if (onSuccess) onSuccess(resEntity);
    } else {
      toast.error("Error creando entidad");
    }
    setLoading(false);
  };

  return (
    <div className="gap-5 flex flex-col h-full">
      <div className="max-w-[1128px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5">
        <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">
          1. Datos de la Entidad
        </CustomText>
        <CustomText variant="bodyL" className="text-[#333333] font-regular">
          Ingrese los detalles básicos de la unidad privada:
        </CustomText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <CustomInput
            label="Nombre de la entidad"
            variant="labelM"
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={entityForm.name}
            onChange={(e) =>
              setEntityForm({ ...entityForm, name: e.target.value })
            }
            placeholder="Escribe aquí el nombre"
          />

          <CustomInput
            label="Nit"
            variant="labelM"
            optional
            className="max-w-[344px] max-h-[80px] "
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={entityForm.nit}
            onChange={(e) =>
              setEntityForm({ ...entityForm, nit: e.target.value })
            }
            placeholder="Escribe aquí el Nit"
          />
          <CustomSelect
            label="Tipo de entidad "
            variant="labelM"
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classSelect="text-[#838383] font-normal border-[#D3DAE0] "
            value={entityForm.type}
            onChange={(e) =>
              setEntityForm({ ...entityForm, type: e.target.value })
            }
          >
            <option value="">Selecciona aquí el tipo de unidad</option>
            {entityTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {getTypeNameInSpanish(type.name)}
              </option>
            ))}
          </CustomSelect>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <CustomSelect
            label="Ciudad"
            variant="labelM"
            optional
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classSelect="text-[#838383] font-normal border-[#D3DAE0] "
            value={entityForm.city}
            onChange={(e) =>
              setEntityForm({ ...entityForm, city: e.target.value })
            }
          >
            <option value="">Selecciona aquí la ciudad</option>
            {colombiaCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </CustomSelect>
          <CustomInput
            label="Dirección"
            variant="labelM"
            optional
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={entityForm.address}
            onChange={(e) =>
              setEntityForm({ ...entityForm, address: e.target.value })
            }
            placeholder="Escribe aquí la dirección"
          />
        </div>

        <div className="rounded-t border border-[#D3DAE0]"></div>

        <CustomText variant="bodyL" className="text-[#333333] font-regular">
          Ingrese los detalles básicos del administrador o funcionario de la
          entidad:
        </CustomText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CustomInput
            label="Nombre"
            variant="labelM"
            optional
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={entityForm.adminName}
            onChange={(e) =>
              setEntityForm({ ...entityForm, adminName: e.target.value })
            }
            placeholder="Escribe aquí el nombre"
          />
          <CustomInput
            label="Correo"
            variant="labelM"
            optional
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={entityForm.adminEmail}
            onChange={(e) =>
              setEntityForm({ ...entityForm, adminEmail: e.target.value })
            }
            placeholder="Escribe aquí el correo"
          />
          <CustomInput
            label="Número de celular"
            variant="labelM"
            optional
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={entityForm.adminPhone}
            onChange={(e) =>
              setEntityForm({ ...entityForm, adminPhone: e.target.value })
            }
            placeholder="Escribe aquí el número"
          />
        </div>
      </div>

      <div className="max-w-[1128px] w-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5">
        <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">
          2. Cargar Base de Datos de Asambleísta{" "}
        </CustomText>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2 flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#ABE7E5] flex items-center justify-center text-[#0E3C42] font-bold shrink-0">
                1
              </div>
              <CustomText
                variant="bodyM"
                className="text-[#333333] font-regular"
              >
                Descargue la plantilla y llénela con la información de los
                asambleístas.
              </CustomText>
            </div>
            <div className="max-w-[298px] max-h-[40px] w-full pl-10">
              <CustomButton
                className="flex items-center gap-2 px-4 py-2"
                variant="secondary"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href =
                    "https://drive.google.com/uc?export=download&id=1XxSZcO5Iaowek6WONif94qn4p9wi_WVQ";
                  link.download = "Plantilla_Asambleista_PH.xlsx";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download size={18} />
                <CustomText
                  variant="labelM"
                  className="text-[#0E3C42] font-bold"
                >
                  Descargar Plantilla Excel
                </CustomText>
              </CustomButton>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#ABE7E5] flex items-center justify-center text-[#0E3C42] font-bold shrink-0">
                2
              </div>
              <CustomText
                variant="bodyM"
                className="text-[#333333] font-regular"
              >
                Guarde el archivo en formato Excel (.xlsx).
              </CustomText>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex gap-2 flex-col">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#ABE7E5] flex items-center justify-center text-[#0E3C42] font-bold shrink-0">
                  3
                </div>
                <CustomText
                  variant="bodyM"
                  className="text-[#333333] font-regular"
                >
                  Cargue solo esa plantilla diligenciada. Otros formatos no
                  serán aceptados.
                </CustomText>
              </div>
              <div className="w-full pl-10">
                <div className="flex gap-6 flex-col lg:flex-row">
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Upload Box */}
                    <div className="border-2 border-dashed border-[#94A2FF] rounded-3xl relative">
                      <div className="flex flex-col items-center justify-center text-center max-w-[544px] w-full p-4 gap-4">
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <CustomIcon
                          path={ICON_PATHS.uploadFile}
                          size={32}
                          color="#6A7EFF"
                        />
                        <div className="flex flex-col gap-2 items-center">
                          <CustomText
                            variant="labelM"
                            className="text-[#242330] font-bold"
                          >
                            Arrastra y suelta aquí o
                          </CustomText>
                          <CustomButton
                            variant="primary"
                            className="rounded-full pointer-events-none max-w-[180px] max-h-[40px] w-full py-3 px-4"
                          >
                            <CustomText
                              variant="labelM"
                              className="text-[#000000] font-bold"
                            >
                              Selecciona el archivo
                            </CustomText>
                          </CustomButton>
                          <CustomText
                            variant="labelS"
                            className="text-[#3D3D44] font-regular"
                          >
                            Debe usar la misma plantilla descargada
                            anteriormente. Si usa otro archivo, el sistema no
                            reconocerá la información
                          </CustomText>
                        </div>
                      </div>
                    </div>

                    {/* File Card (if file uploaded) */}
                    {excelFileName && (
                      <div className="bg-[#FFFFFF] max-w-[320px] w-full border border-[#F3F6F9] shadow-soft rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center flex-col w-full">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <img
                                src="/icons/excel.png"
                                alt="Excel"
                                className="w-10 h-10"
                              />
                              <CustomText
                                variant="labelM"
                                className="text-[#3D3D44] font-bold"
                              >
                                {excelFileName}
                              </CustomText>
                            </div>

                            <CustomButton
                              onClick={() => {
                                setExcelData([]);
                                setExcelHeaders([]);
                                setExcelFileName("");
                              }}
                              className="bg-transparent border-none hover:bg-transparent"
                              title="Eliminar archivo"
                            >
                              <CustomIcon path={ICON_PATHS.delete} />
                            </CustomButton>
                          </div>
                          <div className="flex items-center gap-2 w-full">
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#5B9900] w-full rounded-full"></div>
                            </div>
                            <div className="bg-[#5B9900] text-[#FFFFFF] rounded-full p-0.5">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-start pt-4 border-t border-gray-100">
            <div
              className={`w-8 h-8 rounded-full ${excelData.length > 0 ? "bg-[#ABE7E5]" : "bg-[#D3DAE0] text-[#838383] border border-[#838383]"} flex items-center justify-center font-bold shrink-0`}
            >
              4
            </div>
            <div className="w-full">
              <CustomText
                variant="bodyM"
                className="text-[#333333] font-regular"
              >
                Verifique que los datos son correctos y edite los nombres de las
                columnas si es necesario. Si todo está bien, haga clic en Crear
                Entidad para continuar
              </CustomText>

              {excelData.length > 0 && (
                <div className="mt-4 animate-in fade-in duration-300">
                  <ExcelEditor
                    data={excelData}
                    setData={setExcelData}
                    headers={excelHeaders}
                    setHeaders={setExcelHeaders}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="secondary" size="L" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="L"
          onClick={handleCreateEntity}
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear Entidad"}
        </Button>
      </div>
    </div>
  );
}
