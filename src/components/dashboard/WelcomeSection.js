import React from "react";
import { formatName } from "@/lib/utils"; // We might need to move formatName to utils or keep it local and duplicated for now if no utils exist.
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
    <div className="flex flex-col md:flex-row justify-evenly gap-6 mb-8">
      {/* Welcome Card */}
      <div className="relative w-full max-w-4xl h-auto opacity-100 rounded-3xl border border-gray-300 p-8 md:p-10 bg-white overflow-hidden flex flex-col justify-center">
        <img
          src="/logos/decorations/figureOne.png"
          className="absolute top-0 left-0 w-28 md:w-36 pointer-events-none select-none"
          alt="decoration"
        />
        <img
          src="/logos/decorations/figureTwo.png"
          className="absolute bottom-0 right-0 w-28 md:w-50 pointer-events-none select-none"
          alt="decoration"
        />

        <p className="font-sans font-medium text-[1.8rem] leading-snug tracking-normal text-[#0E3C42]">
          Bienvenido,
        </p>
        <h1 className="font-sans font-bold text-[2rem] md:text-[4rem] leading-tight tracking-tight text-[#0E3C42] z-10">
          {formatUserName(userName)} !
        </h1>
      </div>

      {/* Brand/Logo Card */}
      <div className="relative w-full max-w-sm rounded-3xl border border-white/20 backdrop-blur-2xl shadow-lg p-8 flex flex-col items-center justify-center overflow-hidden bg-white/50">
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
          <p className="text-gray-800 font-medium">Lo complejo hecho simple</p>
        </div>
      </div>
    </div>
  );
}
