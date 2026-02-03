"use client";
import React from "react";
import PropTypes from "prop-types";

const variantButton = {
  primary: `
    border-2 border-[#94A2FF]
    bg-[#94A2FF]
    text-[#00093F]

    hover:bg-[#94A2FF]
    hover:border-[#00093F]
  `,
  secondary: `
    border-2 border-[#0E3C42]
    bg-[#FFFFFF]
    text-[#0E3C42]

    hover:bg-[#ABE7E5]
    hover:border-[#0E3C42]
  `,
};

const disabledStyles = `
  border-2 border-[#D3DAE0]
  bg-[#D3DAE0]
  text-[#838383]
  cursor-not-allowed
  pointer-events-none
`;

export default function CustomButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        rounded-full transition-all duration-200
        ${className}
        ${disabled ? disabledStyles : variantButton[variant]}
      `}
    >
      {children}
    </button>
  );
}

CustomButton.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary"]),
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  disabled: PropTypes.bool,
};
