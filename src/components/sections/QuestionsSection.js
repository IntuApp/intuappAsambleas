"use client";

import { Plus } from "lucide-react";
import Button from "@/components/basics/Button";
import CustomCreateQuestion from "@/components/question/CustomCreateQuestion";
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import QuestionCard from "../question/QuestionCard";

export default function QuestionsSection({
  questions,
  registries,
  showAddQuestion,
  setShowAddQuestion,
  newQuestion,
  setNewQuestion,
  editingQuestionId,
  setEditingQuestionId,
  QUESTION_TYPES,
  handleAddQuestion,
  handleEditQuestion,
  toggleQuestionStatus,
  updateQuestionStatus,
  QUESTION_STATUS,
  setViewingVotersFor,
  assembyStatus,
}) {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <CustomText
          variant="TitleL"
          as="h3"
          className="font-bold text-[#0E3C42]"
        >
          Preguntas
        </CustomText>

        {assembyStatus !== "finished" && (
          <CustomButton
            variant="primary"
            className="py-3 px-4 flex items-center gap-2"
            onClick={() => setShowAddQuestion(true)}
          >
            <CustomIcon path={ICON_PATHS.add} size={20} />
            <CustomText variant="bodyM" className="font-bold">
              Añadir pregunta
            </CustomText>
          </CustomButton>
        )}
      </div>

      {showAddQuestion && (
        <CustomCreateQuestion
          show={showAddQuestion}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          editingQuestionId={editingQuestionId}
          QUESTION_TYPES={QUESTION_TYPES}
          onClose={() => {
            setShowAddQuestion(false);
            setEditingQuestionId(null);
          }}
          onSave={handleAddQuestion}
        />
      )}

      <div className="flex flex-col gap-6">
        {!editingQuestionId &&
          questions.map((q) => (
            <QuestionCard
              key={q.id}
              q={q}
              registries={registries}
              isAdmin={true}
              onEdit={handleEditQuestion}
              onToggleStatus={toggleQuestionStatus}
              onCancel={(id) =>
                updateQuestionStatus(id, QUESTION_STATUS.CANCELED)
              }
              onViewVoters={setViewingVotersFor}
              assembyStatus={assembyStatus}
            />
          ))}
      </div>
    </div>
  );
}
