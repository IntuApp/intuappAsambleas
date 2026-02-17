import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  Home,
  BarChart2,
  User,
  HelpCircle,
  Video,
  LogOut,
  Building2,
  Users,
  Check,
  Eye,
  AlertTriangle,
  Car,
  Store,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import QuestionCard from "../question/QuestionCard";
import CustomButton from "../basics/CustomButton";
import CustomText from "../basics/CustomText";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomTypeAssembly from "../basics/CustomTypeAssembly";
import CustomTypePropertie from "../assemblyMember/CustomTypePropertie";

const QUESTION_TYPES = {
  MULTIPLE: "MULTIPLE",
  UNIQUE: "UNIQUE",
  YES_NO: "YES_NO",
  OPEN: "OPEN",
};

const QUESTION_STATUS = {
  CREATED: "CREATED",
  LIVE: "LIVE",
  FINISHED: "FINISHED",
};

const NavItem = ({ id, icon: Icon, label, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
      activeTab === id
        ? "bg-indigo-50 text-[#8B9DFF]"
        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
    }`}
  >
    <Icon size={24} />
    <span className="text-[10px] font-bold uppercase tracking-wide">
      {label}
    </span>
  </button>
);

export default function AsambleistaDashboard({
  user,
  assembly,
  entity,
  registries,
  onJoinMeeting,
  onLogout,
  questions = [],
  votes = [],
  allRegistrations = [],
  renderQuestion,
  userVotingPreference,
  onSetVotingPreference,
}) {
  const [activeTab, setActiveTab] = useState("inicio");
  const [resultSubTab, setResultSubTab] = useState("global"); // 'global' | 'mine'
  const [openFaq, setOpenFaq] = useState(null);

  console.log(user);

  // Filter votes for current user
  const userVotes = votes.filter((v) =>
    user?.myRegistries?.some((r) => r.id === v.propertyOwnerId),
  );

  const registrationData = useMemo(() => {
    return allRegistrations.find((r) => r.mainDocument === user?.userDocument);
  }, [allRegistrations, user?.userDocument]);

  // Sort questions: Newest first
  const sortedQuestions = [...questions].reverse();

  // Calculate Stats from allRegistrations
  const registeredOwnerIds = useMemo(() => {
    const ids = new Set();
    allRegistrations.forEach((reg) => {
      (reg.representedProperties || []).forEach((prop) => {
        if (prop.ownerId) ids.add(prop.ownerId);
      });
    });
    return ids;
  }, [allRegistrations]);

  const registeredCount = registeredOwnerIds.size;
  const totalCount = registries.length;

  const totalCoeff = registries.reduce(
    (acc, curr) =>
      acc + parseFloat(String(curr.coeficiente || 0).replace(",", ".")),
    0,
  );
  const registeredCoeff = registries
    .filter((r) => registeredOwnerIds.has(r.id))
    .reduce(
      (acc, curr) =>
        acc + parseFloat(String(curr.coeficiente || 0).replace(",", ".")),
      0,
    );

  const quorumPercentage =
    totalCoeff > 0 ? (registeredCoeff / totalCoeff) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans">
      {/* Sidebar */}
      <aside className="w-24 bg-white border-r border-gray-100 flex flex-col items-center py-8 z-20 fixed h-full left-0 top-0 overflow-y-auto hidden md:flex">
        <div className="mb-12">
          <div className="">
            <img src="/logos/logo-header.png" alt="Logo" />
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full px-2 flex-1 ">
          <NavItem
            id="inicio"
            icon={Home}
            label="Inicio"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <NavItem
            id="resultados"
            icon={BarChart2}
            label="Resultados"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <NavItem
            id="perfil"
            icon={User}
            label="Perfil"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <NavItem
            id="ayuda"
            icon={HelpCircle}
            label="Ayuda"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </aside>

      {/* Mobile Bottom Bar (optional, hidden on desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-2 flex justify-around z-50">
        <button
          onClick={() => setActiveTab("inicio")}
          className="p-2 text-[#8B9DFF]"
        >
          <Home size={24} />
        </button>
        <button
          onClick={() => setActiveTab("resultados")}
          className="p-2 text-gray-400"
        >
          <BarChart2 size={24} />
        </button>
        <button
          onClick={() => setActiveTab("perfil")}
          className="p-2 text-gray-400"
        >
          <User size={24} />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-32 md:mr-16 p-6 md:p-12 md:gap-6 flex flex-col relative overflow-y-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <div className="bg-white rounded-full p-2 flex items-center gap-2">
            <CustomIcon
              path={ICON_PATHS.home}
              className="text-[#000000]"
              size={20}
            />
            {activeTab !== "inicio" && (
              <CustomText
                variant="labelM"
                className="text-black font-bold pt-0.5"
              >
                {">"}
              </CustomText>
            )}
            {activeTab === "resultados" && (
              <CustomText variant="labelM" className="text-black">
                Resultados
              </CustomText>
            )}
            {activeTab === "perfil" && (
              <CustomText variant="labelM" className="text-black ">
                Perfil
              </CustomText>
            )}
            {activeTab === "ayuda" && (
              <CustomText variant="labelM" className="text-black ">
                Ayuda
              </CustomText>
            )}
          </div>

          <div className="bg-[#0E3C42] border-[#1D7D89] border flex items-center justify-between gap-2 py-1 pl-2 pr-1 rounded-full">
            <CustomText variant="labelM" className="text-white font-bold">
              {user?.userDocument || "User"}
            </CustomText>
            <div className="w-8 h-8 rounded-full bg-[#ABE7E5] flex items-center justify-center">
              <CustomIcon
                path={ICON_PATHS.person}
                className="text-[#1C6168]"
                size={24}
              />
            </div>
          </div>
        </div>

        {activeTab === "inicio" && (
          <div className="flex flex-col gap-6">
            {/* Welcome */}
            <CustomText variant="Title" className="text-[#0E3C42]">
              Hola, {user?.firstName || "Asambleísta"}!
            </CustomText>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assembly Info Card */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col justify-evenly max-h-[200px] relative">
                <div className="absolute flex justify-end right-0 top-0 w-1/2 h-full to-transparent rounded-r-[32px]">
                  <img src="logos/decorations/figureTwo.png" alt="" />
                </div>

                <div className="z-10 flex flex-col items-start gap-0.5">
                  <CustomText
                    variant="bodyX"
                    className="text-[#0E3C42] font-bold"
                  >
                    Asamblea {assembly.name}
                  </CustomText>
                  <CustomText
                    variant="labelL"
                    className="text-[#3D3D44] font-regular"
                  >
                    {entity?.name}
                  </CustomText>

                  <CustomText
                    variant="labelL"
                    className="text-[#3D3D44] font-regular"
                  >
                    {assembly.date} - {assembly.hour}
                  </CustomText>
                </div>
                <div className="flex justify-start">
                  <CustomTypeAssembly
                    type={assembly.type}
                    className="py-2 px-4 z-10"
                  />
                </div>
              </div>

              {/* Join Call Card & Questions */}
              <div className="shadow-sm border border-gray-100 flex flex-col justify-between max-h-[220px] overflow-y-auto">
                <div className="flex items-center gap-4 bg-white rounded-3xl p-8">
                  <div className="bg-[#EEF0FF] p-1 rounded-md">
                    <CustomIcon
                      path={ICON_PATHS.vote}
                      className="text-[#6A7EFF]"
                      size={40}
                    />
                  </div>
                  <CustomText
                    variant="labelL"
                    className="text-[#0E3C42] font-medium leading-relaxed"
                  >
                    Las preguntas aparecerán aquí, una por una, cuando el
                    operador las active.
                  </CustomText>
                </div>

                {/* Join Button */}
                {assembly.type !== "Presencial" && (
                  <div className="mt-auto pt-4 border-gray-100">
                    <CustomButton
                      onClick={onJoinMeeting}
                      disabled={assembly.status !== "started"}
                      variant="primary"
                      className="w-full flex items-center justify-center gap-3 py-3"
                    >
                      <CustomIcon
                        path={ICON_PATHS.videoCam}
                        className="text-[#000000]"
                        size={24}
                      />
                      <CustomText variant="labelL" className="font-bold">
                        Unirse a la videollamada
                      </CustomText>
                    </CustomButton>
                    {assembly.status !== "started" && (
                      <p className="text-center text-xs text-gray-400 font-bold mt-2">
                        {assembly.status === "finished"
                          ? "La reunión ya finalizó"
                          : "La reunión no ha iniciado"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
                Asistencia
              </CustomText>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quorum Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <CustomText
                        variant="bodyX"
                        className="text-[#1F1F23] font-medium"
                      >
                        Quórum
                      </CustomText>
                      <div className="bg-[#EEF0FF] p-2 rounded-md">
                        <CustomIcon
                          path={ICON_PATHS.donutSmall}
                          className="text-[#6A7EFF] "
                          size={24}
                        />
                      </div>
                    </div>
                    <CustomText
                      variant="TitleL"
                      className="text-[#1F1F23] font-bold"
                    >
                      {quorumPercentage.toFixed(2)}%
                    </CustomText>
                    <CustomText
                      variant="bodyL"
                      className="text-[#3D3D44] font-regular"
                    >
                      porcentaje de registrados
                    </CustomText>
                  </div>
                </div>

                {/* Attendance Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <CustomText
                        variant="bodyX"
                        className="text-[#1F1F23] font-medium"
                      >
                        Asistencia
                      </CustomText>
                      <div className="bg-[#EEF0FF] p-2 rounded-md">
                        <CustomIcon
                          path={ICON_PATHS.inPerson}
                          className="text-[#6A7EFF] "
                          size={24}
                        />
                      </div>
                    </div>
                    <CustomText variant="TitleL" className="text-[#1F1F23]">
                      {registeredCount} / {totalCount}
                    </CustomText>
                    <CustomText
                      variant="bodyL"
                      className="text-[#3D3D44] font-regular"
                    >
                      asambleístas registrados
                    </CustomText>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "resultados" && (
          <div className="flex flex-col gap-6">
            <div className="w-full bg-[#FFFFFF] rounded-full p-2 border border-[#F3F6F9] flex flex-row gap-2">
              <CustomButton
                onClick={() => setResultSubTab("global")}
                className={`flex-1 py-3 ${resultSubTab === "global" ? "bg-[#D5DAFF] border-none " : "bg-white border-none"}`}
              >
                <CustomText
                  variant="labelL"
                  className="text-[#000000] font-bold"
                >
                  Gestionar asambleístas
                </CustomText>
              </CustomButton>
              <CustomButton
                onClick={() => setResultSubTab("mine")}
                className={`flex-1 py-3 ${resultSubTab === "mine" ? "bg-[#D5DAFF] border-none " : "bg-white border-none"}`}
              >
                <CustomText
                  variant="labelL"
                  className="text-[#000000] font-bold"
                >
                  Gestionar votaciones
                </CustomText>
              </CustomButton>
            </div>

            {resultSubTab === "global" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <CustomText
                    variant="bodyX"
                    className="text-[#0E3C42] font-bold"
                  >
                    Asamblea {assembly.name}
                  </CustomText>
                  <CustomText
                    variant="labelL"
                    className="text-[#0E3C42] font-regular"
                  >
                    Estos son los resultados de las votaciones de esta asamblea.
                  </CustomText>
                </div>

                {/* Show finished questions even if assembly not finished */}
                {(() => {
                  const questionsToShow =
                    assembly.status === "finished"
                      ? sortedQuestions
                      : sortedQuestions.filter(
                          (q) =>
                            q.status === QUESTION_STATUS.FINISHED ||
                            q.status === QUESTION_STATUS.LIVE,
                        );

                  if (
                    assembly.status !== "finished" &&
                    questionsToShow.length === 0
                  ) {
                    return (
                      <div className="bg-white p-12 rounded-[32px] border border-gray-100 shadow-sm text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-[#8B9DFF] mb-6">
                          <BarChart2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[#0E3C42] mb-2">
                          Resultados Globales en Espera
                        </h3>
                        <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium">
                          Los resultados aparecerán aquí a medida que el
                          administrador finalice cada votación.
                        </p>
                      </div>
                    );
                  }

                  if (
                    assembly.status === "finished" &&
                    sortedQuestions.length === 0
                  ) {
                    return (
                      <p className="text-gray-400 text-center py-12">
                        No hubo preguntas emitidas en esta asamblea.
                      </p>
                    );
                  }

                  if (questionsToShow.length === 0) return null;

                  return questionsToShow
                    .filter((q) => q.status === "FINISHED")
                    .map((q) => (
                      <QuestionCard
                        key={q.id}
                        q={q}
                        registries={registries}
                        isAdmin={false}
                        votes={votes}
                      />
                    ));
                })()}
              </div>
            )}

            {resultSubTab === "mine" && (
              <div className="flex flex-col gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-4">
                  <div>
                    <CustomText
                      variant="bodyX"
                      className="text-[#0E3C42] font-bold"
                    >
                      Preferencia de Votación
                    </CustomText>
                    <CustomText
                      variant="labelL"
                      className="text-[#0E3C42] font-regular"
                    >
                      {assembly?.votingMode
                        ? "El modo de votación ha sido fijado por el administrador para esta asamblea."
                        : "Selecciona cómo quieres responder las votaciones de esta asamblea. Podrás cambiarlo en cualquier momento si no has votado."}
                    </CustomText>
                  </div>

                  <div
                    className={`flex items-center gap-8 ${
                      assembly?.votingMode
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                  >
                    <div
                      onClick={() => onSetVotingPreference?.("individual")}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          userVotingPreference === "individual" ||
                          assembly?.votingMode === "individual"
                            ? "bg-[#8B9DFF] border-[#8B9DFF]"
                            : "border-gray-300 bg-white group-hover:border-[#8B9DFF]"
                        }`}
                      >
                        {(userVotingPreference === "individual" ||
                          assembly?.votingMode === "individual") && (
                          <Check size={16} className="text-black" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`block text-sm font-bold ${
                            userVotingPreference === "individual" ||
                            assembly?.votingMode === "individual"
                              ? "text-[#0E3C42]"
                              : "text-gray-400"
                          }`}
                        >
                          Votar individual
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => onSetVotingPreference?.("block")}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          userVotingPreference === "block" ||
                          assembly?.votingMode === "block"
                            ? "bg-[#8B9DFF] border-[#8B9DFF]"
                            : "border-gray-300 bg-white group-hover:border-[#8B9DFF]"
                        }`}
                      >
                        {(userVotingPreference === "block" ||
                          assembly?.votingMode === "block") && (
                          <Check size={16} className="text-black" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`block text-sm font-bold ${
                            userVotingPreference === "block" ||
                            assembly?.votingMode === "block"
                              ? "text-[#0E3C42]"
                              : "text-gray-400"
                          }`}
                        >
                          Votar en bloque
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <CustomText
                    variant="bodyX"
                    className="text-[#0E3C42] font-bold"
                  >
                    Asamblea {assembly.name}
                  </CustomText>
                  <CustomText
                    variant="labelL"
                    className="text-[#0E3C42] font-regular"
                  >
                    Estos son los resultados de las votaciones de esta asamblea.
                  </CustomText>
                </div>
                {sortedQuestions.map((q) => {
                  const propertiesToUse =
                    registrationData?.representedProperties ||
                    user.myRegistries ||
                    [];

                  const votesByProperty = propertiesToUse
                    .map((r) => {
                      const propId = r.id || r.ownerId;
                      const foundVote = userVotes.find(
                        (v) =>
                          v.questionId === q.id && v.propertyOwnerId === propId,
                      );

                      if (!foundVote) return null;

                      let answer = null;
                      if (q.type === QUESTION_TYPES.OPEN) {
                        answer = { answerText: foundVote.selectedOptions?.[0] };
                      } else if (
                        q.type === QUESTION_TYPES.MULTIPLE ||
                        q.type === QUESTION_TYPES.YES_NO ||
                        q.type === QUESTION_TYPES.UNIQUE
                      ) {
                        answer = { options: foundVote.selectedOptions };
                        if (
                          foundVote.selectedOptions.length === 1 &&
                          q.type !== QUESTION_TYPES.MULTIPLE
                        ) {
                          answer.option = foundVote.selectedOptions[0];
                        }
                      }

                      return { registry: r, answer };
                    })
                    .filter((item) => item && item.answer);

                  // Group by the same answer object string representation
                  const groupedVotes = votesByProperty.reduce(
                    (acc, current) => {
                      const ansKey = JSON.stringify(current.answer);
                      if (!acc[ansKey]) {
                        acc[ansKey] = {
                          answer: current.answer,
                          properties: [],
                        };
                      }
                      acc[ansKey].properties.push(current.registry);
                      return acc;
                    },
                    {},
                  );

                  const groups = Object.values(groupedVotes);

                  return (
                    <div
                      key={q.id}
                      className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm mb-6"
                    >
                      <CustomText
                        variant="bodyX"
                        className="text-[#0E3C42] font-bold"
                      >
                        {q.title}
                      </CustomText>

                      {groups.length > 0 ? (
                        <div className="flex flex-col gap-6">
                          {groups.map((group, idx) => {
                            return (
                              <div key={idx} className="flex flex-col gap-3">
                                {/* Header con las propiedades que votaron esto */}
                                <div className="flex flex-wrap gap-2 items-center">
                                  <CustomText
                                    variant="labelS"
                                    className="font-medium"
                                  >
                                    Respuesta de:
                                  </CustomText>
                                  {group.properties.map((reg, rIdx) => (
                                    <CustomText
                                      key={rIdx}
                                      variant="labelS"
                                      className="font-bold uppercase px-2 py-1 rounded-md border border-indigo-100"
                                    >
                                      {reg.tipo ? `${reg.tipo} - ` : ""}
                                      {reg.grupo ? `${reg.grupo} - ` : ""}
                                      {reg.propiedad}
                                    </CustomText>
                                  ))}
                                </div>

                                {/* Renderizado de las Respuestas con Estilo Visual de Tarjeta Seleccionada */}
                                <div className="flex flex-col gap-3">
                                  {/* CASO 1: Selección Múltiple (Checkboxes cuadrados) */}
                                  {q.type === QUESTION_TYPES.MULTIPLE &&
                                    group.answer.options &&
                                    group.answer.options.map((opt, i) => (
                                      <div
                                        key={i}
                                        className="w-full p-4 rounded-xl border border-[#4059FF] bg-[#EEF0FF] flex items-center gap-3"
                                      >
                                        <div className="w-5 h-5 bg-[#4059FF] rounded-md flex items-center justify-center shrink-0">
                                          <Check
                                            size={14}
                                            className="text-white"
                                            strokeWidth={3}
                                          />
                                        </div>
                                        <CustomText
                                          variant="bodyM"
                                          className="font-bold text-[#0E3C42]"
                                        >
                                          {opt}
                                        </CustomText>
                                      </div>
                                    ))}

                                  {/* CASO 2: Selección Única / Si-No (Radio buttons circulares) */}
                                  {(q.type === QUESTION_TYPES.UNIQUE ||
                                    q.type === QUESTION_TYPES.YES_NO) &&
                                    (group.answer.option ||
                                      group.answer.options?.[0]) && (
                                      <div className="w-full p-4 rounded-xl border border-[#4059FF] bg-[#EEF0FF] flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border-2 border-[#4059FF] flex items-center justify-center shrink-0">
                                          <div className="w-2.5 h-2.5 bg-[#4059FF] rounded-full" />
                                        </div>
                                        <CustomText
                                          variant="bodyM"
                                          className="font-bold text-[#0E3C42]"
                                        >
                                          {group.answer.option ||
                                            group.answer.options[0]}
                                        </CustomText>
                                      </div>
                                    )}

                                  {/* CASO 3: Respuesta Abierta */}
                                  {q.type === QUESTION_TYPES.OPEN &&
                                    group.answer.answerText && (
                                      <div className="w-full p-4 rounded-xl border border-[#4059FF] bg-[#EEF0FF]">
                                        <CustomText
                                          variant="bodyM"
                                          className="font-bold text-[#0E3C42]"
                                        >
                                          {group.answer.answerText}
                                        </CustomText>
                                      </div>
                                    )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 text-center">
                          <CustomText
                            variant="bodyS"
                            className="font-bold text-gray-400"
                          >
                            No participaste en esta pregunta.
                          </CustomText>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === "ayuda" && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* HELP BANNER */}
            <div className=" rounded-[40px] p-10 md:p-6 mb-12 relative overflow-hidden shadow-xl shadow-indigo-100">
              {/* Abstract decorative shapes */}
              <div className="absolute -top-10 -left-20 w-64 h-64 bg-[#94A2FF] opacity-100 blur-[100px] rounded-full pointer-events-none" />

              <div className="absolute top-0 left-[300px] w-80 h-44 bg-[#36C5C5] opacity-30 blur-[80px] rounded-full pointer-events-none" />

              <div className="absolute -right-20 -bottom-20 w-56 h-96 bg-[#36C5C5] opacity-30 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute  right-[200px] -bottom-20 w-64 h-64 bg-[#94A2FF] opacity-80 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <CustomText
                  variant="TitleL"
                  className="font-bold text-[#0E3C42]"
                >
                  ¿Tienes algún problema?
                </CustomText>
                <CustomText
                  variant="bodyL"
                  className="text-[#0E3C42] mb-10 opacity-90"
                >
                  Estamos aquí para ayudarte, envíanos un mensaje para
                  asistencia rápida.
                </CustomText>

                <CustomButton
                  onClick={() =>
                    window.open(
                      "https://api.whatsapp.com/send?phone=YOUR_NUMBER_HERE",
                      "_blank",
                    )
                  }
                  variant="primary"
                  className="px-4 py-3 flex items-center gap-2"
                >
                  <MessageCircle size={22} className="text-black" />
                  <CustomText variant="labelL" className="font-bold">
                    Escríbenos
                  </CustomText>
                </CustomButton>
              </div>

              {/* Illustration-like background element (Visual) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
               <img src="/logos/decorations/figureTwo.png" alt="" className="w-[200px] h-[200px] object-cover"/>
              </div>
            </div>

            <CustomText
              variant="SubTitle"
              className="font-black text-[#0E3C42] mb-8"
            >
              Preguntas frecuentes
            </CustomText>

            <div className="flex flex-col gap-4">
              {/* FAQ 1 */}
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-gray-50 transition"
                >
                  <CustomText
                    variant="TitleS"
                    className="font-bold text-[#4059FF]"
                  >
                    ¿Cómo se vota?
                  </CustomText>
                  <ChevronDown
                    size={20}
                    className={`text-[#4059FF] transition-transform duration-300 ${
                      openFaq === 1 ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openFaq === 1 ? "max-h-[500px]" : "max-h-0"
                  }`}
                >
                  <div className="px-8 pb-8 text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-6">
                    <ol className="list-decimal pl-5 space-y-3">
                      <li>
                        <CustomText variant="bodyM" className="text-gray-500">
                          El operador iniciará la votación de cada pregunta.
                        </CustomText>
                      </li>
                      <li>
                        <CustomText variant="bodyM" className="text-gray-500">
                          La pregunta aparecerá en tu pantalla.
                        </CustomText>
                      </li>
                      <li>
                        <CustomText variant="bodyM" className="text-gray-500">
                          Selecciona tu respuesta.
                        </CustomText>
                      </li>
                      <li>
                        <CustomText variant="bodyM" className="text-gray-500">
                          Pulsa el botón &quot;votar&quot; para registrar tu
                          voto.
                        </CustomText>
                      </li>
                      <li>
                        <CustomText variant="bodyM" className="text-gray-500">
                          Si tienes hasta 4 representaciones, puedes votar por
                          cada propiedad o una sola vez para todas (según tu
                          elección inicial).
                        </CustomText>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* FAQ 2 */}
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-gray-50 transition"
                >
                  <CustomText
                    variant="TitleS"
                    className="font-bold text-[#4059FF]"
                  >
                    ¿Cómo edito mi registro?
                  </CustomText>
                  <ChevronDown
                    size={20}
                    className={`text-[#4059FF] transition-transform duration-300 ${
                      openFaq === 2 ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openFaq === 2 ? "max-h-[200px]" : "max-h-0"
                  }`}
                >
                  <div className="px-8 pb-8 text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-6">
                    <CustomText variant="bodyM" className="text-gray-500">
                      No se puede editar. Debe solicitar al operador logistico
                      la eliminación para volver a registrarse.
                    </CustomText>
                  </div>
                </div>
              </div>

              {/* FAQ 3 */}
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-gray-50 transition"
                >
                  <CustomText
                    variant="TitleS"
                    className="font-bold text-[#4059FF]"
                  >
                    Sobre los resultados de las votaciones
                  </CustomText>
                  <ChevronDown
                    size={20}
                    className={`text-[#4059FF] transition-transform duration-300 ${
                      openFaq === 3 ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openFaq === 3 ? "max-h-[800px]" : "max-h-0"
                  }`}
                >
                  <div className="px-8 pb-8 text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-6">
                    <CustomText
                      variant="bodyM"
                      className="font-bold text-[#0E3C42] mb-4"
                    >
                      Los resultados emitidos en la plataforma se obtienen con
                      base en los coeficientes, según lo establecido en la Ley
                      675 de 2001:
                    </CustomText>
                    <ul className="space-y-4">
                      <li className="flex gap-2">
                        <span className="font-bold text-gray-700 min-w-max">
                          •
                        </span>
                        <CustomText variant="bodyM" className="text-gray-500">
                          <strong className="text-gray-700">
                            Artículo 37. Derecho al voto:
                          </strong>{" "}
                          &ldquo;El voto de cada propietario equivaldrá al
                          porcentaje del coeficiente de copropiedad del
                          respectivo bien privado.&ldquo;
                        </CustomText>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-gray-700 min-w-max">
                          •
                        </span>
                        <CustomText variant="bodyM" className="text-gray-500">
                          <strong className="text-gray-700">
                            Artículo 45. Quórum y mayorías:
                          </strong>{" "}
                          &ldquo;Con excepción de los casos en que la ley o el
                          reglamento de propiedad horizontal exijan un quórum o
                          mayoría superior, y de las reuniones de segunda
                          convocatoria previstas en el artículo 41, la asamblea
                          general sesionará con un número plural de propietarios
                          de unidades privadas que representen más de la mitad
                          de los coeficientes de copropiedad, y tomará
                          decisiones con el voto favorable de la mitad más uno
                          de dichos coeficientes.&rdquo;
                        </CustomText>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "perfil" && (
          <div className="flex flex-col items-center justify-center gap-6">
            {/* PROFILE HEADER CARD */}
            <div className="max-w-[450px] mx-auto bg-white rounded-3xl p-10 shadow-xl shadow-indigo-100/20 border border-gray-100 flex flex-col items-start gap-2 text-start relative overflow-hidden">
              <div className="flex items-start gap-2">
                <div className="bg-[#EEF0FF] p-2 rounded-full">
                  <CustomIcon
                    path={ICON_PATHS.accountCircle}
                    size={56}
                    className="text-[#6A7EFF]"
                  />
                </div>
                <div>
                  <CustomText
                    variant="TitleL"
                    className="text-[#0E3C42] font-bold"
                  >
                    {user?.firstName} {user?.lastName}
                  </CustomText>
                  <CustomText
                    variant="bodyX"
                    className="text-[#0E3C42] font-regular"
                  >
                    Código de ingreso: {user?.document}
                  </CustomText>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 w-full">
                <CustomButton
                  variant="secondary"
                  onClick={onLogout}
                  className=" flex items-center gap-2 py-2 px-4"
                >
                  <CustomIcon path={ICON_PATHS.exit} size={18} /> 
                  <CustomText variant="labelL" className="font-bold">
                    Cerrar sesión
                  </CustomText>
                </CustomButton>
                {/* Certificado de participación - Hidden as requested */}
                {/* 
                <button className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#8B9DFF] text-white font-black text-sm shadow-lg shadow-indigo-100 hover:bg-[#7a8ce0] transition active:scale-95">
                  <FileText size={18} /> Certificado de participación
                </button> 
                */}
              </div>
            </div>

            {/* PROPERTIES SECTION */}
            <div className="bg-white rounded-[40px] p-10 shadow-sm border w-full border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <CustomText variant="bodyX" className="text-#0E3C42] font-bold">
                  Propiedades
                </CustomText>

                <div className="relative w-full max-w-[151px]">
                  <select className="w-full border rounded-2xl px-5 py-4 outline-none font-bold text-[#0E3C42] text-sm appearance-none cursor-pointer">
                    <option>Ordenar por</option>
                    <option>Nombre</option>
                    <option>Coeficiente</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronRight size={16} className="rotate-90" />
                  </div>
                </div>
              </div>

              {/* COEFF BANNER */}
              <div className="bg-[#F3F6F9] rounded-2xl p-4 flex justify-between items-center mb-10 border border-gray-100/50">
                <CustomText variant="bodyL" className="text-[#1F1F23] ">
                  Coeficiente total
                </CustomText>
                <CustomText
                  variant="bodyX"
                  className="text-[#1F1F23] font-black"
                >
                  {(
                    registrationData?.representedProperties ||
                    user?.myRegistries ||
                    []
                  )
                    .reduce(
                      (acc, r) =>
                        acc +
                        parseFloat(
                          String(r.coeficiente || 0).replace(",", "."),
                        ),
                      0,
                    )
                    .toFixed(2)}
                  %
                </CustomText>
              </div>

              {/* GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {(
                  registrationData?.representedProperties ||
                  user?.myRegistries ||
                  []
                ).map((reg, idx) => {
                  const isProxy =
                    reg?.role?.toLowerCase() === "proxy" ||
                    reg?.role?.toLowerCase() === "apoderado";

                  // Icon mapping
                  const type = (reg.tipo || "").toLowerCase();
                  <CustomTypePropertie type={type} />;

                  return (
                    <div
                      key={idx}
                      className="p-6 rounded-3xl bg-white border border-[#DBE2E8]"
                    >
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50/50 flex items-center justify-center text-[#8B9DFF] group-hover:bg-[#8B9DFF] group-hover:text-white transition-all duration-300 shadow-sm">
                          <CustomTypePropertie type={type} />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <CustomText variant="bodyM" className="font-black">
                            {reg.tipo
                              ? reg.tipo === "-"
                                ? ""
                                : reg.tipo + " - "
                              : ""}
                            {reg.grupo
                              ? reg.grupo === "-"
                                ? ""
                                : reg.grupo + " - "
                              : ""}
                            {reg.propiedad}
                          </CustomText>
                          <div className="flex items-center gap-2 flex-wrap">
                            <CustomText
                              variant="bodyS"
                              className={`font-medium px-2 py-0.5 rounded-full ${
                                isProxy
                                  ? "text-[#00093F] bg-[#D5DAFF] "
                                  : "text-[#0E3C42] bg-[#B8EAF0]"
                              }`}
                            >
                              {isProxy ? "Apoderado" : "Propietario"}
                            </CustomText>

                            <CustomText variant="bodyS">
                              Coeficiente:{" "}
                              <strong className="text-gray-600">
                                {reg.coeficiente.slice(0, 4)}%
                              </strong>
                            </CustomText>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION (Visual) */}
              <div className="flex justify-center items-center gap-2">
                <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
                  <ChevronsLeft size={16} />
                </button>
                <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
                  <ChevronLeft size={16} />
                </button>
                <button className="w-10 h-10 rounded-xl bg-[#8B9DFF] flex items-center justify-center text-white font-black text-sm">
                  1
                </button>
                <button className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition font-bold text-sm">
                  2
                </button>
                <button className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition font-bold text-sm">
                  3
                </button>
                <span className="px-2 text-gray-300">...</span>
                <button className="w-24 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#0E3C42] transition font-bold text-xs uppercase tracking-widest gap-2">
                  Siguiente <ChevronRight size={14} />
                </button>
                <button className="w-24 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#0E3C42] transition font-bold text-xs uppercase tracking-widest gap-2">
                  Última <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="pointer-events-none fixed inset-0 z-[60]">
          {sortedQuestions
            .filter((q) => q.status === QUESTION_STATUS.LIVE)
            .map((q) => (
              <React.Fragment key={q.id}>
                {renderQuestion(q, { forceModalOnly: true })}
              </React.Fragment>
            ))}
        </div>
      </main>
    </div>
  );
}
