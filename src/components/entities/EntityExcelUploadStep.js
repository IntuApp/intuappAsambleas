import {
  Download,
  Upload,
  Trash2,
  FileSpreadsheet,
  Check,
  Bot,
} from "lucide-react";
import { ExcelEditor } from "@/components/basics/ExcelEditor";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/app/constans/iconPaths";
import { useEffect } from "react";

export default function EntityExcelUploadStep({
  handleFileUpload,
  excelData,
  setExcelData,
  excelHeaders,
  setExcelHeaders,
  excelFileName,
  setExcelFileName,
  columnAliases,
  setColumnAliases,
}) {
  useEffect(() => {
    console.log("Excel data:", excelData);
  }, [excelData]);
  return (
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
            <CustomText variant="bodyM" className="text-[#333333] font-regular">
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
              <CustomText variant="labelM" className="text-[#0E3C42] font-bold">
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
            <CustomText variant="bodyM" className="text-[#333333] font-regular">
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
                Cargue solo esa plantilla diligenciada. Otros formatos no serán
                aceptados.
              </CustomText>
            </div>
            <div className="w-full pl-10">
              <div className="flex gap-6 flex-col lg:flex-row">
                <div className="flex-1 flex flex-col gap-4">
                  {/* Upload Box */}
                  <div className=" flex flex-col items-center justify-center text-center max-w-[574px] w-full p-4 gap-4 border-2 border-dashed border-[#94A2FF] rounded-3xl relative">
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
                    <div className="flex flex-col gap-2 items-center w-full">
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
                        className="text-[#3D3D44] font-medium"
                      >
                        Debe usar la misma plantilla descargada anteriormente.
                        Si usa otro archivo, el sistema no reconocerá la
                        información
                      </CustomText>
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
            <CustomText variant="bodyM" className="text-[#333333] font-regular">
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
                  columnAliases={columnAliases}
                  setColumnAliases={setColumnAliases}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
