export const getRequiredKeys = (keys) => {
  const propertyKey = keys.find(
    (k) =>
      k.toLowerCase().includes("propiedad") ||
      k.toLowerCase().includes("nombre")
  );
  const coefficientKey = keys.find(
    (k) =>
      k.toLowerCase().includes("coeficiente") ||
      k.toLowerCase().includes("participación")
  );
  return { propertyKey, coefficientKey };
};

export const validateExcelStructure = (data) => {
  const errors = [];
  if (!data || data.length === 0) {
    return { valid: false, errors: ["El archivo está vacío"] };
  }

  const firstRow = data[0];
  const keys = Object.keys(firstRow);
  const { propertyKey, coefficientKey } = getRequiredKeys(keys);

  if (!propertyKey || !coefficientKey) {
    return {
      valid: false,
      errors: [
        "No se encontraron las columnas obligatorias: 'Propiedad o nombre del asociado' y 'Coeficiente o % de participación'.",
      ],
    };
  }

  // Row validation
  data.forEach((row, index) => {
    const rowNum = index + 2;
    const property = row[propertyKey];
    const coefficient = row[coefficientKey];

    const hasProperty =
      property !== undefined &&
      property !== null &&
      property.toString().trim() !== "";
    const hasCoefficient =
      coefficient !== undefined &&
      coefficient !== null &&
      coefficient.toString().trim() !== "";

    if (!hasProperty && !hasCoefficient) {
      // Empty row
    } else if (hasProperty && !hasCoefficient) {
      errors.push(`Fila ${rowNum}: Tiene Propiedad pero falta el Coeficiente.`);
    } else if (!hasProperty && hasCoefficient) {
      errors.push(`Fila ${rowNum}: Tiene Coeficiente pero falta la Propiedad.`);
    } else {
      const coefValue = parseFloat(coefficient);
      if (isNaN(coefValue)) {
        errors.push(`Fila ${rowNum}: El coeficiente no es un número válido.`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateExcelTotals = (data) => {
  const errors = [];
  let totalCoefficient = 0;

  if (!data || data.length === 0) return { valid: false, errors: [] };

  const firstRow = data[0];
  const keys = Object.keys(firstRow);
  const { coefficientKey } = getRequiredKeys(keys);

  if (!coefficientKey)
    return { valid: false, errors: ["Falta columna de coeficientes"] };

  data.forEach((row) => {
    const coefficient = row[coefficientKey];
    if (coefficient !== undefined && coefficient !== null) {
      const val = parseFloat(coefficient);
      if (!isNaN(val)) {
        totalCoefficient += val;
      }
    }
  });

  // Range 98 - 100.5
  if (totalCoefficient < 98 || totalCoefficient > 100.5) {
    errors.push(
      `La suma total de coeficientes es ${totalCoefficient.toFixed(
        4
      )}. Debe estar entre 98 y 100.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Legacy support if needed, or composite
export const validateExcelData = (data) => {
  const structure = validateExcelStructure(data);
  const totals = validateExcelTotals(data);
  return {
    valid: structure.valid && totals.valid,
    errors: [...structure.errors, ...totals.errors],
  };
};
