"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-toastify";
import {
  Home, BarChart2, User, HelpCircle, Check, AlertTriangle,
  ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft,
  ChevronDown, MessageCircle,
  LogOut
} from "lucide-react";

// Métodos de lectura
import { listenToAssemblyLive, getEntityMasterList } from "@/lib/assembly";
import { listenToEntityById } from "@/lib/entity";
import { QUESTION_STATUSES, QUESTION_TYPES } from "@/constans/questions"; // CONSTANTES NUEVAS

// Componentes Base
import Loader from "@/components/basics/Loader";
import LobbyHome from "@/components/lobby/LobbyHome";
import QuestionItem from "@/components/lobby/QuestionItem"; // El Modal que corregimos antes
import QuestionCard from "@/components/assemblies/QuestionCard"; // Tu tarjeta original
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomTypePropertie from "@/components/join/CustomTypePropertie";
import LobbyProfile from "@/components/lobby/LobbyProfile";

// --- SUBCOMPONENTE NAVEGACIÓN ---
const NavItem = ({ id, icon, label, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${activeTab === id
      ? "bg-[#8B9DFF] text-[#0E3C42]"
      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
      }`}
  >
    <CustomIcon path={icon} size={24} />
    <CustomText variant="labelM" className={`${activeTab === id ? "font-bold text-[#0E3C42]" : "font-regular text-[#3D3D44]"} `} > {label}</CustomText>
  </button >
);

export default function AsambleistaLobbyPage() {
  const { assemblyId } = useParams();
  const router = useRouter();

  // ESTADOS GLOBALES
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [registrationsData, setRegistrationsData] = useState(null);
  const [assembly, setAssembly] = useState(null);
  const [entity, setEntity] = useState(null);
  const [masterList, setMasterList] = useState({});

  // ESTADOS DE NAVEGACIÓN (Tus estados originales)
  const [activeTab, setActiveTab] = useState("inicio");
  const [resultSubTab, setResultSubTab] = useState("global"); // 'global' | 'mine'
  const [openFaq, setOpenFaq] = useState(null);
  const [userVotingPreference, setUserVotingPreference] = useState("block");

  // ESTADOS DE VOTACIONES
  const [questionsList, setQuestionsList] = useState([]);
  const [votes, setVotes] = useState([]);
  const [sortPropertiesBy, setSortPropertiesBy] = useState("default");
  // 1. ESCUCHAR ASAMBLEA Y ENTIDAD
  useEffect(() => {
    if (!assemblyId) return;
    const unsubAssembly = listenToAssemblyLive(assemblyId, (data) => {
      if (!data) {
        toast.error("La asamblea no existe.");
        return router.push("/");
      }
      setAssembly(data.assembly);
      if (data.assembly.entityId && Object.keys(masterList).length === 0) {
        const unsubEntity = listenToEntityById(data.assembly.entityId, async (entData) => {
          setEntity(entData);
          if (entData.assemblyRegistriesListId) {
            const master = await getEntityMasterList(entData.assemblyRegistriesListId);
            setMasterList(master);
          }
        });
        return () => unsubEntity();
      }
    });
    return () => unsubAssembly();
  }, [assemblyId, router]);

  // 2. ESCUCHAR REGISTROS, PREGUNTAS Y VOTOS
  useEffect(() => {
    const sessionDocument = sessionStorage.getItem(`assembly_session_${assemblyId}`);
    if (!sessionDocument) return router.replace(`/join/${assemblyId}`);

    // A. Registros
    const qReg = query(collection(db, "assemblyRegistrations"), where("assemblyId", "==", assemblyId));
    const unsubReg = onSnapshot(qReg, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setRegistrationsData(data);
        const myUserData = (data.registrations || []).find(reg => String(reg.mainDocument) === String(sessionDocument) && !reg.isDeleted);
        if (!myUserData) {
          sessionStorage.removeItem(`assembly_session_${assemblyId}`);
          return router.replace(`/join/${assemblyId}`);
        }
        setCurrentUser(myUserData);
        setUserVotingPreference(myUserData.votingPreference || "block");
        setLoading(false);
      } else setLoading(false);
    });

    // B. Preguntas
    const qRef = doc(db, "assemblyQuestions", assemblyId);
    const unsubQ = onSnapshot(qRef, (docSnap) => {
      if (docSnap.exists()) setQuestionsList(docSnap.data().questions || []);
    });

    // C. Votos
    const vRef = doc(db, "assemblyVotes", assemblyId);
    const unsubV = onSnapshot(vRef, (docSnap) => {
      if (docSnap.exists()) setVotes(docSnap.data().votes || []);
    });

    return () => { unsubReg(); unsubQ(); unsubV(); };
  }, [assemblyId, router]);

  // 3. CÁLCULOS MATEMÁTICOS (Igual a tu código anterior)
  const { totalCount, registeredCount, quorumPercentage } = useMemo(() => {
    const total = Object.keys(masterList || {}).length || 0;
    if (total === 0 || !registrationsData?.registrations) return { totalCount: 0, registeredCount: 0, quorumPercentage: 0 };
    const parseCoef = (val) => parseFloat(String(val || 0).replace(",", ".")) || 0;
    let regCount = 0; let currentSum = 0;
    registrationsData.registrations.forEach(user => {
      if (!user.isDeleted && user.representedProperties) {
        regCount += user.representedProperties.length;
        user.representedProperties.forEach(prop => {
          const coef = parseCoef(prop.coefi || masterList[prop.ownerId]?.Coeficiente || masterList[prop.ownerId]?.coeficiente);
          currentSum += coef;
        });
      }
    });
    const totalSum = Object.values(masterList).reduce((acc, p) => acc + parseCoef(p.Coeficiente || p.coeficiente), 0);
    return { totalCount: total, registeredCount: regCount, quorumPercentage: totalSum > 0 ? (currentSum / totalSum) * 100 : 0 };
  }, [masterList, registrationsData]);

  // DATOS DERIVADOS DE VOTACIONES
  const sortedQuestions = useMemo(() => [...questionsList].reverse(), [questionsList]);
  const userVotes = useMemo(() =>
    votes.filter((v) => currentUser?.representedProperties?.some((r) => r.ownerId === v.propertyOwnerId)),
    [votes, currentUser]);


  const handleJoinMeeting = () => {
    if (assembly?.meetLink) {
      let finalUrl = assembly.meetLink.trim();

      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }

      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.info("El enlace de la videollamada aún no está disponible.");
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem(`assembly_session_${assemblyId}`);
    router.push(`/join/${assemblyId}`);
  };

  if (loading || !currentUser || !assembly || !entity) return <Loader />;

  return (
    <div className="flex min-h-screen font-sans">

      {/* SIDEBAR DESKTOP */}
      <aside className="w-24 bg-white gap-8 flex items-center flex-col py-8">
        <div className="">
          <div className="">
            <img src="/logos/logo-header.png" alt="Logo" />
          </div>
        </div>
        <div className="flex flex-col gap-2 px-2 flex-1">
          <NavItem id="inicio" icon={ICON_PATHS.home} label="Inicio" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="resultados" icon={ICON_PATHS.analytics} label="Resultados" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="perfil" icon={ICON_PATHS.person} label="Perfil" activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="ayuda" icon={ICON_PATHS.helpCircle} label="Ayuda" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL (Márgenes originales restaurados + mb-16 para móvil) */}
      <main className="flex-1 flex flex-col overflow-y-auto px-16 py-8 bg-[#F3F6F9]">

        {/* HEADER SUPERIOR ORIGINAL */}
        <div className="flex justify-between items-center mb-6">
          <div className=" bg-white rounded-full p-2 flex items-center gap-2 px-4 shadow-sm border border-gray-100">
            <CustomIcon path={ICON_PATHS.home} className="text-[#000000]" size={20} />
            {activeTab !== "inicio" && <CustomText variant="labelM" className="text-black font-bold pt-0.5">{">"}</CustomText>}
            {activeTab === "resultados" && <CustomText variant="labelM" className="text-black font-bold">Resultados</CustomText>}
            {activeTab === "perfil" && <CustomText variant="labelM" className="text-black font-bold">Perfil</CustomText>}
            {activeTab === "ayuda" && <CustomText variant="labelM" className="text-black font-bold">Ayuda</CustomText>}
          </div>

          <div className="border-[#1D7D89] border flex items-center bg-[#1D7D89] justify-between gap-2 py-1 px-2 rounded-full shadow-sm">
            <CustomText variant="labelM" className="font-bold text-white">{currentUser?.mainDocument}</CustomText>
            <div className="w-8 h-8 rounded-full bg-[#ABE7E5] flex items-center justify-center">
              <CustomIcon path={ICON_PATHS.person} className="text-[#1C6168]" size={24} />
            </div>
          </div>
        </div>

        {/* ---------------- PESTAÑA: INICIO ---------------- */}
        {activeTab === "inicio" && (
          <LobbyHome
            currentUser={currentUser}
            assembly={assembly}
            entity={entity}
            masterList={masterList}
            onJoinMeeting={handleJoinMeeting}
            quorumPercentage={quorumPercentage}
            registeredCount={registeredCount}
            totalCount={totalCount}
            blockedProperties={registrationsData?.blockedProperties || []}
          />
        )}

        {/* ---------------- PESTAÑA: RESULTADOS ---------------- */}
        {activeTab === "resultados" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* TABS INTERNOS */}
            <div className="w-full bg-[#FFFFFF] rounded-full p-2 border border-[#F3F6F9] flex flex-row gap-2 shadow-sm">
              <CustomButton onClick={() => setResultSubTab("global")} className={`flex-1 py-3 ${resultSubTab === "global" ? "bg-[#D5DAFF] border-none" : "bg-white border-none"}`}>
                <CustomText variant="labelL" className="text-[#000000] font-bold">Gestionar asambleístas</CustomText>
              </CustomButton>
              <CustomButton onClick={() => setResultSubTab("mine")} className={`flex-1 py-3 ${resultSubTab === "mine" ? "bg-[#D5DAFF] border-none" : "bg-white border-none"}`}>
                <CustomText variant="labelL" className="text-[#000000] font-bold">Gestionar votaciones</CustomText>
              </CustomButton>
            </div>

            {/* TAB GLOBAL */}
            {resultSubTab === "global" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">Asamblea {assembly.name}</CustomText>
                  <CustomText variant="labelL" className="text-[#0E3C42] font-regular">Estos son los resultados de las votaciones de esta asamblea.</CustomText>
                </div>

                {(() => {
                  const questionsToShow = assembly.statusId === "3" ? sortedQuestions : sortedQuestions.filter(q => q.statusId === QUESTION_STATUSES.FINISHED || q.statusId === QUESTION_STATUSES.LIVE);

                  if (assembly.statusId !== "3" && questionsToShow.length === 0) return (
                    <div className="bg-white p-12 rounded-[32px] border border-gray-100 shadow-sm text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-[#8B9DFF] mb-6"><BarChart2 size={32} /></div>
                      <h3 className="text-xl font-bold text-[#0E3C42] mb-2">Resultados Globales en Espera</h3>
                      <p className="text-gray-400 max-w-xs mx-auto text-sm font-medium">Los resultados aparecerán aquí a medida que el administrador finalice cada votación.</p>
                    </div>
                  );
                  if (questionsToShow.length === 0) return null;

                  return questionsToShow
                    .filter(q => q.statusId === QUESTION_STATUSES.FINISHED)
                    .map(q => <QuestionCard key={q.id} q={q} registries={registrationsData?.registrations || []} isAdmin={false} votes={votes} assembyStatus={assembly.statusId} />);
                })()}
              </div>
            )}

            {/* TAB MIS VOTOS (MINE) */}
            {resultSubTab === "mine" && (
              <div className="flex flex-col gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-4">
                  <div>
                    <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">Preferencia de Votación</CustomText>
                    <CustomText variant="labelL" className="text-[#0E3C42] font-regular">Selecciona cómo quieres responder las votaciones de esta asamblea. Podrás cambiarlo si no has votado.</CustomText>
                  </div>
                  <div className="flex items-center gap-8">
                    {/* Botón Individual */}
                    <div onClick={() => setUserVotingPreference("individual")} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${userVotingPreference === "individual" ? "bg-[#8B9DFF] border-[#8B9DFF]" : "border-gray-300"}`}>
                        {userVotingPreference === "individual" && <Check size={16} className="text-black" />}
                      </div>
                      <span className={`block text-sm font-bold ${userVotingPreference === "individual" ? "text-[#0E3C42]" : "text-gray-400"}`}>Votar individual</span>
                    </div>
                    {/* Botón Bloque */}
                    <div onClick={() => setUserVotingPreference("block")} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${userVotingPreference === "block" ? "bg-[#8B9DFF] border-[#8B9DFF]" : "border-gray-300"}`}>
                        {userVotingPreference === "block" && <Check size={16} className="text-black" />}
                      </div>
                      <span className={`block text-sm font-bold ${userVotingPreference === "block" ? "text-[#0E3C42]" : "text-gray-400"}`}>Votar en bloque</span>
                    </div>
                  </div>
                </div>

                {sortedQuestions.filter(q => q.statusId !== QUESTION_STATUSES.CREATED).map((q) => {

                  // LÓGICA PARA RENDERIZAR LAS RESPUESTAS YA DADAS POR EL USUARIO
                  const propertiesToUse = currentUser?.representedProperties || [];
                  const votesByProperty = propertiesToUse.map((r) => {
                    const foundVote = userVotes.find((v) => v.questionId === q.id && v.propertyOwnerId === r.ownerId);
                    if (!foundVote) return null;

                    let answer = null;
                    if (q.typeId === QUESTION_TYPES.OPEN) {
                      answer = { answerText: foundVote.openTextAnswer };
                    } else if (q.typeId === QUESTION_TYPES.MULTIPLE || q.typeId === QUESTION_TYPES.YES_NO || q.typeId === QUESTION_TYPES.UNIQUE) {
                      // Traduce los IDs de las opciones seleccionadas a texto legible
                      const translatedOptions = (foundVote.selectedOptionIds || []).map(id => {
                        const match = q.options?.find(opt => opt.id === id);
                        return match ? match.text : id;
                      });
                      answer = { options: translatedOptions };
                    }
                    return { registry: r, answer };
                  }).filter(Boolean);

                  const groups = Object.values(votesByProperty.reduce((acc, current) => {
                    const ansKey = JSON.stringify(current.answer);
                    if (!acc[ansKey]) acc[ansKey] = { answer: current.answer, properties: [] };
                    acc[ansKey].properties.push(current.registry);
                    return acc;
                  }, {}));

                  return (
                    <div key={q.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm mb-6">
                      <CustomText variant="TitleS" className="text-[#0E3C42] font-bold mb-4">{q.title}</CustomText>

                      {groups.length > 0 ? (
                        <div className="flex flex-col gap-6">
                          {groups.map((group, idx) => (
                            <div key={idx} className="flex flex-col gap-3">
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-xs text-gray-400 font-medium">Respuesta de:</span>
                                {group.properties.map((reg, rIdx) => {
                                  const propInfo = masterList[reg.ownerId] || {};
                                  return (
                                    <span key={rIdx} className="bg-indigo-50 text-[#4059FF] text-[10px] font-black uppercase px-2 py-1 rounded-md border border-indigo-100">
                                      {propInfo.Tipo ? `${propInfo.Tipo} - ` : ""}{propInfo.Propiedad || reg.ownerId}
                                    </span>
                                  )
                                })}
                              </div>
                              <div className="flex flex-col gap-3">
                                {/* Mapeamos las respuestas para que se vean bien */}
                                {(group.answer.options || [group.answer.answerText]).map((textAnswer, tIdx) => (
                                  <div key={tIdx} className="w-full p-4 rounded-xl border border-[#4059FF] bg-[#EEF0FF] flex items-center gap-3">
                                    <div className="w-5 h-5 bg-[#4059FF] rounded-md flex items-center justify-center shrink-0">
                                      <Check size={14} className="text-white" strokeWidth={3} />
                                    </div>
                                    <CustomText variant="bodyM" className="font-bold text-[#0E3C42]">
                                      {textAnswer}
                                    </CustomText>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 text-center">
                          <CustomText variant="bodyS" className="font-bold text-gray-400">No has votado en esta pregunta o la votación está en curso.</CustomText>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------- PESTAÑA: PERFIL ---------------- */}
        {activeTab === "perfil" && (
          <LobbyProfile
            currentUser={currentUser}
            masterList={masterList}
            onLogout={handleLogout}
          />
        )}

        {/* ---------------- PESTAÑA: AYUDA ---------------- */}
        {activeTab === "ayuda" && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <CustomText variant="TitleM" className="font-black text-[#0E3C42] mb-8">Preguntas frecuentes</CustomText>
            {/* Acordeones de ayuda */}
          </div>
        )}

        {/* ---------------- MODAL FLOTANTE DE VOTACIÓN EN VIVO ---------------- */}
        {sortedQuestions
          .filter((q) => q.statusId === QUESTION_STATUSES.LIVE)
          .map((q) => (
            <QuestionItem
              key={q.id}Estás seguro de
              q={q}
              currentUser={currentUser}
              userRegistries={currentUser?.representedProperties || []}
              assembly={assembly}
              userVotes={votes}
              blockedProperties={registrationsData?.blockedProperties || []}
              hideModal={false}
              forceModalOnly={true}
            />
          ))}

      </main>
    </div>
  );
}