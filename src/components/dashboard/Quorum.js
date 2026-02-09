import React from "react";
import CustomText from "../basics/CustomText";

const Quorum = ({ percentage }) => {
  const size = 300; // Standard size from Operario
  const strokeWidth = 20; // Standard thickness
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const progress = (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 10}
        viewBox={`0 0 ${size} ${size / 2 + 5}`}
        className="overflow-visible"
      >
        <path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0 1 ${
            size - strokeWidth / 2
          },${size / 2}`}
          fill="none"
          stroke="#F3F4FB"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
        <path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0 1 ${
            size - strokeWidth / 2
          },${size / 2}`}
          fill="none"
          stroke="#4059FF"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 1.2s ease-in-out" }}
        />
      </svg>
      <div className="absolute bottom-4 text-center">
        <CustomText
          variant="TitleX"
          as="h1"
          className="text-[#0E3C42] font-bold"
        >
          {percentage.toFixed(2)}%
        </CustomText>
        <CustomText variant="labelL" className="font-medium text-[#1F1F23]">
          Asambleístas registrados
        </CustomText>
      </div>
      <div className={`flex w-[310px] justify-between ml-2`}>
        <CustomText variant="labelM" className="font-bold text-[#333333]">
          0%
        </CustomText>
        <CustomText variant="labelM" className="font-bold text-[#333333]">
          100%
        </CustomText>
      </div>
    </div>
  );
};

export default Quorum;
