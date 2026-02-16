"use client";
import React from "react";
import {
  Play,
  RotateCcw as RefreshCw,
  Check,
  X,
  Edit2,
  Trash2,
  FileText,
} from "lucide-react";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import { QUESTION_STATUS, QUESTION_TYPES } from "@/constans/question";
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

  // Question Votes
  const questionVotes = votes.filter((v) => v.questionId === q.id);

  // Total Coefficient of ALL properties (Registered + Not Registered)
  const totalCoef = registries.reduce(
    (acc, r) => acc + parseCoef(r.coeficiente),
    0,
  );

  const totalVotedCoef = questionVotes.reduce((acc, v) => {
    // Try to use stored votingPower, fallback to registry
    let power = v.votingPower;
    if (power === undefined) {
      const reg = registries.find((r) => r.id === v.propertyOwnerId);
      power = reg?.coeficiente;
    }
    return acc + parseCoef(power);
  }, 0);

  const totalVotesCount = questionVotes.length;

  // Quorum: Based on TOTAL Coefficient (Voted Coef / Total Coef)
  const quorumVoting = totalCoef > 0 ? (totalVotedCoef / totalCoef) * 100 : 0;

  const shouldShowResults =
    isAdmin ||
    q.status === QUESTION_STATUS.FINISHED ||
    q.status === QUESTION_STATUS.LIVE;

  return (
    <div className="bg-[#FFFFFF] p-8 flex flex-col gap-6 rounded-3xl">
      {/* Top Decorative Line */}

      <div className="flex justify-between items-start">
        <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
          {q.title}
        </CustomText>
        {isAdmin && q.status === QUESTION_STATUS.CREATED && (
          <CustomButton
            onClick={() => onEdit?.(q)}
            variant="primary"
            className="p-2"
          >
            <CustomIcon path={ICON_PATHS.pencil} size={24} />
          </CustomButton>
        )}
      </div>

      <div className="flex items-center justify-between">
        {shouldShowResults && (
          <div className="flex items-center gap-1">
            <CustomText variant="bodyX" className="font-medium text-[#1F1F23]">
              Quórum de votación:
            </CustomText>
            <CustomText variant="bodyX" className="font-bold text-[#1F1F23]">
              {quorumVoting.toFixed(2) === 0.0
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

        <div className="flex items-center gap-4">
          <CustomQuestionStatus status={q.status} />
          {isAdmin &&
            (q.status === QUESTION_STATUS.LIVE ||
              q.status === QUESTION_STATUS.FINISHED) && (
              <CustomButton
                onClick={() => onViewVoters?.(q)}
                className="bg-transparent border-none hover:bg-transparent hover:border-none"
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

      {shouldShowResults && (
        <div className="border border-[#D3DAE0] rounded-2xl p-6">
          {q.type !== QUESTION_TYPES.OPEN ? (
            q.options?.map((opt, i) => {
              const isCreated = q.status === QUESTION_STATUS.CREATED;

              const votesForOpt = questionVotes.filter(
                (v) => v.selectedOptions && v.selectedOptions.includes(opt),
              );

              const votesForOptCount = votesForOpt.length;
              const votesForOptCoef = votesForOpt.reduce((acc, v) => {
                let power = v.votingPower;
                if (power === undefined) {
                  const reg = registries.find(
                    (r) => r.id === v.propertyOwnerId,
                  );
                  power = reg?.coeficiente;
                }
                return acc + parseCoef(power);
              }, 0);

              const displayPercentage = votesForOptCoef.toFixed(2);
              const barWidth =
                totalVotedCoef > 0
                  ? (votesForOptCoef / totalVotedCoef) * 100
                  : 0;

              return (
                <div key={i} className="flex flex-col gap-2">
                  <CustomText className="font-regular text-[#1F1F23] text-[20px]">
                    {opt}
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
                        className="font-bold text-[#3D3D44] whitespace-nowrap"
                      >
                        {displayPercentage}% ({votesForOptCount} votos)
                      </CustomText>
                    )}
                  </div>
                </div>
              );
            })
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
                    &ldquo;{v.selectedOptions?.[0] || ""}&rdquo;
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

      {shouldShowResults && q.status !== QUESTION_STATUS.CANCELED && (
        <div className="bg-[#EEF0FF] border border-[#94A2FF] p-4 rounded-xl flex gap-3">
          <CustomIcon path={ICON_PATHS.info} size={24} />
          <CustomText variant="bodyM" className="font-bold">
            Resultados calculados sobre el 100% de la entidad, no en porcentajes
            reescalados.
          </CustomText>
        </div>
      )}

      {q.status === QUESTION_STATUS.CANCELED && (
        <div className="bg-[#FACCCD] border border-[#930002] p-4 rounded-xl flex gap-3">
          <CustomIcon
            path={ICON_PATHS.emergencyHome}
            size={24}
            className="text-[#930002]"
          />
          <CustomText variant="bodyM" className="font-bold">
            Esta votación fue cancelada y los votos no serán tomados en cuenta
          </CustomText>
        </div>
      )}

      {isAdmin && assembyStatus !== "finished" && (
        <div className="flex flex-col md:flex-row items-center justify-end gap-3">
          {q.status === QUESTION_STATUS.LIVE && (
            <CustomButton
              onClick={() => onCancel?.(q.id)}
              className="py-2 px-4 flex items-center gap-1"
              variant="error"
            >
              <CustomIcon path={ICON_PATHS.close} size={20} />
              <CustomText variant="bodyM" className="font-bold">
                Cancelar votación
              </CustomText>
            </CustomButton>
          )}

          {q.status !== QUESTION_STATUS.CANCELED && (
            <CustomButton
              onClick={() => onToggleStatus?.(q.id, q.status)}
              className="py-2 px-4 flex items-center gap-1"
              variant={
                q.status === QUESTION_STATUS.CREATED
                  ? "success"
                  : q.status === QUESTION_STATUS.LIVE
                    ? "warning"
                    : "success"
              }
            >
              <CustomIcon
                path={
                  q.status === QUESTION_STATUS.CREATED
                    ? ICON_PATHS.playArrow
                    : q.status === QUESTION_STATUS.LIVE
                      ? ICON_PATHS.taskAlt
                      : ICON_PATHS.inPerson
                }
                size={20}
              />
              <CustomText variant="bodyM" className="font-bold">
                {q.status === QUESTION_STATUS.CREATED
                  ? "Iniciar votación"
                  : q.status === QUESTION_STATUS.LIVE
                    ? "Finalizar Votación"
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
