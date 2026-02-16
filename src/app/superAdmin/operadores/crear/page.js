"use client";

import { useRouter } from "next/navigation";
import CustomText from "@/components/basics/CustomText";
import CreateOperatorForm from "@/components/operators/CreateOperatorForm";

export default function CrearOperadorPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full h-full gap-8">
      <div className="flex items-center justify-between">
        <CustomText variant="TitleL" className="text-[#0E3C42] font-bold">
          Crear Operador logístico
        </CustomText>
      </div>

      <CreateOperatorForm
        onCancel={() => router.back()}
        onSuccess={(res) =>
          router.push(`/superAdmin/operadores/${res.id}`)
        }
      />
    </div>
  );
}
