import { ICON_PATHS } from "@/constans/iconPaths";

export const formatName = (name) => {
  if (!name) return "...";
  const names = name.split(" ").filter((n) => n.length > 0);
  const firstTwo = names.slice(0, 2);
  return firstTwo
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
    .join(" ");
};
export const formatDate = (dateString) => {
  if (!dateString || typeof dateString !== "string") return dateString;
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
    return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]}`;
  } catch (e) {
    return dateString;
  }
};

export const getIconPath = (entity) => {
  const type = (entity?.typeName || entity?.type || "").toLowerCase();

  console.log(type);

  if (type.includes("1")) return ICON_PATHS.sindicato;
  if (type.includes("2")) return ICON_PATHS.conjunto;
  if (type.includes("3")) return ICON_PATHS.empresa;
  if (type.includes("4")) return ICON_PATHS.cooperativa;

  return null;
};

export const getTypeName = (entity) => {
  const type = (entity?.typeName || entity?.type || "").toLowerCase();

  if (type.includes("1")) return "Sindicato";
  if (type.includes("2")) return "Conjunto Residencial";
  if (type.includes("3")) return "Empresa";
  if (type.includes("4")) return "Cooperativa";

  return null;
};

export const getIconTypeAssembly = (assembly) => {
  const type = (assembly?.typeName || assembly?.type || "").toLowerCase();

  if (type.includes("1")) return ICON_PATHS.sindicato;
  if (type.includes("2")) return ICON_PATHS.conjunto;
  if (type.includes("3")) return ICON_PATHS.empresa;
  if (type.includes("4")) return ICON_PATHS.cooperativa;

  return null;
};
