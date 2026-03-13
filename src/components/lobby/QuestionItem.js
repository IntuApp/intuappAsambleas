"use client";
import React, { useState, useEffect, useRef } from "react";
import { Check, AlertTriangle, ArrowDown } from "lucide-react";
import { toast } from "react-toastify";

// Importamos las constantes nuevas
import { QUESTION_STATUSES, QUESTION_TYPES } from "@/constans/questions";
import { submitBatchVotes } from "@/lib/assemblyVotes"; // Debes crear esta función luego

import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function QuestionItem({
  q,
  currentUser, // Recibimos el usuario completo para sacar su info
  userRegistries = [], // currentUser.representedProperties
  assembly,
  forceModalOnly = false,
  hideModal = false,
  userVotes = [],
  masterList,
  blockedProperties = [],
}) {

  // 1. Filtrar propiedades activas (que no estén bloqueadas)
  const activeRegistries = userRegistries.filter(
    (reg) => !blockedProperties.includes(reg.ownerId)
  );

  // 2. Filtrar propiedades que aún NO han votado en esta pregunta
  const registriesPending = activeRegistries.filter(
    (reg) => !userVotes.some((v) => v.propertyOwnerId === reg.ownerId && v.questionId === q.id)
  );

  const effectiveVoteBlocked = activeRegistries.length === 0;

  const scrollContainerRef = useRef(null);

  // ESTADOS DE VOTACIÓN
  const [mode, setMode] = useState(() => {
    if (activeRegistries.length <= 1) return "block";
    return currentUser?.votingPreference || "select";
  });

  useEffect(() => {
    let targetMode = mode;
    if (activeRegistries.length > 1) {
      targetMode = currentUser?.votingPreference || "select";
    } else {
      targetMode = "block";
    }
    if (targetMode !== mode) setMode(targetMode);
  }, [currentUser?.votingPreference, activeRegistries.length]);

  // Estados para Voto en Bloque (Guardamos el ID de la opción, NO el texto)
  const [blockSelectedOptionIds, setBlockSelectedOptionIds] = useState([]);
  const [blockOpenAnswer, setBlockOpenAnswer] = useState("");
  const [blockSelectedOptionId, setBlockSelectedOptionId] = useState(null);

  // Estados para Voto Individual
  const [individualVotes, setIndividualVotes] = useState({});
  const [selectedMode, setSelectedMode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const votedCount = activeRegistries.length - registriesPending.length;
  const isFullyVoted = activeRegistries.length > 0 && registriesPending.length === 0;

  const handleScrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 200, behavior: "smooth" });
    }
  };

  // Toggle para preguntas múltiples (Guardamos IDs)
  const toggleBlockOption = (optId) => {
    setBlockSelectedOptionIds((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    );
  };

  // --- ENVÍO DE VOTOS EN BLOQUE ---
  const submitBlockVote = async (answer) => {
    if (registriesPending.length === 0) return toast.info("Ya has votado.");

    if (q.typeId === QUESTION_TYPES.MULTIPLE && q.minSelections) {
      const selected = answer.optionIds || [];
      if (selected.length < q.minSelections) {
        return toast.error(`Debe seleccionar al menos ${q.minSelections} opciones`);
      }
    }

    setIsSubmitting(true);

    let selectedOptionIds = [];
    let openText = "";

    if (q.typeId === QUESTION_TYPES.OPEN) {
      openText = answer.answerText;
    } else if (q.typeId === QUESTION_TYPES.MULTIPLE) {
      selectedOptionIds = answer.optionIds;
    } else {
      selectedOptionIds = [answer.optionId];
    }

    // Armamos el array de votos (Un voto por cada propiedad pendiente)
    const votesToSubmit = registriesPending.map((reg) => ({
      questionId: q.id,
      propertyOwnerId: reg.ownerId,
      registrationId: currentUser.mainDocument,
      selectedOptionIds: selectedOptionIds,
      openTextAnswer: openText,
      votingPower: reg.coefi, // Usamos el coefi que guardamos en el registro
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
    }));

    const res = await submitBatchVotes(assembly.id, votesToSubmit);
    setIsSubmitting(false);
    if (res.success) setShowSuccess(true);
    else toast.error("Error al votar");
  };

  // --- ENVÍO DE VOTOS INDIVIDUALES ---
  const submitIndividualVotes = async () => {
    setIsSubmitting(true);
    const votesToSubmit = [];

    for (const reg of activeRegistries) {
      const ans = individualVotes[reg.ownerId];
      if (!ans) continue; // Si no respondió por esta propiedad, la salta

      let selectedOptionIds = [];
      let openText = "";

      if (ans.optionIds) selectedOptionIds = ans.optionIds;
      else if (ans.optionId) selectedOptionIds = [ans.optionId];
      else if (ans.answerText) openText = ans.answerText;

      if (q.typeId === QUESTION_TYPES.MULTIPLE && q.minSelections) {
        if (selectedOptionIds.length < q.minSelections) {
          setIsSubmitting(false);
          return toast.error(`Debe seleccionar al menos ${q.minSelections} opciones para la propiedad ${reg.ownerId}`);
        }
      }

      votesToSubmit.push({
        questionId: q.id,
        propertyOwnerId: reg.ownerId,
        registrationId: currentUser.mainDocument,
        selectedOptionIds: selectedOptionIds,
        openTextAnswer: openText,
        votingPower: reg.coefi,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      });
    }

    if (votesToSubmit.length === 0) return setIsSubmitting(false);

    const res = await submitBatchVotes(assembly.id, votesToSubmit);
    setIsSubmitting(false);
    if (res.success) setShowSuccess(true);
    else toast.error("Error al votar");
  };

  useEffect(() => {
    let timer;
    if (showSuccess) {
      timer = setTimeout(() => {
        setShowSuccess(false);
      }, 10000); // 10000ms = 10 segundos
    }

    return () => clearTimeout(timer);
  }, [showSuccess]);

  // Valida que todas las propiedades tengan exactamente el número de selecciones requeridas
  const isIndividualVoteValid = () => {
    if (q.typeId !== QUESTION_TYPES.MULTIPLE) {
      // Para otros tipos (Abierta/Única), validamos que exista respuesta en todas
      return Object.keys(individualVotes).length === activeRegistries.length;
    }

    // Para múltiple, iteramos cada propiedad activa
    return activeRegistries.every(reg => {
      const votes = individualVotes[reg.ownerId]?.optionIds || [];
      return votes.length === (q.minSelections || 0);
    });
  };

  // --- RENDERIZADOS CONDICIONALES ---
  if (q.statusId === QUESTION_STATUSES.FINISHED && votedCount === 0) return null;

  if (effectiveVoteBlocked) {
    if (forceModalOnly) return null;
    return (
      <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm opacity-60 mb-4">
        <CustomText variant="bodyM" className="font-bold text-[#0E3C42] mb-1">{q.title}</CustomText>
        <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 w-max mt-2">
          <AlertTriangle size={12} /> Bloqueado
        </span>
      </div>
    );
  }

  if (isFullyVoted && !showSuccess) {
    if (forceModalOnly) return null;
    return (
      <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm mb-4 flex items-center justify-between">
        <div>
          <CustomText variant="bodyM" className="font-bold text-[#0E3C42] mb-1">{q.title}</CustomText>
          <CustomText variant="bodyS" className="text-gray-400">Votación completada.</CustomText>
        </div>
        <div className="bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center">
          <Check size={20} strokeWidth={3} />
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {!forceModalOnly && (
        <div className="bg-indigo-50/50 border border-[#8B9DFF]/30 p-6 rounded-[24px] mb-4 animate-pulse">
          <CustomText variant="bodyM" className="font-bold text-[#0E3C42] mb-1">{q.title}</CustomText>
          <CustomText variant="bodyS" className="text-[#4059FF] font-bold">Votación en curso...</CustomText>
        </div>
      )}

      {!hideModal && (
        // 🔥 CORRECCIÓN 1: justify-end fuerza a que el contenido se pegue siempre abajo.
        <div className="fixed inset-0 z-[100] flex flex-col justify-end items-center pointer-events-auto">

          {/* Fondo oscuro con desenfoque */}
          <div className="absolute inset-0 bg-[#00093F]/40 backdrop-blur-[2px] pointer-events-none" />
          {/* 🔥 CORRECCIÓN 2: w-full y max-w-[850px] para que tenga el ancho exacto de tu imagen, y redondeado solo arriba */}
          <div className="bg-[#F3F6F9] w-full rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.1)] relative flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300 z-10 overflow-hidden">

            {showSuccess ? (
              // PANTALLA DE ÉXITO
              <div className="my-6 relative overflow-hidden bg-white p-10 md:p-12 flex flex-col items-center justify-center min-h-[380px] w-full max-w-[550px] mx-auto rounded-[32px] shadow-xl">

                {/* --- EFECTO DE FONDO (MESH GRADIENT) --- */}
                {/* 1. Mancha morada principal (Arriba Izquierda) */}
                <div className="absolute -top-12 -left-16 w-[300px] h-[300px] bg-[#94A2FF] opacity-80 blur-[90px] rounded-full pointer-events-none" />

                {/* 2. Mancha verde (Arriba Centro/Derecha) */}
                <div className="absolute top-1/4 -left-16 w-[200px] h-[300px] bg-[#ABE7E5] opacity-80 blur-[90px] rounded-full pointer-events-none" />

                {/* 3. Mancha morada secundaria (Centro Izquierda bajando) */}
                <div className="absolute -top-10 right-30 w-[150px] h-[300px] bg-[#ABE7E5] opacity-90 blur-[100px] rounded-full pointer-events-none" />

                {/* 4. Mancha verde de mezcla (Centro) */}
                <div className="absolute top-1/4 right-1/3 w-[250px] h-[300px] bg-[#94A2FF] opacity-50 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col text-left">
                  <div className="flex items-start w-full mb-6">
                    {/* Ajusta la ruta de tu logo si es necesario */}
                    <img src="/logos/logo/symbole.png" alt="Logo" className="h-14 w-auto" />
                  </div>

                  <div className="flex flex-col items-start w-full mb-8">
                    <CustomText variant="TitleL" className="font-black text-[#0E3C42] mb-3 text-2xl md:text-3xl">
                      Tu votación fue exitosa!
                    </CustomText>
                    <CustomText variant="bodyM" className="text-[#0E3C42] font-medium leading-relaxed pr-4">
                      Podrás ver tus votos y el resultado de las votaciones en la opción “Resultados” del menú inferior
                    </CustomText>
                  </div>

                  <CustomButton
                    onClick={() => setShowSuccess(false)}
                    className="py-4 px-6 w-full shadow-lg shadow-[#94A2FF]/30 transition-transform active:scale-[0.98]"
                    variant="primary"
                  >
                    <CustomText variant="bodyM" className="font-bold">Aceptar</CustomText>
                  </CustomButton>
                </div>
              </div>
            ) : (
              <>
                {/* Contenedor del contenido con scroll interno */}
                <div ref={scrollContainerRef} className="w-full overflow-y-auto no-scrollbar px-6 py-10 flex flex-col items-center relative">

                  {/* Banners dinámicos según el modo */}
                  {mode === "individual" && activeRegistries.length > 1 && (
                    <div className="bg-[#FFEDDD] border border-[#F98A56] rounded-xl py-3 px-4 max-w-[564px] w-full flex items-start gap-2 mb-6 shrink-0">
                      <CustomIcon path={ICON_PATHS.warning} size={18} className="text-[#F98A56] mt-0.5" />
                      <CustomText variant="bodyS" className="text-[#1F1F23] font-bold">Recuerda que vas a votar individualmente por cada propiedad.</CustomText>
                    </div>
                  )}

                  {/* --- PASO 1: SELECCIONAR MODO --- */}
                  {mode === "select" ? (
                    <div className="flex flex-col items-center max-w-[564px]  mx-auto gap-5">
                      <div className="flex items-start w-full mb-2 pl-2">
                        <CustomText variant="TitleM" className="text-[#0E3C42] font-black">¿Cómo quieres votar en esta asamblea?</CustomText>
                      </div>
                      <div className="flex flex-col gap-4 w-full">
                        {["individual", "block"].map((m) => (
                          <button
                            key={m}
                            onClick={() => setSelectedMode(m)}
                            className={`w-full px-5 py-4 rounded-lg border-[1.5px] flex items-center gap-4 transition-all ${selectedMode === m ? "border-[#4059FF] bg-indigo-50/30 shadow-sm" : "border-[#E5E9F0] bg-white hover:border-gray-300"}`}
                          >
                            <div className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedMode === m ? "border-[#4059FF]" : "border-gray-300"}`}>
                              {selectedMode === m && <div className="w-3 h-3 rounded-full bg-[#4059FF]" />}
                            </div>
                            <div className="text-left">
                              <CustomText variant="bodyM" className={`block text-[#0E3C42] capitalize ${m === selectedMode ? "font-bold" : "font-semibold"}`}>
                                {m === "block" ? "En bloque" : "Individual"}
                              </CustomText>
                              <CustomText variant="bodyS" className="text-gray-500 font-medium mt-0.5">
                                {m === "block" ? "Responde una sola vez y tu voto aplicará a todas tus Representaciones." : "Responde cada pregunta por cada propiedad que tengas."}
                              </CustomText>
                            </div>
                          </button>
                        ))}
                      </div>
                      <CustomButton
                        variant="primary"
                        disabled={!selectedMode}
                        onClick={() => setMode(selectedMode)}
                        className="w-full py-4 mt-2"
                      >
                        <CustomText variant="bodyM" className="font-bold">Continuar</CustomText>
                      </CustomButton>
                    </div>
                  ) : (

                    /* --- PASO 2: VOTAR --- */
                    <div className="w-full max-w-[564px] mx-auto pb-6">
                      <div className="mb-3">
                        <CustomText variant="TitleM" className="text-[#0E3C42] leading-tight font-black">{q.title}</CustomText>
                      </div>
                      {q.typeId === QUESTION_TYPES.MULTIPLE && (
                        <CustomText variant="bodyL" className="text-[#0E3C42] text-left font-bold mb-3">
                          Seleccione {q.minSelections} opciones
                        </CustomText>
                      )}

                      {mode === "block" ? (
                        /* MODO BLOQUE */
                        <div className="flex flex-col gap-3">

                          {/* ÚNICA Y SÍ/NO */}
                          {(q.typeId === QUESTION_TYPES.UNIQUE || q.typeId === QUESTION_TYPES.YES_NO) && (
                            <div className="flex flex-col gap-3">
                              {q.options.map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() => setBlockSelectedOptionId(opt.id)}
                                  className={`p-4 rounded-xl w-full border-[1.5px] flex flex-row gap-4 font-medium items-center transition-all ${blockSelectedOptionId === opt.id ? "border-[#4059FF] bg-indigo-50/30" : "bg-white border-[#E5E9F0] hover:border-gray-300"}`}
                                >
                                  <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${blockSelectedOptionId === opt.id ? "border-[#4059FF]" : "border-gray-300"}`}>
                                    {blockSelectedOptionId === opt.id && <div className="w-2.5 h-2.5 bg-[#4059FF] rounded-full" />}
                                  </div>
                                  <CustomText variant="bodyM" className={`text-[#0E3C42] text-left ${blockSelectedOptionId === opt.id ? "font-bold" : "font-medium"}`}>
                                    {opt.text}
                                  </CustomText>
                                </button>
                              ))}
                              <CustomButton disabled={!blockSelectedOptionId || isSubmitting} onClick={() => submitBlockVote({ optionId: blockSelectedOptionId })} variant="primary" className="w-full py-4 mt-6 shadow-lg shadow-indigo-100">
                                <CustomText variant="bodyM" className="font-bold">Votar</CustomText>
                              </CustomButton>
                            </div>
                          )}

                          {/* MÚLTIPLE EN BLOQUE */}
                          {q.typeId === QUESTION_TYPES.MULTIPLE && (
                            <div className="flex flex-col gap-3">
                              {q.options.map((opt) => {
                                const isSelected = blockSelectedOptionIds.includes(opt.id);
                                // Bloquear si ya llegó al límite y esta opción no está seleccionada
                                const isDisabled = !isSelected && blockSelectedOptionIds.length >= (q.minSelections || 0);

                                return (
                                  <label
                                    key={opt.id}
                                    className={`flex items-center gap-4 p-4 rounded-xl w-full border-[1.5px] transition-all 
                                      ${isSelected ? "border-[#4059FF] bg-indigo-50/30" : "bg-white border-[#E5E9F0]"} 
                                      ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-300"}`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="hidden"
                                      checked={isSelected}
                                      disabled={isDisabled}
                                      onChange={() => toggleBlockOption(opt.id)}
                                    />
                                    <div className={`w-5 h-5 shrink-0 rounded-[6px] border-2 flex items-center justify-center 
                                      ${isSelected ? "border-[#4059FF] bg-[#4059FF]" : "border-gray-300"}`}>
                                      {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                    </div>
                                    <CustomText variant="bodyM" className={`text-[#0E3C42] text-left ${isSelected ? "font-bold" : "font-medium"}`}>
                                      {opt.text}
                                    </CustomText>
                                  </label>
                                );
                              })}

                              <CustomButton
                                // Habilitar SOLO si es exactamente igual a minSelections
                                disabled={blockSelectedOptionIds.length !== (q.minSelections || 0) || isSubmitting}
                                onClick={() => submitBlockVote({ optionIds: blockSelectedOptionIds })}
                                variant="primary"
                                className="w-full py-4 mt-6 shadow-lg shadow-indigo-100"
                              >
                                <CustomText variant="bodyM" className="font-bold">Confirmar Voto</CustomText>
                              </CustomButton>
                            </div>
                          )}

                          {/* ABIERTA */}
                          {q.typeId === QUESTION_TYPES.OPEN && (
                            <div className="flex flex-col gap-3">
                              <textarea
                                placeholder="Escribe tu respuesta aquí..."
                                className="w-full border-[1.5px] border-[#E5E9F0] rounded-xl p-5 min-h-[140px] focus:outline-none focus:border-[#4059FF] resize-none text-[#0E3C42]"
                                value={blockOpenAnswer}
                                onChange={(e) => setBlockOpenAnswer(e.target.value)}
                              />
                              <CustomButton disabled={!blockOpenAnswer.trim() || isSubmitting} onClick={() => submitBlockVote({ answerText: blockOpenAnswer })} variant="primary" className="w-full py-4 mt-4 shadow-lg shadow-indigo-100">
                                <CustomText variant="bodyM" className="font-bold">Enviar Respuesta</CustomText>
                              </CustomButton>
                            </div>
                          )}

                        </div>
                      ) : (

                        /* MODO INDIVIDUAL */
                        <div className="space-y-6 w-full">
                          {activeRegistries.map((reg) => {
                            const excelInfo = masterList[reg.ownerId] || {};
                            const tipo = excelInfo.Tipo || excelInfo.tipo || "";
                            const grupo = excelInfo.Grupo || excelInfo.grupo || "";
                            const propiedadNombre = excelInfo.Propiedad || excelInfo.propiedad || reg.ownerId;
                            return (
                              <div key={reg.ownerId} className="bg-white rounded-[24px] p-6 flex flex-col gap-5 border border-gray-100 shadow-sm">
                                <CustomText variant="bodyX" className="font-black text-[#0E3C42]">
                                  {tipo} {grupo} {propiedadNombre}
                                </CustomText>

                                {q.typeId === QUESTION_TYPES.OPEN ? (
                                  <textarea
                                    placeholder="Escribe tu respuesta aquí..."
                                    className="w-full border-[1.5px] border-[#E5E9F0] rounded-xl p-4 min-h-[100px] focus:outline-none focus:border-[#4059FF] resize-none text-[#0E3C42]"
                                    value={individualVotes[reg.ownerId]?.answerText || ""}
                                    onChange={(e) => setIndividualVotes(p => ({ ...p, [reg.ownerId]: { answerText: e.target.value } }))}
                                  />
                                ) : (
                                  <div className="flex flex-col gap-3">
                                    {/* MÚLTIPLE INDIVIDUAL */}
                                    {q.options.map((opt) => {
                                      const isMultiple = q.typeId === QUESTION_TYPES.MULTIPLE;
                                      const currentVotes = individualVotes[reg.ownerId]?.optionIds || [];
                                      const isSelected = isMultiple
                                        ? currentVotes.includes(opt.id)
                                        : individualVotes[reg.ownerId]?.optionId === opt.id;

                                      // Lógica de deshabilitar para individual múltiple
                                      const isDisabled = isMultiple && !isSelected && currentVotes.length >= (q.minSelections || 0);

                                      return (
                                        <button
                                          key={opt.id}
                                          disabled={isDisabled}
                                          onClick={() => {
                                            if (isMultiple) {
                                              setIndividualVotes((prev) => {
                                                const regVote = prev[reg.ownerId] || {};
                                                const currentOpts = regVote.optionIds || [];
                                                const isSel = currentOpts.includes(opt.id);
                                                let newOpts;
                                                if (isSel) newOpts = currentOpts.filter((id) => id !== opt.id);
                                                else newOpts = [...currentOpts, opt.id];
                                                return { ...prev, [reg.ownerId]: { ...regVote, optionIds: newOpts } };
                                              });
                                            } else {
                                              setIndividualVotes((p) => ({ ...p, [reg.ownerId]: { optionId: opt.id } }));
                                            }
                                          }}
                                          className={`p-4 rounded-xl border-[1.5px] flex flex-row gap-4 items-center transition-all 
                                            ${isSelected ? "border-[#4059FF] bg-indigo-50/30" : "bg-white border-[#E5E9F0]"}
                                            ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-300"}`}
                                        >
                                          {/* ... (tus iconos de Check o Radio) ... */}
                                          {isMultiple ? (
                                            // Icono Checkbox para Múltiple
                                            <div className={`w-5 h-5 shrink-0 rounded-[6px] border-2 flex items-center justify-center 
                                              ${isSelected ? "border-[#4059FF] bg-[#4059FF]" : "border-gray-300"}`}>
                                              {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                            </div>
                                          ) : (
                                            // Icono Radio para Única / Sí-No
                                            <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center 
                                              ${isSelected ? "border-[#4059FF]" : "border-gray-300"}`}>
                                              {isSelected && <div className="w-2.5 h-2.5 bg-[#4059FF] rounded-full" />}
                                            </div>
                                          )}
                                          <CustomText variant="bodyM" className={`text-[#0E3C42] text-left ${isSelected ? "font-bold" : "font-medium"}`}>
                                            {opt.text}
                                          </CustomText>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          <CustomButton
                            onClick={submitIndividualVotes}
                            // Usamos nuestra función de validación
                            disabled={!isIndividualVoteValid() || isSubmitting}
                            className="w-full py-4 mt-2 shadow-lg shadow-indigo-100"
                            variant="primary"
                          >
                            <CustomText variant="bodyM" className="font-bold">Votar</CustomText>
                          </CustomButton>
                        </div>
                      )}
                    </div>
                  )}
                </div>


              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}