"use client";
import React from "react";
import CustomText from "@/components/basics/CustomText";

export default function CustomOptionSelect({
  label,
  required,
  options = [],
  value,
  onChange,
  classContentOptions,
}) {
  return (
    <div className="mb-6">
      <CustomText variant="labelM" className="font-bold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </CustomText>

      <div className={`flex flex-col md:flex-row gap-4 ${classContentOptions}`}>
        {options.map((opt) => {
          const selected = value === opt.value;

          return (
            <label
              key={opt.value}
              className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                selected
                  ? "border-[#4059FF] bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selected ? "border-[#4059FF]" : "border-gray-300"
                }`}
              >
                {selected && (
                  <div className="w-3 h-3 rounded-full bg-[#4059FF]" />
                )}
              </div>

              <span
                className={`font-semibold ${
                  selected ? "text-[#0E3C42]" : "text-gray-500"
                }`}
              >
                {opt.label}
              </span>

              <input
                type="radio"
                className="hidden"
                checked={selected}
                onChange={() => onChange(opt.value)}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
