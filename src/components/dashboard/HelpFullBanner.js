import React from "react";
import Button from "@/components/basics/Button";
import { Mail, PlayCircle } from "lucide-react";

export default function HelpFullBanner({ className = "" }) {
  return (
    <div className={`mt-8 rounded-3xl overflow-hidden relative ${className}`}>
      {/* Background with gradients similar to image */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-teal-50 to-indigo-50"></div>

      {/* Content */}
      <div className="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#0E3C42] mb-1">
            ¿Necesitas ayuda?
          </h2>
          <div className="flex gap-4 mt-4">
            <Button
              variant="secondary"
              size="M"
              className="!bg-transparent border-[#0E3C42] text-[#0E3C42] flex items-center gap-2"
            >
              <Mail size={18} /> Escríbenos
            </Button>
            <Button
              variant="primary"
              size="M"
              className="flex items-center gap-2"
            >
              <PlayCircle size={18} /> Ver tutorial completo
            </Button>
          </div>
        </div>

        {/* Decorative elements (C badges) - Mocked for visual similarity */}
        <div className="flex gap-[-10px]">
          {/* You can add more complex graphics here if needed */}
        </div>
      </div>
    </div>
  );
}
