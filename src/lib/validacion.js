// src/lib/assemblyValidations.js

/* =========================
   Fechas y horas
========================= */

export const parseHour = (hourString) => {
  let hour = "08";
  let minute = "00";
  let ampm = "AM";

  if (hourString) {
    const match = hourString.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (match) {
      hour = match[1].padStart(2, "0");
      minute = match[2];
      ampm = match[3].toUpperCase();
    }
  }

  return { hour, minute, ampm };
};

export const buildHourString = ({ hour, minute, ampm }) =>
  `${hour}:${minute} ${ampm}`;

export const isFutureDateTime = ({ date, hour, minute, ampm }) => {
  const now = new Date();
  let h = parseInt(hour);

  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;

  const [year, month, day] = date.split("-").map(Number);
  const dt = new Date(year, month - 1, day, h, parseInt(minute));

  return dt > now;
};

/* =========================
   Validaciones de formulario
========================= */

export const validateAssemblyForm = (formData) => {
  if (!formData.name) return "El nombre es requerido";
  if (!formData.date) return "La fecha es requerida";

  if (formData.type === "Virtual" && !formData.meetLink) {
    return "El link de videollamada es requerido";
  }

  if (!isFutureDateTime(formData)) {
    return "La fecha y hora deben ser futuras";
  }

  return null;
};
