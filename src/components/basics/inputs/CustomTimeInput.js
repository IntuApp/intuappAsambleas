"use client";
import React from "react";
import CustomText from "@/components/basics/CustomText";

export default function CustomTimeInput({
  label,
  required,
  value = { hour: "", minute: "", ampm: "AM" },
  onChange,
}) {
  const sanitizeNumber = (val) => val.replace(/\D/g, "");

  const handleHourChange = (e) => {
    let val = sanitizeNumber(e.target.value).slice(0, 2);
    onChange({ ...value, hour: val });
  };

  const handleHourBlur = () => {
    if (value.hour === "") return;

    let num = parseInt(value.hour, 10);
    if (num < 1) num = 1;
    if (num > 12) num = 12;

    onChange({ ...value, hour: num.toString().padStart(2, "0") });
  };

  const handleMinuteChange = (e) => {
    let val = sanitizeNumber(e.target.value).slice(0, 2);
    onChange({ ...value, minute: val });
  };

  const handleMinuteBlur = () => {
    if (value.minute === "") return;

    let num = parseInt(value.minute, 10);
    if (num < 0) num = 0;
    if (num > 59) num = 59;

    onChange({ ...value, minute: num.toString().padStart(2, "0") });
  };

  const handleAmPm = (p) => {
    onChange({ ...value, ampm: p });
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
            onChange={handleHourChange}
            onBlur={handleHourBlur}
            className="max-w-[64px] max-h-[56px] py-2 border border-[#D3DAE0] text-center text-[24px] font-medium rounded-lg hover:bg-[#EEF0FF] outline-none hover:border-[#94A2FF]"
          />
          <span className="text-[10px] text-gray-400 mt-1">Hora</span>
        </div>

        <div className="flex justify-start items-start h-full">
          <CustomText
            variant="TitleX"
            as="h1"
            className="text-[#838383] font-bold"
          >
            :
          </CustomText>
        </div>

        {/* Minuto */}
        <div className="flex flex-col">
          <input
            type="text"
            maxLength={2}
            placeholder="00"
            value={value.minute}
            onChange={handleMinuteChange}
            onBlur={handleMinuteBlur}
            className="max-w-[64px] max-h-[56px] py-2 border border-[#D3DAE0] text-center text-[24px] font-medium rounded-lg hover:bg-[#EEF0FF] outline-none hover:border-[#94A2FF]"
          />
          <span className="text-[10px] text-gray-400 mt-1">Minuto</span>
        </div>

        {/* AM / PM */}
        <div className="flex flex-col mb-4">
          {["AM", "PM"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleAmPm(p)}
              className={`py-1 px-2 text-[12px] ${
                p === "AM" ? "rounded-t-lg" : "rounded-b-lg"
              } ${
                value.ampm === p
                  ? "bg-[#94A2FF] text-black font-bold"
                  : "bg-[#D3DAE0]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
