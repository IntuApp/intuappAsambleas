import React from "react";
import Button from "@/components/basics/Button";
import { FaWhatsapp } from "react-icons/fa";
import CustomTitle from "../basics/CustomTitle";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";

export default function HelpFullBanner({ className = "" }) {
  return (
    <div className="relative w-full h-full rounded-3xl border border-[#F3F6F9] flex items-center max-w-[1128px] max-h-[160px]">
      <img
        src="/bg/bgHelp.png"
        alt="Login"
        className="w-full h-full rounded-3xl object-cover border border-[#F3F6F9]"
      />

      <div className="absolute flex justify-center items-start flex-col gap-5 p-5 text-start w-full h-full">
        <CustomText variant="TitleL" className="text-[#0E3C42] font-bold">
          ¿Necesitas ayuda?
        </CustomText>
        <div className="flex gap-4 mt-4">
          <CustomButton
            variant="secondary"
            className="px-4 py-2 flex items-center gap-1 bg-transparent"
            onClick={() => window.open("https://wa.me/57317124294", "_blank")}
          >
            <FaWhatsapp size={20} color="#0E3C42" />
            <CustomText variant="labelL" className="text-[#0E3C42] font-bold">
              Escríbenos
            </CustomText>
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
