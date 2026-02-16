import React from "react";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomIcon from "@/components/basics/CustomIcon";
import CustomText from "../basics/CustomText";
import AssemblyStatus from "../assemblies/AssemblyStatus";

export default function ListItem({
  overline, // Top small text
  title, // Main text
  subtitle, // Bottom text
  entity, // Entity object (alternative to title/subtitle)
  status, // { text, color, dot }
  date,
  onClick,
  isAssamblea,
  showNextAssembly = false,
  classContainer = "",
  iconArrow = false,
}) {
  const getIconPath = () => {
    const type = (entity?.typeName || entity?.type || "").toLowerCase();

    if (
      type.includes("propiedad") ||
      type.includes("horizontal") ||
      type.includes("residencial") ||
      type.includes("conjunto")
    )
      return ICON_PATHS.conjunto;

    if (type.includes("sindicato")) return ICON_PATHS.sindicato;
    if (type.includes("empresa")) return ICON_PATHS.empresa;
    if (type.includes("cooperativa")) return ICON_PATHS.cooperativa;

    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== "string") return dateString;

    // Matches YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return dateString;

    try {
      const months = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      const [, month, day] = dateString.split("-");
      const monthIndex = parseInt(month, 10) - 1;
      return `${parseInt(day, 10)} ${months[monthIndex]}`;
    } catch (e) {
      return dateString;
    }
  };

  const displayStatusText = formatDate(date);

  return (
    <div onClick={onClick} className={`flex items-center ${classContainer}`}>
      <div className="flex items-center gap-4 flex-1 ">
        {getIconPath() && (
          <div className="w-14 h-14 p-2 rounded-lg bg-[#EEF0FF] flex items-center justify-center shrink-0 overflow-hidden">
            {getIconPath() ? (
              <CustomIcon
                path={getIconPath()}
                size={40}
                className="text-[#6A7EFF]"
              />
            ) : (
              ""
            )}
          </div>
        )}

        <div className="flex-1 min-w-0 ">
          {overline && (
            <p className="text-xs text-gray-500 truncate">{overline}</p>
          )}

          <CustomText variant="labelL" className="text-[#000000] font-bold truncate">
            {entity?.name || title}
          </CustomText>

          {(entity?.typeName || entity?.type || subtitle) && (
            <CustomText variant="labelM" className="text-[#3D3D44] font-medium truncate">
              {entity?.typeName || entity?.type || subtitle}
              {showNextAssembly && (
                <>
                  {entity?.nextAssembly?.date ? (
                    <>
                      {" "}
                      · Próxima asamblea: {formatDate(entity.nextAssembly.date)}
                    </>
                  ) : (
                    <> · Sin asambleas programadas</>
                  )}
                </>
              )}
            </CustomText>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pl-2">
        {status && !isAssamblea && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 bg-[#FACCCD]`}
          >
            <CustomIcon path={ICON_PATHS.record} size={16} color="#930002" />

            <CustomText variant="labelM" className="text-[#930002] font-bold">
              {displayStatusText}
            </CustomText>
          </span>
        )}
        {status && isAssamblea && (
          <AssemblyStatus status={status} date={displayStatusText} />
        )}
      </div>
      <div>
        {iconArrow && (
          <CustomIcon path={ICON_PATHS.arrowRight} size={16} color="#000000" />
        )}
      </div>
    </div>
  );
}
