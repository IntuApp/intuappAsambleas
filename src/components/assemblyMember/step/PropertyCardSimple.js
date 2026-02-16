import React from "react";
import { Building2 } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import CustomTypePropertie from "../CustomTypePropertie";

export default function PropertyCardSimple({ registry }) {
  return (
    <div className="p-4 rounded-2xl max-w-[307px] w-full flex gap-4 border border-[#DBE2E8] ">
      <CustomTypePropertie type={registry.tipo.toLowerCase()} />
      <div>
        <CustomText variant="bodyM" className="font-bold">
          {registry.tipo ? `${registry.tipo} - ` : ""}
          {registry.propiedad}
        </CustomText>
        <div className="flex items-center gap-2 mt-0.5">
          <CustomText variant="labelM" className="font-medium">
            Coeficiente:{" "}
            <strong className="">
              {registry.coeficiente.slice(0, 5) || "0"}%
            </strong>
          </CustomText>
        </div>
      </div>
    </div>
  );
}
