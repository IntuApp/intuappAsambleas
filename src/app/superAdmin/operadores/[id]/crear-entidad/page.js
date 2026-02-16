"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import CreateEntityForm from "@/components/entities/CreateEntityForm";
import TopBar from "@/components/ui/TopBar";
import Loader from "@/components/basics/Loader";
import { getOperatorById } from "@/lib/operators";
import CustomText from "@/components/basics/CustomText";

export default function CreateEntityPage() {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [operatorData, setOperatorData] = useState(null);

  useEffect(() => {
    const fetchOperatorData = async () => {
      if (!id) return;

      const res = await getOperatorById(id);
      if (res.success) {
        setOperatorData(res.data);
      } else {
        // Fallback if operator doc not found or error, just use basic user info
        console.warn("Operator data not found for user", id);
      }
      setLoading(false);
    };

    fetchOperatorData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col gap-8 w-full h-full">
        <div className="flex items-center justify-between">
          <CustomText variant="TitleL" className="text-[#0E3C42] font-bold">
            Crear Entidad
          </CustomText>
        </div>

        <CreateEntityForm
          operatorId={id}
          onCancel={() => router.back()}
          onSuccess={(res) => router.push(`/superAdmin/operadores/${id}`)}
        />
      </div>
    </div>
  );
}
