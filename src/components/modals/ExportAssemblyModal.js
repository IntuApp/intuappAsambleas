import React from "react";
import { Download, FileText, Printer, X } from "lucide-react";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function ExportAssemblyModal({
  isOpen,
  onClose,
  onExportReport,
  onExportVotes,
  onExportPowers,
  assemblyType,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl max-w-[500px] w-full p-8 shadow-xl animate-in fade-in zoom-in-95 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <CustomText
            variant="TitleL"
            as="h3"
            className="font-bold text-[#0E3C42]"
          >
            Exportar datos
          </CustomText>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <CustomButton
            variant="secondary"
            className="w-full py-4 px-6 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/50 flex items-center justify-start gap-4 transition-all"
            onClick={onExportReport}
          >
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
              <Printer size={20} />
            </div>
            <div className="text-left">
              <CustomText
                variant="labelL"
                className="font-bold text-emerald-900 block"
              >
                Exportar reporte general
              </CustomText>
              <CustomText variant="bodyS" className="text-emerald-700/80">
                Descarga un reporte completo de la asamblea
              </CustomText>
            </div>
            <div className="ml-auto">
              <CustomIcon
                path={ICON_PATHS.arrowRight}
                size={20}
                className="text-emerald-700"
              />
            </div>
          </CustomButton>

          <CustomButton
            variant="secondary"
            className="w-full py-4 px-6 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100/50 flex items-center justify-start gap-4 transition-all"
            onClick={onExportVotes}
          >
            <div className="bg-rose-100 p-2 rounded-lg text-rose-700">
              <FileText size={20} />
            </div>
            <div className="text-left">
              <CustomText
                variant="labelL"
                className="font-bold text-rose-900 block"
              >
                Exportar votaciones
              </CustomText>
              <CustomText variant="bodyS" className="text-rose-700/80">
                Descarga el detalle de todas las votaciones
              </CustomText>
            </div>
            <div className="ml-auto">
              <CustomIcon
                path={ICON_PATHS.arrowRight}
                size={20}
                className="text-rose-700"
              />
            </div>
          </CustomButton>

          {(assemblyType === "Virtual" || assemblyType === "Mixta") && (
            <CustomButton
              variant="secondary"
              className="w-full py-4 px-6 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/50 flex items-center justify-start gap-4 transition-all"
              onClick={onExportPowers}
            >
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                <Download size={20} />
              </div>
              <div className="text-left">
                <CustomText
                  variant="labelL"
                  className="font-bold text-indigo-900 block"
                >
                  Exportar poderes
                </CustomText>
                <CustomText variant="bodyS" className="text-indigo-700/80">
                  Descarga todos los poderes cargados
                </CustomText>
              </div>
              <div className="ml-auto">
                <CustomIcon
                  path={ICON_PATHS.arrowRight}
                  size={20}
                  className="text-indigo-700"
                />
              </div>
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}
