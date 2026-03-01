"use client";
import { Check } from "lucide-react";

export default function ToggleSwitch({ checked, disabled }) {
  return (
    <div
      className={`
        relative w-14 h-8 rounded-full border-2 transition-all duration-300 flex items-center px-1
        ${checked ? "bg-[#4059FF] border-[#4059FF]" : "bg-white border-[#0E1B4D]"}
        ${disabled ? "bg-gray-300 border-gray-300 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* BOLITA */}
      <div
        className={`
          h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 transform
          ${checked ? "translate-x-5 bg-white" : "translate-x-0 bg-[#0E1B4D]"}
          ${disabled ? "bg-gray-400" : ""}
        `}
      >
        {checked && <Check size={14} className="text-[#4059FF] stroke-[3]" />}
      </div>
    </div>
  );
}