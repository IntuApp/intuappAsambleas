"use client";

import CustomText from "../basics/CustomText";
import CustomInput from "../basics/inputs/CustomInput";
import CustomSelect from "../basics/inputs/CustomSelect";
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import CustomButton from "../basics/CustomButton";

export default function CustomCreateQuestion({
  show,
  newQuestion,
  setNewQuestion,
  editingQuestionId,
  QUESTION_TYPES,
  onClose,
  onSave,
}) {
  if (!show) return null;

  return (
    <div
      id="add-question-form"
      className="bg-[#FFFFFF] p-8 flex flex-col gap-5 rounded-3xl"
    >
      <CustomText variant="bodyX" className="font-bold text-[#0E3C42]">
        {editingQuestionId ? "Editar pregunta" : "Crear pregunta"}
      </CustomText>

      <div
        className={`flex w-full ${newQuestion.type === QUESTION_TYPES.MULTIPLE ? "justify-between" : " gap-4 justify-start"}`}
      >
        <CustomInput
          label="Título de la pregunta"
          variant="labelM"
          placeholder="Escriba aquí la pregunta"
          className="max-w-[697px] w-full max-h-[80px]"
          classLabel="text-[#333333] font-bold"
          classInput="max-w-[697px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
          value={newQuestion.title}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, title: e.target.value })
          }
        />
        <CustomSelect
          className="max-w-[216px] w-full"
          label="Tipo de encuesta"
          variant="labelM"
          classLabel="text-[#333333] font-bold"
          value={newQuestion.type}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, type: e.target.value })
          }
        >
          <option value={QUESTION_TYPES.UNIQUE}>Selección única</option>
          <option value={QUESTION_TYPES.MULTIPLE}>Selección múltiple</option>
          <option value={QUESTION_TYPES.YES_NO}>Sí / No</option>
          <option value={QUESTION_TYPES.OPEN}>Abierta</option>
        </CustomSelect>

        {/* Mínimo de votos */}
        {newQuestion.type === QUESTION_TYPES.MULTIPLE && (
          <CustomSelect
            className="max-w-[119px]"
            label="Mínimo de votos"
            variant="labelM"
            classLabel="text-[#333333] font-bold"
            value={newQuestion.minSelections}
            onChange={(e) =>
              setNewQuestion({
                ...newQuestion,
                minSelections: parseInt(e.target.value),
              })
            }
          >
            {Array.from(
              { length: newQuestion.options.length },
              (_, i) => i + 1,
            ).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </CustomSelect>
        )}
      </div>

      {/* OPCIONES */}
      {(newQuestion.type === QUESTION_TYPES.UNIQUE ||
        newQuestion.type === QUESTION_TYPES.MULTIPLE) && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            {newQuestion.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {/* Orden */}
                <div className="flex flex-col items-center">
                  <CustomIcon path={ICON_PATHS.dragIndicator} />
                </div>

                {/* Input */}
                <input
                  type="text"
                  placeholder="Escriba aquí la opción"
                  className="flex-1 border border-gray-200 rounded-lg p-3
                             outline-none focus:border-[#8B9DFF] text-[14px]"
                  value={opt}
                  onChange={(e) => {
                    const opts = [...newQuestion.options];
                    opts[idx] = e.target.value;
                    setNewQuestion({ ...newQuestion, options: opts });
                  }}
                />

                {/* Delete */}
                <CustomButton
                  onClick={() => {
                    const opts = newQuestion.options.filter(
                      (_, i) => i !== idx,
                    );
                    setNewQuestion({
                      ...newQuestion,
                      options: opts,
                      minSelections: Math.min(
                        newQuestion.minSelections,
                        opts.length,
                      ),
                    });
                  }}
                  variant="primary"
                  className="p-2 "
                >
                  <CustomIcon path={ICON_PATHS.delete} />
                </CustomButton>
              </div>
            ))}
          </div>

          {/* Add option */}
          <CustomButton
            onClick={() =>
              setNewQuestion({
                ...newQuestion,
                options: [...newQuestion.options, ""],
              })
            }
            className="w-[158px] p-2 bg-transparent border-none font-bold flex items-center gap-2 hover:opacity-80 transition hover:bg-transparent"
          >
            <CustomIcon path={ICON_PATHS.add} size={18} />
            <CustomText variant="bodyM" className="text-[#4059FF] font-bold">
              Añadir opción
            </CustomText>
          </CustomButton>
        </div>
      )}

      <div className="border border-[#D3DAE0]"> </div>
      {/* ACTIONS */}
      <div className="flex justify-end gap-3 pt-6 ">
        <CustomButton
          variant="secondary"
          onClick={onClose}
          className="flex gap-2 py-4 px-5"
        >
          <CustomIcon
            path={ICON_PATHS.delete}
            size={24}
            className="ext-[#0E3C42]"
          />
          <CustomText variant="bodyM" className="text-[#0E3C42] font-bold">
            Borrar
          </CustomText>
        </CustomButton>
        <CustomButton
          variant="primary"
          className="flex gap-2 py-4 px-5"
          onClick={onSave}
        >
          <CustomIcon path={ICON_PATHS.check} size={24} />
          <CustomText variant="bodyM" className="font-bold">
            {editingQuestionId ? "Actualizar" : "Guardar"}
          </CustomText>
        </CustomButton>
      </div>
    </div>
  );
}
