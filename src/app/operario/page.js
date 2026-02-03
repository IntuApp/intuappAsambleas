"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Building2, CalendarClock, QrCode, Settings } from "lucide-react";

import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StatCard from "@/components/dashboard/StatCard";
import SectionCard from "@/components/dashboard/SectionCard";
import ListItem from "@/components/dashboard/ListItem";
import HelpFullBanner from "@/components/dashboard/HelpFullBanner";
import Button from "@/components/basics/Button";
import { Plus, CalendarDays, X, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { getEntitiesByOperator, getEntityTypes } from "@/lib/entities";
import { getAllAssemblies } from "@/lib/assembly";
import CustomButton from "@/components/basics/CustomButton";
import CustomText from "@/components/basics/CustomText";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "../constans/iconPaths";

export default function OperarioPage() {
  const { user } = useUser();
  const router = useRouter();

  const [entities, setEntities] = useState([]);
  const [assemblies, setAssemblies] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedAssemblyForQr, setSelectedAssemblyForQr] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        const typesRes = await getEntityTypes();
        const typesList = typesRes.success ? typesRes.data : [];
        setEntityTypes(typesList);

        const entityRes = await getEntitiesByOperator(user.uid);
        let myEntities = entityRes.success ? entityRes.data : [];

        myEntities = myEntities.map((e) => {
          const typeInfo = typesList.find(
            (t) => String(t.id) === String(e.type),
          );
          return {
            ...e,
            typeName: typeInfo
              ? typeInfo.name
              : e.type || "Propiedad Horizontal",
          };
        });
        setEntities(myEntities);

        // 3. Get Assemblies for these entities
        const assemblyRes = await getAllAssemblies();
        let myAssemblies = [];
        if (assemblyRes.success) {
          const entityIds = new Set(myEntities.map((e) => e.id));
          // Filter assemblies belonging to my entities
          myAssemblies = assemblyRes.data.filter((a) =>
            entityIds.has(a.entityId),
          );

          // Add entity names to assemblies for display
          myAssemblies = myAssemblies.map((a) => {
            const entity = myEntities.find((e) => e.id === a.entityId);
            return {
              ...a,
              entityName: entity ? entity.name : "Unknown Entity",
              typeName: entity ? entity.typeName : "Propiedad Horizontal",
            };
          });
        }
        setAssemblies(myAssemblies);

        const entitiesWithNext = myEntities.map((entity) => {
          const entityAssemblies = myAssemblies.filter(
            (a) => a.entityId === entity.id && a.status !== "finished",
          );
          const next = entityAssemblies.sort((a, b) =>
            (a.date || "").localeCompare(b.date || ""),
          )[0];

          return {
            ...entity,
            nextAssembly: next ? { date: next.date, time: next.hour } : null,
          };
        });
        setEntities(entitiesWithNext);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const openQrModal = (assembly) => {
    setSelectedAssemblyForQr(assembly);
    setIsQrModalOpen(true);
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-gen-dashboard");
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `assembly_qr_${selectedAssemblyForQr?.entityName}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
  const iconEntidades = (
    <path d="M200-120q-33 0-56.5-23.5T120-200v-400q0-33 23.5-56.5T200-680h80v-80q0-33 23.5-56.5T360-840h240q33 0 56.5 23.5T680-760v240h80q33 0 56.5 23.5T840-440v240q0 33-23.5 56.5T760-120H520v-160h-80v160H200Zm0-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 320h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Z" />
  );
  const iconCalendar = (
    <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v187q0 17-11.5 28.5T800-493q-17 0-28.5-11.5T760-533v-27H200v400h232q17 0 28.5 11.5T472-120q0 17-11.5 28.5T432-80H200Zm520 40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40Zm67-105 28-28-75-75v-112h-40v128l87 87Z" />
  );

  return (
    <div className="flex flex-col gap-8">
      <WelcomeSection userName={user?.name} />

      <section className=" ">
        <div className="flex flex-start gap-6">
          <StatCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                className="w-[40px] h-[40px] text-[#6A7EFF]"
                fill="currentColor"
              >
                {iconEntidades}
              </svg>
            }
            label="Total Entidades"
            value={entities.length}
            iconColor="#001497"
            iconBgColor="bg-[#EEF0FF] w-[56px] h-[56px]"
            className="w-full h-full max-w-[264px] max-h-[104px] rounded-[16px] border-[#F3F6F9] p-6"
          />
          <StatCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                className="w-[40px] h-[40px] text-[#6A7EFF]"
                fill="currentColor"
              >
                {iconCalendar}
              </svg>
            }
            label="Asambleas agendadas"
            value={assemblies.length}
            iconColor="#001497"
            iconBgColor="bg-[#EEF0FF] w-[56px] h-[56px]"
            className="w-full h-full max-w-[264px] max-h-[104px] rounded-[16px] border-[#F3F6F9] p-6"
          />
        </div>
      </section>

      <section className="w-full h-full max-h-[789px] flex justify-between">
        {/* Left Column */}
        <div className="space-y-8 max-w-[552px] w-full max-h-[424px]">
          <SectionCard
            title="Entidades"
            className=" border-[#F3F6F9] rounded-[24px] p-6 gap-6"
            actionLabel={"Crear Entidad"}
            onAction={() => router.push("/operario/crear-entidad")}
            viewAllHref="/operario/entidades"
            viewAllText="Ver todas las Entidades"
            classButton="flex items-center gap-2 font-bold py-2 px-3 text-[14px]"
            iconButton={<Plus size={16} />}
            contentClassName="max-w-[504px] max-h-[204px] w-full pb-2"
          >
            {entities.map((entity) => (
              <ListItem
                key={entity.id}
                icon={Building2}
                entity={entity}
                showNextAssembly={true}
                onClick={() => router.push(`/operario/${entity.id}`)}
                classContainer="max-w-[504px] w-full h-[72px] rounded-2xl shadow-soft border border-[#F3F6F9] py-3 px-4 gap-4"
              />
            ))}
            {entities.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No hay entidades.
              </p>
            )}
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-8 max-w-[550px] w-full max-h-[789px]">
          <SectionCard
            title="Asambleas en curso"
            className=" border-[#F3F6F9] rounded-[24px] p-6 gap-6 max-h-[264px]"
            contentClassName="max-w-[502px] max-h-[160px] w-full pb-2"
          >
            {assemblies.filter((a) => a.status === "started").length > 0 ? (
              assemblies
                .filter((a) => a.status === "started")
                .map((assembly) => (
                  <ListItem
                    key={assembly.id}
                    title={`${assembly.entityName} · ${assembly.name}`}
                    subtitle={`Inició hace...`}
                    classContainer="max-w-[502px] w-full h-[72px] rounded-2xl shadow-soft border border-[#F3F6F9] py-3 px-4 gap-4"
                    status={{
                      text: "En vivo",
                      color: "bg-red-100 text-red-600",
                      dot: true,
                    }}
                    onClick={() =>
                      router.push(
                        `/operario/${assembly.entityId}/${assembly.id}`,
                      )
                    }
                  />
                ))
            ) : (
              <div className="flex items-center justify-center border border-[#94A2FF] bg-[#EEF0FF] rounded-[8px] p-4 h-[56px]">
                <CustomText
                  variant="labelL"
                  className="text-[#1F1F23] font-bold"
                >
                  No hay asambleas en curso.
                </CustomText>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Próximas Asambleas"
            isOperator
            className=" border-[#F3F6F9] rounded-[24px] p-6 gap-6"
            viewAllHref="/operario/entidades"
            viewAllText="Ver entidades con asambleas"
            contentClassName="max-w-[502px] max-h-[324px] w-full pb-2"
          >
            {assemblies.filter(
              (a) => a.status !== "started" && a.status !== "finished",
            ).length > 0 ? (
              assemblies
                .filter(
                  (a) => a.status !== "started" && a.status !== "finished",
                )
                .map((assembly) => (
                  <div
                    key={assembly.id}
                    className="max-w-[504px] w-full h-[152px] rounded-2xl shadow-soft border border-[#F3F6F9] py-3 px-4 gap-4"
                  >
                    <ListItem
                      title={assembly.entityName}
                      subtitle={`${assembly.hour || "00:00"} · ${
                        assembly.type || "Presencial"
                      }`}
                      status={{
                        text: assembly.date || "Fecha pendiente",
                        color: "bg-[#B8EAF0] text#0E3C42]",
                        dot: false,
                        icon: CalendarDays,
                      }}
                      isAssamblea
                      classContainer="py-3 gap-4"
                    />
                    <div className="flex gap-2">
                      <CustomButton
                        variant="secondary"
                        onClick={() => openQrModal(assembly)}
                        className="px-4 py-2 border-[2px] border-[#0E3C42]  rounded-l-3xl rounded-r-3xl hover:bg-gray-50 !text-[#000000] transition-colors"
                      >
                        <QrCode size={18} />
                      </CustomButton>
                      <CustomButton
                        variant="primary"
                        size="M"
                        className="flex-1 flex items-center gap-2 justify-center py-3 px-4 !text-[#000000] font-bold"
                        onClick={() =>
                          router.push(
                            `/operario/${assembly.entityId}/${assembly.id}`,
                          )
                        }
                      >
                        <CustomIcon path={ICON_PATHS.settings} size={16} />
                        <CustomText variant="labelM" className="font-bold">
                          Gestionar
                        </CustomText>
                      </CustomButton>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay próximas asambleas.
              </p>
            )}
          </SectionCard>
        </div>
      </section>
      <HelpFullBanner />

      {isQrModalOpen && selectedAssemblyForQr && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg">
          <SectionCard
            title="Código QR"
            isOperator
            className=" border-[#F3F6F9] rounded-[24px] p-6 gap-6 max-w-[502px] w-full"
            contentClassName="max-w-[502px] max-h-[400px] w-full pb-2"
          >
            <div className="text-center flex flex-col justify-center items-center gap-2">
              <CustomText variant="labelM" className="text-[#] font-medium">
                Escanea para acceder a la asamblea: <br />
              </CustomText>

              <div className="rounded-3xl border-4 border-[#F3F6F9] inline-block mb-8">
                <QRCodeCanvas
                  id="qr-gen-dashboard"
                  value={`${window.location.origin}/${selectedAssemblyForQr.id}`}
                  size={200}
                  level={"H"}
                  includeMargin={true}
                />
              </div>

              <div className="flex gap-3">
                <CustomButton
                  variant="primary"
                  onClick={downloadQR}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  <CustomIcon path={ICON_PATHS.download} />
                  <CustomText
                    variant="labelM"
                    className="text-[#000000] font-bold"
                  >
                    Descargar Imagen
                  </CustomText>
                </CustomButton>
                <CustomButton
                  variant="secondary"
                  onClick={() => setIsQrModalOpen(false)}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  <CustomText variant="labelM" className="font-bold">
                    Cerrar
                  </CustomText>
                </CustomButton>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
