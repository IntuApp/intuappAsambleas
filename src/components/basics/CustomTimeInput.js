"use client";
import React from "react";
import CustomText from "@/components/basics/CustomText";

export default function CustomTimeInput({
  label,
  required,
  value = { hour: "00", minute: "00", ampm: "AM" },
  onChange,
}) {
  const sanitizeNumber = (val) => val.replace(/\D/g, "");

  const handleUpdate = (updates) => {
    onChange({ ...value, ...updates });
  };

  const validateHour = (val) => {
    if (val === "") return "";
    let num = parseInt(val, 10);
    if (num < 1) num = 1;
    if (num > 12) num = 12;
    return num.toString().padStart(2, "0");
  };

  const validateMinute = (val) => {
    if (val === "") return "00";
    let num = parseInt(val, 10);
    if (num < 0) num = 0;
    if (num > 59) num = 59;
    return num.toString().padStart(2, "0");
  };

  return (
    <div className="flex flex-col gap-2">
      <CustomText variant="labelM" className="text-[#333333] font-bold">
        {label} {required && <span className="text-red-500">*</span>}
      </CustomText>

      <div className="flex items-center gap-2">
        {/* Hora */}
        <div className="flex flex-col">
          <input
            type="text"
            maxLength={2}
            placeholder="00"
            value={value.hour}
            onChange={(e) => handleUpdate({ hour: sanitizeNumber(e.target.value).slice(0, 2) })}
            onBlur={(e) => handleUpdate({ hour: validateHour(e.target.value) })}
            className="max-w-[64px] h-[56px] border border-[#D3DAE0] font-bold text-[#000000] text-center text-[24px] rounded-lg hover:bg-[#EEF0FF] outline-none focus:border-[#94A2FF]"
          />
          <span className="text-[10px] text-[#333333] mt-1 text-center font-medium">Hora</span>
        </div>

        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-[56px]">
            <CustomText variant="TitleX" className="text-[#333333] font-bold">:</CustomText>
          </div>
        </div>

        {/* Minuto */}
        <div className="flex flex-col">
          <input
            type="text"
            maxLength={2}
            placeholder="00"
            value={value.minute}
            onChange={(e) => handleUpdate({ minute: sanitizeNumber(e.target.value).slice(0, 2) })}
            onBlur={(e) => handleUpdate({ minute: validateMinute(e.target.value) })}
            className="max-w-[64px] h-[56px] border border-[#D3DAE0] font-bold text-[#000000] text-center text-[24px] rounded-lg hover:bg-[#EEF0FF] outline-none focus:border-[#94A2FF]"
          />
          <span className="text-[10px] text-[#333333] mt-1 text-center font-medium">Minuto</span>
        </div>

        {/* AM / PM Selector */}
        <div className="flex flex-col h-full">
          <div className="flex flex-col flex-start items-start h-[56px]">
            {["AM", "PM"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleUpdate({ ampm: p })}
                className={`flex-1 px-3 text-[10px] font-bold transition-colors ${p === "AM" ? "rounded-t-lg border-b-0" : "rounded-b-lg"
                  } ${value.ampm === p
                    ? "bg-[#94A2FF] text-[#00093F]"
                    : "bg-[#EEF0FF] text-[#838383]"
                  } border border-[#D3DAE0]`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}