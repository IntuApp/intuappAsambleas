"use client";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/headers/HeaderSuperAdmin";
import { useUser } from "@/context/UserContext";
import {
  UsersRound,
  HousePlus,
  CalendarClock,
  ChevronRight,
  Plus,
} from "lucide-react";

import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StatCard from "@/components/dashboard/StatCard";
import SectionCard from "@/components/basics/SectionCard";
import ListItem from "@/components/dashboard/ListItem";

import { getOperatorsCount, getEntitiesCount } from "@/lib/stats";
import { getOperators, listenOperators } from "@/lib/operators";
import { getEntitiesByOperator, getEntityById } from "@/lib/entities";
import { getAllAssembliesWithOperator, listenAssembliesWithOperator } from "@/lib/assembly";
import { ICON_PATHS } from "../../constans/iconPaths";
import CustomText from "@/components/basics/CustomText";
import CustomStates from "@/components/basics/CustomStates";

const SuperAdminPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    operators: 0,
    entities: 0,
  });
  const [operators, setOperators] = useState([]);
  const [assemblies, setAssemblies] = useState([]);

  useEffect(() => {
  const unsubscribe = listenAssembliesWithOperator((data) => {
    setAssemblies(data);
  });

  return () => unsubscribe();
}, []);
  useEffect(() => {
    const fetchStats = async () => {
      const [ops, ents] = await Promise.all([
        getOperatorsCount(),
        getEntitiesCount(),
      ]);
      setStats({ operators: ops, entities: ents });
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchOperators = async () => {
      const data = await getOperators();
      setOperators(data.data);
    };
    fetchOperators();
  }, []);
  useEffect(() => {
  const unsubscribe = listenOperators((data) => {
    setOperators(data);
    setStats((prev) => ({
      ...prev,
      operators: data.length,
    }));
  });

  return () => unsubscribe();
}, []);

  useEffect(() => {
    const fetchAssemblies = async () => {
      const res = await getAllAssembliesWithOperator();
      if (res.success) {
        const assembliesWithFullDetails = await Promise.all(
          res.data.map(async (assembly) => {
            const entityRes = await getEntityById(assembly.entityId);
            const entityData = entityRes.success ? entityRes.data : null;

            // Find operator for this entity
            let operatorName = "";
            if (entityData && entityData.operatorId) {
              const operator = operators.find(
                (op) => op.id === entityData.operatorId,
              );
              operatorName = operator ? operator.name : "Operador";
            }

            return {
              ...assembly,
              entityName: entityData ? entityData.name : "Entidad",
              operatorName,
            };
          }),
        );
        setAssemblies(assembliesWithFullDetails);
      }
    };
    if (operators.length > 0) {
      fetchAssemblies();
    }
  }, [operators]);

  return (
    <div className="flex flex-col gap-8">
      <WelcomeSection userName={user?.name} />

      <section className=" flex ">
        <div className="flex flex-start flex-wrap gap-6  w-full">
          <StatCard
            iconPath={ICON_PATHS.groupPeople}
            label="Operadores Logísticos"
            value={stats.operators}
            classIcon="text-[#6A7EFF] w-[40px] h-[40px]"
            iconBgColor="bg-[#EEF0FF] w-[56px] h-[56px]"
            className="w-full h-full max-w-[360px] max-h-[104px] rounded-[16px] border-[#F3F6F9] p-6"
          />
          <StatCard
            iconPath={ICON_PATHS.conjunto}
            label="Entidades en total"
            value={stats.entities}
            classIcon="text-[#6A7EFF] w-[40px] h-[40px]"
            iconBgColor="bg-[#EEF0FF] w-[56px] h-[56px]"
            className="w-full h-full max-w-[360px] max-h-[104px] rounded-[16px] border-[#F3F6F9] p-6"
          />
          <StatCard
            iconPath={ICON_PATHS.calendarTime}
            label="Asambleas agendadas"
            value={assemblies.length}
            classIcon="text-[#6A7EFF] w-[40px] h-[40px]"
            iconBgColor="bg-[#EEF0FF] w-[56px] h-[56px]"
            className="w-full h-full max-w-[360px] max-h-[104px] rounded-[16px] border-[#F3F6F9] p-6"
          />
        </div>
      </section>

      <section className="w-full h-full max-h-[789px] flex flex-wrap gap-6 justify-between">
        <div className="space-y-8 max-w-[552px] w-full max-h-[424px]">
          {/* Operators List */}
          <SectionCard
            title="Operadores Logísticos"
            viewAllHref="/superAdmin/operadores"
            viewAllText="Ver todos los Operadores"
            className=" border-[#F3F6F9] rounded-[24px] p-6 gap-6"
            actionLabel={"Crear Operador"}
            onAction={() => router.push("/superAdmin/operadores/crear")}
            classButton="flex items-center gap-2 font-bold py-2 px-3 text-[14px]"
            iconButton={<Plus size={16} />}
            contentClassName="max-w-[504px] max-h-[204px] w-full pb-2"
          >
            {operators.map((operator) => (
              <ListItem
                key={operator.id}
                entity={operator}
                subtitle={`${operator.entities?.length || 0} Entidades`}
                showNextAssembly={true}
                iconArrow
                onClick={() =>
                  router.push(`/superAdmin/operadores/${operator.id}`)
                }
                classContainer="max-w-[504px] w-full h-[72px] rounded-2xl shadow-soft border border-[#F3F6F9] py-3 px-4 gap-4"
              />
            ))}
            {operators.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No hay operadores.
              </p>
            )}
          </SectionCard>
        </div>
        <div className="space-y-8 max-w-[550px] w-full max-h-[424px]">
          {/* Assemblies List */}
          <SectionCard
            title="Asambleas"
            viewAllHref="/superAdmin/asambleas"
            viewAllText="Ver todas las Asambleas"
            className="border-[#F3F6F9] rounded-[24px] p-6 gap-6 max-h-[504px]"
            contentClassName="max-w-[502px] w-full pb-2"
          >
            {assemblies.filter((a) => a.status !== "finished").length > 0 ? (
              assemblies
                .filter((a) => a.status !== "finished")
                .map((assembly) =>
                  assembly.status === "started" ? (
                    <ListItem
                      key={assembly.id}
                      title={assembly.operatorName}
                      subtitle={`${assembly.entityName} · ${assembly.hour} · ${
                        assembly.type || "Presencial"
                      }`}
                      status={assembly.status}
                      isAssamblea
                      iconArrow
                      classContainer="max-w-[502px] w-full h-[72px] rounded-2xl shadow-soft border border-[#F3F6F9] py-3 px-4 gap-4"
                      onClick={() =>
                        router.push(
                          `/superAdmin/operadores/${assembly.operatorId}`,
                        )
                      }
                    />
                  ) : (
                    <ListItem
                      key={assembly.id}
                      title={assembly.operatorName}
                      date={assembly.date}
                      subtitle={`${assembly.entityName} · Inició hace`}
                      classContainer="max-w-[502px] w-full h-[72px] rounded-2xl shadow-soft border border-[#F3F6F9] py-3 px-4 gap-4"
                      status={assembly.status}
                      isAssamblea
                      iconArrow
                      onClick={() =>
                        router.push(
                          `/superAdmin/operadores/${assembly.operatorId}`,
                        )
                      }
                    />
                  ),
                )
            ) : (
              <div className="flex items-center justify-center border border-[#94A2FF] bg-[#EEF0FF] rounded-[8px] p-4 h-[56px]">
                <CustomText
                  variant="labelL"
                  className="text-[#1F1F23] font-bold"
                >
                  No hay asambleas activas.
                </CustomText>
              </div>
            )}
          </SectionCard>
        </div>
      </section>
    </div>
  );
};

export default SuperAdminPage;
