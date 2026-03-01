export const QUESTION_TYPES = {
  UNIQUE: "1",
  MULTIPLE: "2",
  YES_NO: "3",
  OPEN: "4"
};

export const QUESTION_STATUSES = {
  CREATED: "1",
  LIVE: "2",
  FINISHED: "3", // "Finalizada"
  CANCELED: "4"
};

export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.UNIQUE]: "Selección Única",
  [QUESTION_TYPES.MULTIPLE]: "Selección Múltiple",
  [QUESTION_TYPES.YES_NO]: "Sí / No",
  [QUESTION_TYPES.OPEN]: "Abierta"
};