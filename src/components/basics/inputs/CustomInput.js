"use client";
import React from "react";
import PropTypes from "prop-types";
import CustomText from "../CustomText";

/**
 * CustomInput - campo de texto reutilizable con label y estilos personalizados.
 * @param {string} label - etiqueta del campo
 * @param {string} placeholder - texto de ayuda dentro del input
 * @param {string} className - clases adicionales (Tailwind u otras)
 * @param {object} rest - cualquier otra prop estándar de input (onChange, value, type, etc.)
 */
export default function CustomInput({
  label,
  placeholder,
  className = "",
  classInput,
  classLabel,
  variant,
  optional,
  ...rest
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-start gap-1">
        {label && (
          <div className="flex items-center gap-1">
            <CustomText
              variant={variant}
              className={`${classLabel} flex gap-1`}
            >
              {label} {!optional && <span className="text-red-500">*</span>}
            </CustomText>
            {optional && (
              <CustomText
                variant="labelS"
                className="text-[#838383] font-normal items-start"
              >
                (opcional)
              </CustomText>
            )}
          </div>
        )}
      </div>
      <input
        placeholder={placeholder}
        className={`
         leading-[24px] text-[#838383] font-normal
        ${classInput}`}
        {...rest}
      />
    </div>
  );
}

CustomInput.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};
