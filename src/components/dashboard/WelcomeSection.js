import React from "react";
import { formatName } from "@/lib/utils"; // We might need to move formatName to utils or keep it local and duplicated for now if no utils exist.
import CustomTitle from "../basics/CustomTitle";
import CustomText from "../basics/CustomText";
// Actually I'll implement a helper inside or expect it passed. The logic was in page.js

const formatUserName = (name) => {
  if (!name) return "...";
  const names = name.split(" ").filter((n) => n.length > 0);
  const firstTwo = names.slice(0, 2);
  return firstTwo
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
    .join(" ");
};

export default function WelcomeSection({ userName }) {
  return (
    <div className="flex flex-col md:flex-row justify-evenly gap-6">
      {/* Welcome Card */}
      <div className="relative max-w-[744px] max-h-[168px] w-full h-full opacity-100 rounded-3xl border border-gray-300 p-8 md:p-10 bg-white overflow-hidden flex flex-col justify-center">
        <img
          src="/logos/decorations/figureOne.png"
          className="absolute top-0 left-0 w-28 md:w-36 pointer-events-none select-none"
          alt="decoration"
        />
        <img
          src="/logos/decorations/figureTwo.png"
          className="absolute bottom-0 right-0 w-[164px] h-[192px]  pointer-events-none select-none"
          alt="decoration"
        />

        <CustomText variant="SubTitle" className="text-[#0E3C42] font-medium">
          Bienvenido,
        </CustomText>
        <CustomText variant="Title" className="text-[#0E3C42]">
          {formatUserName(userName)} !
        </CustomText>
      </div>

      {/* Brand/Logo Card */}
      <div className="relative max-w-[360px] max-h-[168px] w-full rounded-3xl border border-white/20 backdrop-blur-2xl shadow-lg p-8 flex flex-col items-center justify-center overflow-hidden bg-white/50">
        {/* Abstract Blobs */}
        <div
          className="absolute rounded-full blur-[50px]"
          style={{
            left: "-90px",
            top: "0px",
            width: "200px",
            height: "200px",
            background: "#94A2FF80",
            transform: "rotate(8deg)",
          }}
        />
        <div
          className="absolute rounded-full blur-[20px]"
          style={{
            left: "100px",
            bottom: "-40px",
            width: "90px",
            height: "90px",
            background: "#ABE7E580",
            transform: "rotate(-128.32deg)",
          }}
        />
        <div
          className="absolute rounded-full blur-[20px]"
          style={{
            right: "20px",
            top: "-90px",
            width: "203px",
            height: "143px",
            background: "#ABE7E580",
            transform: "rotate(20deg)",
          }}
        />
        <div
          className="absolute rounded-full blur-[20px]"
          style={{
            right: "-10px",
            bottom: "-10px",
            width: "70px",
            height: "70px",
            background: "#94A2FF80",
            transform: "rotate(45deg)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center gap-2">
          <img
            src="/logos/intuapp.png"
            alt="Intuapp"
            className="h-12 w-auto object-contain"
          />
          <CustomText variant="labelL font-medium">
            Lo complejo hecho simple
          </CustomText>
        </div>
      </div>
    </div>
  );
}
