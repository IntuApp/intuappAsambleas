"use client";
import React from "react";
import CustomText from "@/components/basics/CustomText";

export default function CustomMultiSelect({
  label,
  optional,
  options = [],
  value = [],
  onChange,
}) {
  const toggle = (val) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className="mb-6">
      <CustomText variant="labelM" className="font-bold text-gray-700 mb-2">
        {label}{" "}
        {optional && (
          <span className="text-gray-400 text-sm">(opcional)</span>
        )}
      </CustomText>

      <div className="flex flex-col md:flex-row gap-4">
        {options.map((opt) => {
          const checked = value.includes(opt.value);

          return (
            <label
              key={opt.value}
              className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                checked
                  ? "border-[#4059FF] bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt.value)}
                className="w-4 h-4 accent-[#4059FF]"
              />

              <span
                className={`font-semibold ${
                  checked ? "text-[#0E3C42]" : "text-gray-500"
                }`}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
