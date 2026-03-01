"use client";
import React from "react";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";

// Asegúrate de importar tus constantes
const QUESTION_TYPES = { UNIQUE: "1", MULTIPLE: "2", YES_NO: "3", OPEN: "4" };
const QUESTION_STATUSES = { CREATED: "1", LIVE: "2", FINISHED: "3", CANCELED: "4" };

import CustomQuestionStatus from "./CustomQuestionStatus";

const QuestionCard = ({
  q,
  registries = [], 
  votes = [],
  isAdmin = false,
  onEdit,
  onToggleStatus,
  onCancel,
  onViewVoters,
  assembyStatus, 
}) => {
  const parseCoef = (val) =>
    parseFloat(String(val || 0).replace(",", ".")) || 0;

  // 1. Votos de ESTA pregunta
  const questionVotes = votes.filter((v) => v.questionId === q.id);

  // 2. Coeficiente Total de la Asamblea (Aplanado en el Manager)
  const totalCoef = registries.reduce(
    (acc, r) => acc + parseCoef(r.coeficiente || r.coefi),
    0
  );

  // 3. Coeficiente Total Votado
  const totalVotedCoef = questionVotes.reduce((acc, v) => {
    let power = v.votingPower;
    if (power === undefined) {
      const reg = registries.find((r) => r.ownerId === v.propertyOwnerId || r.id === v.propertyOwnerId);
      power = reg?.coeficiente || reg?.coefi;
    }
    return acc + parseCoef(power);
  }, 0);

  const totalVotesCount = questionVotes.length;

  // 4. Quórum
  const quorumVoting = totalCoef > 0 ? (totalVotedCoef / totalCoef) * 100 : 0;

  const shouldShowResults =
    isAdmin ||
    q.statusId === QUESTION_STATUSES.FINISHED ||
    q.statusId === QUESTION_STATUSES.LIVE;

  return (
    <div className="bg-[#FFFFFF] p-8 flex flex-col gap-6 rounded-3xl border border-[#E5E7EB] shadow-sm">
      
      {/* ---------------- TOP ---------------- */}
      <div className="flex justify-between items-start">
        <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
          {q.title}
        </CustomText>
        {isAdmin && q.statusId === QUESTION_STATUSES.CREATED && (
          <CustomButton
            onClick={() => onEdit?.(q)}
            variant="primary"
            className="p-2 bg-[#D5DAFF] text-[#4059FF] hover:bg-[#C2CAFF] border-none"
          >
            <CustomIcon path={ICON_PATHS.pencil} size={24} />
          </CustomButton>
        )}
      </div>

      {/* ---------------- MIDDLE ---------------- */}
      <div className="flex items-center justify-between">
        {shouldShowResults && (
          <div className="flex items-center gap-1">
            <CustomText variant="bodyX" className="font-medium text-[#1F1F23]">
              Quórum de votación:
            </CustomText>
            <CustomText variant="bodyX" className="font-bold text-[#1F1F23]">
              {quorumVoting.toFixed(2) === "0.00"
                ? `0%`
                : `${quorumVoting.toFixed(2)}%`}
            </CustomText>
            <CustomIcon
              path={ICON_PATHS.error}
              size={24}
              className="text-[#0E3C42] m-2"
            />
          </div>
        )}

        <div className="flex items-center gap-4 ml-auto">
          <CustomQuestionStatus status={q.statusId} /> 
          
          {isAdmin &&
            (q.statusId === QUESTION_STATUSES.LIVE ||
              q.statusId === QUESTION_STATUSES.FINISHED) && (
              <CustomButton
                onClick={() => onViewVoters?.(q)}
                className="bg-transparent border-none hover:bg-transparent hover:border-none p-0"
              >
                <CustomText
                  variant="bodyL"
                  className="font-medium text-[#4059FF] underline underline-offset-4"
                >
                  Ver votantes
                </CustomText>
              </CustomButton>
            )}
        </div>
      </div>

      {/* ---------------- BOTTOM: BARRAS RESULTADOS ---------------- */}
      {shouldShowResults && (
        <div className="border border-[#D3DAE0] rounded-2xl p-6">
          {q.typeId !== QUESTION_TYPES.OPEN ? (
            <div className="flex flex-col gap-5">
              {q.options?.map((opt, i) => {
                const isCreated = q.statusId === QUESTION_STATUSES.CREATED;

                // 🔥 CRÍTICO: Comparamos el ID de la opción
                const votesForOpt = questionVotes.filter(
                  (v) => v.selectedOptionIds && v.selectedOptionIds.includes(opt.id)
                );

                const votesForOptCount = votesForOpt.length;
                const votesForOptCoef = votesForOpt.reduce((acc, v) => {
                  let power = v.votingPower;
                  if (power === undefined) {
                    const reg = registries.find(
                      (r) => r.ownerId === v.propertyOwnerId || r.id === v.propertyOwnerId
                    );
                    power = reg?.coeficiente || reg?.coefi;
                  }
                  return acc + parseCoef(power);
                }, 0);

                const displayPercentage = votesForOptCoef.toFixed(2);
                const barWidth = totalVotedCoef > 0 ? (votesForOptCoef / totalVotedCoef) * 100 : 0;

                return (
                  <div key={opt.id || i} className="flex flex-col gap-2">
                    {/* Renderizamos opt.text */}
                    <CustomText className="font-regular text-[#1F1F23] text-[20px]">
                      {opt.text} 
                    </CustomText>

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex-1 h-5 rounded-full overflow-hidden ${
                          isCreated ? "bg-[#F5F5F5]" : "bg-[#F2F4F7]"
                        }`}
                      >
                        {!isCreated && (
                          <div
                            className="h-full bg-[#1A6E79] transition-all duration-700 ease-out rounded-full"
                            style={{ width: `${barWidth}%` }}
                          />
                        )}
                      </div>

                      {!isCreated && (
                        <CustomText
                          variant="bodyL"
                          className="font-bold text-[#3D3D44] whitespace-nowrap min-w-[120px] text-right"
                        >
                          {displayPercentage}% ({votesForOptCount} votos)
                        </CustomText>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="col-span-full font-bold">
              <p className="text-xs font-black text-gray-400 uppercase mb-4 tracking-wider">
                Respuestas de texto:
              </p>
              <div className="flex flex-col gap-3">
                {questionVotes.map((v, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-[#0E3C42] font-medium leading-relaxed"
                  >
                    &ldquo;{v.openTextAnswer || ""}&rdquo;
                  </div>
                ))}
                {questionVotes.length === 0 && (
                  <p className="text-sm text-gray-400 italic font-medium px-2">
                    No hay respuestas aún
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- ALERTAS Y ACCIONES ---------------- */}
      {shouldShowResults && q.statusId !== QUESTION_STATUSES.CANCELED && (
        <div className="bg-[#EEF0FF] border border-[#94A2FF] p-4 rounded-xl flex gap-3 items-center">
          <CustomIcon path={ICON_PATHS.info} size={24} className="text-[#4059FF]" />
          <CustomText variant="bodyM" className="font-bold text-[#333333]">
            Resultados calculados sobre el 100% de la entidad, no en porcentajes reescalados.
          </CustomText>
        </div>
      )}

      {q.statusId === QUESTION_STATUSES.CANCELED && (
        <div className="bg-[#FACCCD] border border-[#930002] p-4 rounded-xl flex gap-3 items-center">
          <CustomIcon path={ICON_PATHS.emergencyHome} size={24} className="text-[#930002]" />
          <CustomText variant="bodyM" className="font-bold text-[#930002]">
            Esta votación fue cancelada y los votos no serán tomados en cuenta
          </CustomText>
        </div>
      )}

      {isAdmin && assembyStatus !== "3" && ( // 3 es FINISHED de la asamblea
        <div className="flex flex-col md:flex-row items-center justify-end gap-3 mt-4">
          {q.statusId === QUESTION_STATUSES.LIVE && (
            <CustomButton
              onClick={() => onCancel?.(q.id)}
              className="py-2.5 px-5 flex items-center gap-2 rounded-full"
              variant="error"
            >
              <CustomIcon path={ICON_PATHS.close} size={20} />
              <CustomText variant="bodyM" className="font-bold text-white">
                Cancelar votación
              </CustomText>
            </CustomButton>
          )}

          {q.statusId !== QUESTION_STATUSES.CANCELED && (
            <CustomButton
              onClick={() => onToggleStatus?.(q.id, q.statusId)}
              className="py-2.5 px-6 flex items-center gap-2 rounded-full shadow-sm"
              variant={
                q.statusId === QUESTION_STATUSES.CREATED ? "success"
                  : q.statusId === QUESTION_STATUSES.LIVE ? "warning"
                  : "success"
              }
            >
              <CustomIcon
                path={
                  q.statusId === QUESTION_STATUSES.CREATED ? ICON_PATHS.playArrow
                    : q.statusId === QUESTION_STATUSES.LIVE ? ICON_PATHS.taskAlt
                    : ICON_PATHS.inPerson
                }
                size={20}
              />
              <CustomText variant="bodyM" className="font-bold">
                {q.statusId === QUESTION_STATUSES.CREATED ? "Iniciar votación"
                  : q.statusId === QUESTION_STATUSES.LIVE ? "Finalizar Votación"
                  : "Reabrir Votación"}
              </CustomText>
            </CustomButton>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;