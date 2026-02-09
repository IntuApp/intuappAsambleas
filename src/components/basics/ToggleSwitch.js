"use client";
import { Check } from "lucide-react";

export default function ToggleSwitch({ checked, onChange, label, disabled }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer disabled:cursor-not-allowed">
      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>

      {/* INPUT */}
      <input
        type="checkbox"
        className="sr-only peer disabled:bg-gray-400 disabled:cursor-not-allowed"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />

      {/* CONTENEDOR */}
      <div
        className="
          relative
          w-14 h-8
          rounded-full
          border-2
          bg-white
          border-[#0E1B4D]
          transition-colors duration-300
          peer-checked:bg-[#4059FF]
          peer-checked:border-[#4059FF]
          flex items-center
          px-1
          disabled:bg-gray-400 disabled:cursor-not-allowed
        "
      >
        {/* BOLITA */}
        <div
          className="
            h-6 w-6
            rounded-full
            bg-[#0E1B4D]
            flex items-center justify-center
            transition-transform duration-300
            peer-checked:translate-x-full
            peer-checked:bg-white
            disabled:bg-gray-400 disabled:cursor-not-allowed
          "
        >
          {checked && (
            <Check
              size={14}
              className="text-[#4059FF] stroke-[3] disabled:stroke-gray-400"
            />
          )}
        </div>
      </div>
    </label>
  );
}
