'use client';
import React from 'react';
import PropTypes from 'prop-types';
import CustomText from './CustomText';

/**
 * CustomInput - campo de texto reutilizable con label y estilos personalizados.
 * @param {string} label - etiqueta del campo
 * @param {string} placeholder - texto de ayuda dentro del input
 * @param {string} className - clases adicionales (Tailwind u otras)
 * @param {object} rest - cualquier otra prop estándar de input (onChange, value, type, etc.)
 */
export default function CustomInput({ label, placeholder, className = '', classInput, classLabel, variant, ...rest }) {
  return (
    <div className={`flex flex-col  ${className}`}>
      {label && (
        <CustomText variant={variant} className={classLabel}>
          {label}
        </CustomText>
      )}
      <input
        placeholder={placeholder}
        className={`
          text-[18px] leading-[24px] text-[#838383] font-normal
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
