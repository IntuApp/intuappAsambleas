import React from "react";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";

export default function HelpFullBanner({ className = "" }) {
  return (
    <div className="relative w-full rounded-3xl border border-[#F3F6F9] flex items-center  max-h-[100px] mt-5 pt-5">
      <img
        src="/bg/bgHelp.png"
        alt="Login"
        className="w-full h-full rounded-3xl object-cover border border-[#F3F6F9]"
      />

      <div className="absolute flex justify-center items-start flex-col gap-5 p-4 text-start w-full h-full">
        <CustomText variant="TitleL" className="text-[#0E3C42] font-bold">
          ¿Necesitas ayuda?
        </CustomText>
        <div className="flex gap-4 mt-2">
          <CustomButton
            variant="secondary"
            className="px-4 py-2 flex items-center gap-1 bg-transparent"
            onClick={() => window.open("https://wa.me/57317124294", "_blank")}
          >
            <CustomText variant="labelL" className="text-[#0E3C42] font-bold">
              Escríbenos
            </CustomText>
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
