"use client";
import React, { useState, useEffect, useRef } from "react";
import { Check, AlertTriangle, ArrowDown } from "lucide-react";
import {
  QUESTION_STATUS,
  QUESTION_TYPES,
  submitBatchVotes,
} from "@/lib/questions";
import { toast } from "react-toastify";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

export default function QuestionItem({
  q,
  userRegistries = [],
  assembly,
  userVotingPreference,
  onSetVotingPreference,
  forceModalOnly = false,
  hideModal = false,
  userVotes = [],
  currentUser,
}) {
  const activeRegistries = userRegistries.filter(
    (reg) =>
      !reg.voteBlocked && !(assembly?.blockedVoters || []).includes(reg.id),
  );

  const registriesPending = activeRegistries.filter(
    (reg) =>
      !userVotes.some(
        (v) => v.propertyOwnerId === reg.id && v.questionId === q.id,
      ),
  );
  const effectiveVoteBlocked = activeRegistries.length === 0;

  // Ref para el contenedor del scroll
  const scrollContainerRef = useRef(null);

  const [mode, setMode] = useState(() => {
    if (assembly?.votingMode) return assembly.votingMode;
    if (activeRegistries.length <= 1) return "block";
    return userVotingPreference || "select";
  });

  useEffect(() => {
    let targetMode = mode;
    if (assembly?.votingMode) {
      targetMode = assembly.votingMode;
    } else if (activeRegistries.length > 1) {
      targetMode = userVotingPreference || "select";
    } else {
      targetMode = "block";
    }

    if (targetMode !== mode) {
      setMode(targetMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembly?.votingMode, userVotingPreference, activeRegistries.length]);

  const [blockSelectedOptions, setBlockSelectedOptions] = useState([]);
  const [blockOpenAnswer, setBlockOpenAnswer] = useState("");
  const [blockSelectedOption, setBlockSelectedOption] = useState(null);
  const [individualVotes, setIndividualVotes] = useState({});
  const [selectedMode, setSelectedMode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const votedCount = activeRegistries.length - registriesPending.length;
  const isFullyVoted =
    activeRegistries.length > 0 && registriesPending.length === 0;

  // Función para manejar el scroll con la flecha
  const handleScrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        top: 200, // Cantidad de pixeles a bajar
        behavior: "smooth",
      });
    }
  };

  const toggleBlockOption = (opt) => {
    setBlockSelectedOptions((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt],
    );
  };

  const submitBlockVote = async (answer) => {
    if (registriesPending.length === 0) return toast.info("Ya has votado.");

    // Validation
    if (q.type === QUESTION_TYPES.MULTIPLE && q.minSelections) {
      const selected = answer.options || [];
      if (selected.length < q.minSelections) {
        return toast.error(
          `Debe seleccionar al menos ${q.minSelections} opciones`,
        );
      }
    }

    setIsSubmitting(true);

    // Prepare selectedOptions array
    let selectedOpts = [];
    if (q.type === QUESTION_TYPES.OPEN) {
      selectedOpts = [answer.answerText];
    } else if (q.type === QUESTION_TYPES.MULTIPLE) {
      selectedOpts = answer.options;
    } else {
      selectedOpts = [answer.option];
    }

    const votes = registriesPending.map((reg) => ({
      propertyOwnerId: reg.id,
      registrationId: currentUser?.id || currentUser?.document || "unknown",
      selectedOptions: selectedOpts,
      votingPower: reg.coeficiente,
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      role: reg.role || "owner",
      userDocument: currentUser?.document || currentUser?.userDocument || "",
    }));

    const res = await submitBatchVotes(assembly.id, q.id, votes);
    setIsSubmitting(false);
    if (res.success) setShowSuccess(true);
    else toast.error("Error al votar");
  };

  const submitIndividualVotes = async () => {
    setIsSubmitting(true);
    const votes = [];

    // Validate each registry has sufficient answers IF required
    for (const reg of activeRegistries) {
      const ans = individualVotes[reg.id];
      if (!ans) continue;

      let selectedOpts = [];
      if (ans.options) selectedOpts = ans.options;
      else if (ans.option) selectedOpts = [ans.option];
      else if (ans.answerText) selectedOpts = [ans.answerText];

      // Validation
      if (q.type === QUESTION_TYPES.MULTIPLE && q.minSelections) {
        if (selectedOpts.length < q.minSelections) {
          setIsSubmitting(false);
          return toast.error(
            `Propiedad ${reg.propiedad}: Debe seleccionar al menos ${q.minSelections} opciones`,
          );
        }
      }

      votes.push({
        propertyOwnerId: reg.id,
        registrationId: currentUser?.id || currentUser?.document || "unknown",
        selectedOptions: selectedOpts,
        votingPower: reg.coeficiente,
        firstName: currentUser?.firstName || "",
        lastName: currentUser?.lastName || "",
        role: reg.role || "owner",
        userDocument: currentUser?.document || currentUser?.userDocument || "",
      });
    }

    if (votes.length === 0) return setIsSubmitting(false);

    const res = await submitBatchVotes(assembly.id, q.id, votes);
    setIsSubmitting(false);
    if (res.success) setShowSuccess(true);
    else toast.error("Error al votar");
  };

  if (q.status === QUESTION_STATUS.FINISHED && votedCount === 0) return null;

  if (effectiveVoteBlocked) {
    if (forceModalOnly) return null;
    return (
      <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm opacity-60 mb-4">
        <CustomText variant="bodyM" className="font-bold text-[#0E3C42] mb-1">
          {q.title}
        </CustomText>
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
          <CustomText variant="bodyM" className="font-bold text-[#0E3C42] mb-1">
            {q.title}
          </CustomText>
          <CustomText variant="bodyS" className="text-gray-400">
            Votación completada.
          </CustomText>
        </div>
        <div className="bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center">
          <Check size={20} strokeWidth={3} />
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

      {!forceModalOnly && (
        <div className="bg-indigo-50/50 border border-[#8B9DFF]/30 p-6 rounded-[24px] mb-4 animate-pulse">
          <CustomText variant="bodyM" className="font-bold text-[#0E3C42] mb-1">
            {q.title}
          </CustomText>
          <CustomText variant="bodyS" className="text-[#4059FF] font-bold">
            Votación en curso...
          </CustomText>
        </div>
      )}

      {!hideModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-blue-950/50" />
          <div className="bg-[#F3F6F9] w-full rounded-t-[32px] shadow-2xl relative overflow-hidden flex flex-col items-center max-h-[650px] p-5 animate-in slide-in-from-bottom duration-500">
            {showSuccess ? (
              <div className="relative overflow-hidden bg-white p-8 mb-3 flex flex-col items-start justify-center min-h-[200px] max-w-[564px] w-full rounded-2xl border border-gray-100 shadow-soft">
                <div className="absolute -top-10 -left-20 w-64 h-64 bg-[#94A2FF] opacity-100 blur-[100px] rounded-full pointer-events-none" />

                <div className="absolute top-0 left-40 w-64 h-64 bg-[#36C5C5] opacity-30 blur-[80px] rounded-full pointer-events-none" />

                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#36C5C5] opacity-30 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute  -bottom-20 left-40 w-64 h-64 bg-[#94A2FF] opacity-30 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10 w-full">
                  <div className="flex items-start justify-start w-full mb-6">
                    <img
                      src="/logos/logo-intuapp/symbole.png"
                      alt="Check"
                      className="h-12 w-auto"
                    />
                  </div>

                  <div className="flex flex-col items-start justify-start w-full">
                    <CustomText
                      variant="TitleL"
                      className="font-black text-[#0E3C42] mb-2"
                    >
                      Tu votación fue exitosa!
                    </CustomText>
                    <CustomText variant="bodyM" className="text-[#0E3C42] mb-8">
                      Podrás ver tus votos y el resultado de las votaciones en
                      la opción “Resultados” del menú inferior
                    </CustomText>
                  </div>

                  <CustomButton
                    onClick={() => setShowSuccess(false)}
                    className="w-full py-3 shadow-lg "
                    variant="primary"
                  >
                    Aceptar
                  </CustomButton>
                </div>
              </div>
            ) : (
              <>
                {mode === "individual" && (
                  <div className="bg-[#FFEDDD] border-2 border-[#F98A56] rounded-xl py-3 px-2 w-[564px] flex items-center gap-1 mb-2 shrink-0 z-10">
                    <CustomIcon
                      path={ICON_PATHS.warning}
                      size={16}
                      className="text-[#F98A56]"
                    />

                    <CustomText
                      variant="bodyS"
                      className="text-[#1F1F23] font-bold"
                    >
                      Recuerda que vas a votar individualmente por cada
                      propiedad que tienes
                    </CustomText>
                  </div>
                )}

                <div className="flex-1 w-full relative overflow-hidden flex flex-col items-center">
                  <div
                    ref={scrollContainerRef}
                    className="w-full h-full overflow-y-auto no-scrollbar px-6 py-4 flex flex-col items-center pb-20"
                  >
                    {mode === "select" ? (
                      <div className="py-4 flex flex-col items-center max-w-[564px] w-full mx-auto gap-4">
                        <div className="flex items-start w-full">
                          <CustomText
                            variant="TitleM"
                            className="text-[#0E3C42] font-black"
                          >
                            ¿Cómo quieres votar en esta asamblea?
                          </CustomText>
                        </div>
                        <div className="flex flex-col gap-4 w-full">
                          {["individual", "block"].map((m) => (
                            <button
                              key={m}
                              onClick={() => setSelectedMode(m)}
                              className={`w-full p-4 rounded-lg border flex items-center gap-4 transition-all ${
                                selectedMode === m
                                  ? "border-[#4059FF] bg-indigo-50/10"
                                  : "border-[#D3DAE0] bg-white"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selectedMode === m
                                    ? "border-[#4059FF]"
                                    : "border-gray-200"
                                }`}
                              >
                                {selectedMode === m && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#4059FF]" />
                                )}
                              </div>
                              <div className="text-left">
                                <CustomText
                                  variant="bodyM"
                                  className={`block text-[#3D3D44] capitalize ${
                                    m === selectedMode
                                      ? "font-bold"
                                      : "font-medium"
                                  }`}
                                >
                                  {m === "block" ? "En bloque" : "Individual"}
                                </CustomText>
                                <CustomText
                                  variant="bodyS"
                                  className="text-gray-500 font-medium"
                                >
                                  {m === "block"
                                    ? "Responde cada pregunta por cada propiedad que tengas."
                                    : "Responde una sola vez y tu voto aplicará a todas tus Representaciones."}
                                </CustomText>
                              </div>
                            </button>
                          ))}
                        </div>
                        <CustomButton
                          variant="primary"
                          disabled={!selectedMode}
                          onClick={() => {
                            setMode(selectedMode);
                            onSetVotingPreference?.(selectedMode);
                          }}
                          className={`w-full py-3`}
                        >
                          <CustomText
                            variant="bodyM"
                            className={`${selectedMode ? "font-bold" : "font-medium"}`}
                          >
                            Continuar
                          </CustomText>
                        </CustomButton>
                      </div>
                    ) : (
                      <div className="w-full max-w-[564px]">
                        <div className=" relative border-b border-gray-50 mb-4">
                          <CustomText
                            variant="TitleM"
                            className="text-[#0E3C42] leading-tight"
                          >
                            {q.title}
                          </CustomText>
                        </div>

                        {mode === "block" ? (
                          <div className="flex flex-col gap-3">
                            {(q.type === QUESTION_TYPES.UNIQUE ||
                              q.type === QUESTION_TYPES.YES_NO) && (
                              <div className="flex flex-col gap-3">
                                {(q.type === QUESTION_TYPES.YES_NO
                                  ? ["Sí", "No"]
                                  : q.options
                                ).map((opt, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setBlockSelectedOption(opt)}
                                    className={`p-4 rounded-lg w-full border flex flex-row gap-2 font-medium items-center transition-all ${
                                      blockSelectedOption === opt
                                        ? "border-[#4059FF] bg-indigo-50/10"
                                        : "bg-white border-[#D3DAE0]"
                                    }`}
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        blockSelectedOption === opt
                                          ? "border-[#4059FF]"
                                          : "border-gray-200"
                                      }`}
                                    >
                                      {blockSelectedOption === opt && (
                                        <div className="w-2.5 h-2.5 bg-[#4059FF] rounded-full" />
                                      )}
                                    </div>
                                    <CustomText
                                      variant="bodyM"
                                      className={`text-[#0E3C42] ${
                                        blockSelectedOption === opt
                                          ? "font-bold"
                                          : "font-medium"
                                      }`}
                                    >
                                      {opt}
                                    </CustomText>
                                  </button>
                                ))}
                                <CustomButton
                                  disabled={
                                    !blockSelectedOption || isSubmitting
                                  }
                                  onClick={() =>
                                    submitBlockVote({
                                      option: blockSelectedOption,
                                    })
                                  }
                                  variant="primary"
                                  className={`w-full py-3`}
                                >
                                  <CustomText
                                    variant="bodyM"
                                    className={`${blockSelectedOption ? "font-bold" : "font-medium"}`}
                                  >
                                    Votar
                                  </CustomText>
                                </CustomButton>
                              </div>
                            )}
                            {q.type === QUESTION_TYPES.MULTIPLE && (
                              <div className="flex flex-col gap-3">
                                {q.options.map((opt, i) => (
                                  <label
                                    key={i}
                                    className={`flex items-center gap-2 p-4 rounded-lg w-full border cursor-pointer transition-all ${
                                      blockSelectedOptions.includes(opt)
                                        ? "border-[#4059FF] bg-indigo-50/10"
                                        : "bg-white border-[#D3DAE0]"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="hidden"
                                      checked={blockSelectedOptions.includes(
                                        opt,
                                      )}
                                      onChange={() => toggleBlockOption(opt)}
                                    />
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        blockSelectedOptions.includes(opt)
                                          ? "border-[#4059FF]"
                                          : "border-gray-200"
                                      }`}
                                    >
                                      {blockSelectedOptions.includes(opt) && (
                                        <div className="w-2.5 h-2.5 bg-[#4059FF] rounded-full" />
                                      )}
                                    </div>
                                    <CustomText
                                      variant="bodyM"
                                      className={`text-[#0E3C42] ${
                                        blockSelectedOptions.includes(opt)
                                          ? "font-bold"
                                          : "font-medium"
                                      }`}
                                    >
                                      {opt}
                                    </CustomText>
                                  </label>
                                ))}
                                <CustomButton
                                  disabled={
                                    blockSelectedOptions.length === 0 ||
                                    isSubmitting
                                  }
                                  onClick={() =>
                                    submitBlockVote({
                                      options: blockSelectedOptions,
                                    })
                                  }
                                  variant="primary"
                                  className={`w-full py-3`}
                                >
                                  <CustomText
                                    variant="bodyM"
                                    className={`${blockSelectedOptions.length > 0 ? "font-bold" : "font-medium"}`}
                                  >
                                    Confirmar Voto
                                  </CustomText>
                                </CustomButton>
                              </div>
                            )}
                            {q.type === QUESTION_TYPES.OPEN && (
                              <div className="flex flex-col gap-3">
                                <textarea
                                  placeholder="Tu respuesta..."
                                  className="w-full border border-[#D3DAE0] rounded-lg p-4 min-h-[120px] focus:outline-none focus:border-[#4059FF]"
                                  value={blockOpenAnswer}
                                  onChange={(e) =>
                                    setBlockOpenAnswer(e.target.value)
                                  }
                                />
                                <CustomButton
                                  disabled={
                                    !blockOpenAnswer.trim() || isSubmitting
                                  }
                                  onClick={() =>
                                    submitBlockVote({
                                      answerText: blockOpenAnswer,
                                    })
                                  }
                                  variant="primary"
                                  className={`w-full py-3`}
                                >
                                  <CustomText
                                    variant="bodyM"
                                    className={`${blockOpenAnswer.trim() ? "font-bold" : "font-medium"}`}
                                  >
                                    Enviar
                                  </CustomText>
                                </CustomButton>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4 w-full">
                            {activeRegistries.map((reg) => (
                              <div
                                key={reg.id}
                                className="bg-white rounded-2xl p-5 flex flex-col gap-4 border border-gray-100"
                              >
                                <CustomText
                                  variant="bodyX"
                                  className="font-bold text-[#0E3C42] "
                                >
                                  {reg.tipo ? `${reg.tipo} - ` : ""}
                                  {reg.propiedad}
                                </CustomText>

                                {q.type === QUESTION_TYPES.OPEN ? (
                                  <textarea
                                    placeholder="Escribe tu respuesta aquí..."
                                    className="w-full border border-[#D3DAE0] rounded-lg p-3 min-h-[80px] focus:outline-none focus:border-[#4059FF]"
                                    value={
                                      individualVotes[reg.id]?.answerText || ""
                                    }
                                    onChange={(e) => {
                                      setIndividualVotes((prev) => ({
                                        ...prev,
                                        [reg.id]: {
                                          answerText: e.target.value,
                                        },
                                      }));
                                    }}
                                  />
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    {(q.type === QUESTION_TYPES.YES_NO
                                      ? ["Sí", "No"]
                                      : q.options
                                    ).map((opt) => {
                                      const isMultiple =
                                        q.type === QUESTION_TYPES.MULTIPLE;
                                      const isSelected = isMultiple
                                        ? individualVotes[
                                            reg.id
                                          ]?.options?.includes(opt)
                                        : individualVotes[reg.id]?.option ===
                                          opt;

                                      return (
                                        <button
                                          key={opt}
                                          onClick={() => {
                                            if (isMultiple) {
                                              setIndividualVotes((prev) => {
                                                const regVote =
                                                  prev[reg.id] || {};
                                                const currentOpts =
                                                  regVote.options || [];
                                                const isSel =
                                                  currentOpts.includes(opt);
                                                let newOpts;
                                                if (isSel) {
                                                  newOpts = currentOpts.filter(
                                                    (o) => o !== opt,
                                                  );
                                                } else {
                                                  newOpts = [
                                                    ...currentOpts,
                                                    opt,
                                                  ];
                                                }
                                                return {
                                                  ...prev,
                                                  [reg.id]: {
                                                    ...regVote,
                                                    options: newOpts,
                                                  },
                                                };
                                              });
                                            } else {
                                              setIndividualVotes((p) => ({
                                                ...p,
                                                [reg.id]: { option: opt },
                                              }));
                                            }
                                          }}
                                          className={`p-4 rounded-lg border flex flex-row gap-2 items-center transition-all ${
                                            isSelected
                                              ? "bg-indigo-50 border-[#4059FF]"
                                              : "bg-white border-[#D3DAE0]"
                                          }`}
                                        >
                                          <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                              isSelected
                                                ? "border-[#4059FF]"
                                                : "border-gray-200"
                                            }`}
                                          >
                                            {isSelected && (
                                              <div className="w-2.5 h-2.5 bg-[#4059FF] rounded-full" />
                                            )}
                                          </div>
                                          <CustomText
                                            variant="bodyM"
                                            className={`text-[#0E3C42] ${isSelected ? "font-bold" : ""}`}
                                          >
                                            {opt}
                                          </CustomText>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                            <CustomButton
                              onClick={submitIndividualVotes}
                              disabled={
                                Object.keys(individualVotes).length <
                                  activeRegistries.length || isSubmitting
                              }
                              className="w-full py-3"
                              variant="primary"
                            >
                              <CustomText
                                variant="bodyM"
                                className={`${
                                  Object.keys(individualVotes).length ===
                                  activeRegistries.length
                                    ? "font-bold"
                                    : "font-medium"
                                }`}
                              >
                                Votar
                              </CustomText>
                            </CustomButton>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none">
                    <button
                      onClick={handleScrollDown}
                      className="bg-white border border-[#4059FF] border-dashed rounded-full p-2 shadow-lg animate-bounce pointer-events-auto hover:bg-gray-50 transition-colors"
                    >
                      <ArrowDown size={24} className="text-[#0E3C42]" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
