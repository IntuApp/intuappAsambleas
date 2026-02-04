"use client";
import React from "react";
import PropTypes from "prop-types";
import CustomText from "./CustomText";

export default function CustomSelect({
  label,
  className = "",
  classSelect = "",
  classLabel = "",
  variant,
  optional,
  children,
  ...rest
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex items-start gap-1">
          <CustomText variant={variant} className={`${classLabel} flex gap-1`}>
            {label} {!optional && <span className="text-red-500">*</span>}
          </CustomText>
          {optional && (
            <CustomText
              variant="labelS"
              className="text-[#838383] font-normal"
            >
              (opcional)
            </CustomText>
          )}
        </div>
      )}

      <select
        className={`
          w-full
          px-4 py-3
          border 
          border-[#D3DAE0]
          rounded-lg
          bg-white
          outline-none
          focus:border-[#000000]
          appearance-none
          ${classSelect}
        `}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
          backgroundSize: "1em",
        }}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}

CustomSelect.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  classSelect: PropTypes.string,
};
