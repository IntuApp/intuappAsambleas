"use client";
import React, { useState, useEffect } from "react";
import { Check, AlertTriangle, ArrowLeft } from "lucide-react";
import {
  QUESTION_STATUS,
  QUESTION_TYPES,
  submitBatchVotes,
} from "@/lib/questions";
import { toast } from "react-toastify";

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

    // Note: Validation for individual votes is implicit in UI state (button disabled if not completed? No, button checks length).
    // Button check: disabled={Object.keys(individualVotes).length < activeRegistries.length}
    // This ensures all registries have at least one selection.

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
        <h3 className="text-base font-bold text-[#0E3C42] mb-1">{q.title}</h3>
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
          <h3 className="text-base font-bold text-[#0E3C42] mb-1">{q.title}</h3>
          <p className="text-xs text-gray-400">Votación completada.</p>
        </div>
        <div className="bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center">
          <Check size={20} strokeWidth={3} />
        </div>
      </div>
    );
  }

  return (
    <>
      {!forceModalOnly && (
        <div className="bg-indigo-50/50 border border-[#8B9DFF]/30 p-6 rounded-[24px] mb-4 animate-pulse">
          <h3 className="text-base font-bold text-[#0E3C42] mb-1">{q.title}</h3>
          <p className="text-xs text-[#8B9DFF] font-bold">
            Votación en curso...
          </p>
        </div>
      )}

      {!hideModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-blue-950/50" />
          <div className="bg-[#F8F9FA] w-full rounded-t-[32px] shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-500">
            {showSuccess ? (
              <div className="p-8 pb-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 bg-gradient-to-tr from-[#8B9DFF] to-indigo-500 rounded-full flex items-center justify-center mb-6 text-white shadow-lg shadow-indigo-200">
                  <Check size={32} strokeWidth={4} />
                </div>
                <h3 className="text-2xl font-black text-[#0E3C42] mb-2">
                  ¡Votación exitosa!
                </h3>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full bg-[#0E3C42] text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition"
                >
                  Aceptar
                </button>
              </div>
            ) : (
              <>
                {mode === "individual" && (
                  <div className="bg-orange-50 border-b border-orange-100 px-6 py-4 flex items-start gap-3">
                    <AlertTriangle
                      size={18}
                      className="text-orange-500 mt-0.5"
                    />
                    <p className="text-xs font-bold text-orange-700">
                      Votación individual por propiedad.
                    </p>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {mode === "select" ? (
                    <div className="py-4">
                      <h3 className="text-xl font-extrabold text-[#0E3C42] mb-6 text-center">
                        ¿Cómo quieres votar?
                      </h3>
                      <div className="flex flex-col gap-4 mb-8">
                        {["individual", "block"].map((m) => (
                          <button
                            key={m}
                            onClick={() => setSelectedMode(m)}
                            className={`w-full p-5 rounded-3xl border-2 flex items-center gap-4 ${selectedMode === m ? "border-[#8B9DFF] bg-indigo-50/30" : "border-gray-100 bg-white"}`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full border-2 ${selectedMode === m ? "border-[#8B9DFF]" : "border-gray-300"}`}
                            >
                              {selectedMode === m && (
                                <div className="w-3.5 h-3.5 mx-auto mt-0.5 rounded-full bg-[#8B9DFF]" />
                              )}
                            </div>
                            <div className="text-left">
                              <span className="block text-lg font-bold text-[#0E3C42] capitalize">
                                {m === "block" ? "En bloque" : "Individual"}
                              </span>
                              <span className="text-sm text-gray-500 font-medium">
                                {m === "block"
                                  ? "Responde una sola vez para todas."
                                  : "Responde por cada propiedad."}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={!selectedMode}
                        onClick={() => {
                          setMode(selectedMode);
                          onSetVotingPreference?.(selectedMode);
                        }}
                        className={`w-full py-5 rounded-[24px] font-bold text-lg shadow-xl active:scale-95 transition ${selectedMode ? "bg-[#8B9DFF] text-white" : "bg-gray-100 text-gray-400"}`}
                      >
                        Continuar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white pt-6 pb-4 relative border-b border-gray-50 mb-4">
                        {activeRegistries.length > 1 && (
                          <button
                            onClick={() => setMode("select")}
                            className="absolute right-0 top-6 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"
                          >
                            <ArrowLeft size={16} />
                          </button>
                        )}
                        <h3 className="text-xl font-extrabold text-[#0E3C42] leading-tight">
                          {q.title}
                        </h3>
                      </div>

                      {mode === "block" ? (
                        <div className="flex flex-col gap-3">
                          {(q.type === QUESTION_TYPES.UNIQUE ||
                            q.type === QUESTION_TYPES.YES_NO) && (
                            <>
                              {(q.type === QUESTION_TYPES.YES_NO
                                ? ["Sí", "No"]
                                : q.options
                              ).map((opt, i) => (
                                <button
                                  key={i}
                                  onClick={() => setBlockSelectedOption(opt)}
                                  className={`w-full p-4 rounded-2xl border flex justify-between items-center transition-all ${blockSelectedOption === opt ? "bg-indigo-50 border-[#8B9DFF]" : "bg-white border-gray-100"}`}
                                >
                                  <span className="font-bold text-[#0E3C42]">
                                    {opt}
                                  </span>
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 ${blockSelectedOption === opt ? "border-[#8B9DFF] bg-[#8B9DFF]" : "border-gray-200"}`}
                                  >
                                    {blockSelectedOption === opt && (
                                      <div className="w-2.5 h-2.5 bg-white rounded-full mx-auto mt-0.5" />
                                    )}
                                  </div>
                                </button>
                              ))}
                              <button
                                disabled={!blockSelectedOption || isSubmitting}
                                onClick={() =>
                                  submitBlockVote({
                                    option: blockSelectedOption,
                                  })
                                }
                                className={`w-full py-5 rounded-[24px] font-bold text-lg shadow-xl mt-4 ${blockSelectedOption ? "bg-[#8B9DFF] text-white" : "bg-gray-100 text-gray-400"}`}
                              >
                                Votar
                              </button>
                            </>
                          )}
                          {q.type === QUESTION_TYPES.MULTIPLE && (
                            <>
                              {q.options.map((opt, i) => (
                                <label
                                  key={i}
                                  className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer ${blockSelectedOptions.includes(opt) ? "border-[#8B9DFF] bg-indigo-50/10" : "bg-white border-gray-100"}`}
                                >
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={blockSelectedOptions.includes(opt)}
                                    onChange={() => toggleBlockOption(opt)}
                                  />
                                  <div
                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${blockSelectedOptions.includes(opt) ? "bg-[#8B9DFF] border-[#8B9DFF]" : "border-gray-200"}`}
                                  >
                                    {blockSelectedOptions.includes(opt) && (
                                      <Check size={14} className="text-white" />
                                    )}
                                  </div>
                                  <span className="font-bold text-[#0E3C42] text-sm">
                                    {opt}
                                  </span>
                                </label>
                              ))}
                              <button
                                disabled={
                                  blockSelectedOptions.length === 0 ||
                                  isSubmitting
                                }
                                onClick={() =>
                                  submitBlockVote({
                                    options: blockSelectedOptions,
                                  })
                                }
                                className="w-full bg-[#0E3C42] text-white font-bold py-4 rounded-2xl mt-4"
                              >
                                Confirmar Voto
                              </button>
                            </>
                          )}
                          {q.type === QUESTION_TYPES.OPEN && (
                            <>
                              <textarea
                                placeholder="Tu respuesta..."
                                className="w-full border rounded-2xl p-4 min-h-[120px]"
                                value={blockOpenAnswer}
                                onChange={(e) =>
                                  setBlockOpenAnswer(e.target.value)
                                }
                              />
                              <button
                                disabled={
                                  !blockOpenAnswer.trim() || isSubmitting
                                }
                                onClick={() =>
                                  submitBlockVote({
                                    answerText: blockOpenAnswer,
                                  })
                                }
                                className="w-full bg-[#0E3C42] text-white font-bold py-4 rounded-2xl mt-4"
                              >
                                Enviar
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4 pb-20">
                          {activeRegistries.map((reg) => (
                            <div
                              key={reg.id}
                              className="bg-white rounded-2xl p-5 border border-gray-100"
                            >
                              <h4 className="font-bold text-[#0E3C42] mb-3 text-sm flex items-center gap-2 underline">
                                {reg.tipo ? `${reg.tipo} - ` : ""}
                                {reg.propiedad}
                              </h4>
                              {/* ... individual options logic same as block but for registryId ... */}
                              <div className="flex flex-wrap gap-2">
                                {(q.type === QUESTION_TYPES.YES_NO
                                  ? ["Sí", "No"]
                                  : q.options
                                ).map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={() => {
                                      if (q.type === QUESTION_TYPES.MULTIPLE) {
                                        setIndividualVotes((prev) => {
                                          const regVote = prev[reg.id] || {};
                                          const currentOpts =
                                            regVote.options || [];
                                          const isSelected =
                                            currentOpts.includes(opt);
                                          let newOpts;
                                          if (isSelected) {
                                            newOpts = currentOpts.filter(
                                              (o) => o !== opt,
                                            );
                                          } else {
                                            newOpts = [...currentOpts, opt];
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
                                    className={`p-2 rounded-lg border text-xs font-bold ${
                                      (
                                        q.type === QUESTION_TYPES.MULTIPLE
                                          ? individualVotes[
                                              reg.id
                                            ]?.options?.includes(opt)
                                          : individualVotes[reg.id]?.option ===
                                            opt
                                      )
                                        ? "bg-[#8B9DFF] text-white"
                                        : "bg-gray-50"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={submitIndividualVotes}
                            disabled={
                              Object.keys(individualVotes).length <
                                activeRegistries.length || isSubmitting
                            }
                            className="w-full py-4 rounded-2xl bg-[#8B9DFF] text-white font-bold disabled:bg-gray-100"
                          >
                            Votar Todo
                          </button>
                        </div>
                      )}
                    </>
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
