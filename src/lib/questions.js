import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export const QUESTION_TYPES = {
  MULTIPLE: "MULTIPLE",
  UNIQUE: "UNIQUE",
  YES_NO: "YES_NO",
  OPEN: "OPEN",
};

export const QUESTION_STATUS = {
  CREATED: "CREATED",
  LIVE: "LIVE",
  CANCELED: "CANCELED",
  FINISHED: "FINISHED",
};

/**
 * Creates a new question within the assembly's question document
 */
export async function createQuestion(assemblyId, questionData) {
  try {
    const newQuestionId = uuidv4();
    const newQuestion = {
      id: newQuestionId,
      ...questionData,
      status: QUESTION_STATUS.CREATED, // CREATED, LIVE, FINISHED, CANCELED
      createdAt: new Date().toISOString(),
    };

    // Ensure minSelections is null if not multiple
    if (newQuestion.type !== QUESTION_TYPES.MULTIPLE) {
      newQuestion.minSelections = null;
    }

    const assemblyQuestionsRef = doc(db, "assemblyQuestions", assemblyId);

    // Check if doc exists, if not create it
    const docSnap = await getDoc(assemblyQuestionsRef);
    if (!docSnap.exists()) {
      await setDoc(assemblyQuestionsRef, {
        assemblyId,
        questions: [newQuestion],
      });
    } else {
      await updateDoc(assemblyQuestionsRef, {
        questions: arrayUnion(newQuestion),
      });
    }

    return { success: true, id: newQuestionId };
  } catch (error) {
    console.error("Error creating question:", error);
    return { success: false, error };
  }
}

/**
 * Updates an existing question in the array
 * Note: Firestore array updates are tricky. We might need to read, modify, write.
 * Or usage of arrayRemove/arrayUnion if we replace the whole object.
 * For simplicity and atomicity, we'll read-modify-write here or assume the passed object is complete.
 */
export async function updateQuestion(assemblyId, questionId, updatedData) {
  try {
    const assemblyQuestionsRef = doc(db, "assemblyQuestions", assemblyId);
    const docSnap = await getDoc(assemblyQuestionsRef);

    if (!docSnap.exists())
      return { success: false, error: "No questions found" };

    const data = docSnap.data();
    const questions = data.questions || [];
    const index = questions.findIndex((q) => q.id === questionId);

    if (index === -1) return { success: false, error: "Question not found" };

    const updatedQuestion = { ...questions[index], ...updatedData };
    questions[index] = updatedQuestion;

    await updateDoc(assemblyQuestionsRef, { questions });
    return { success: true };
  } catch (error) {
    console.error("Error updating question:", error);
    return { success: false, error };
  }
}

/**
 * Updates question status
 */
export async function updateQuestionStatus(assemblyId, questionId, status) {
  return updateQuestion(assemblyId, questionId, { status });
}

/**
 * Submits a vote for a question
 * Validates blocking and min selections
 * Uses "assemblyVotes" collection (Single Doc per Assembly) pattern.
 */
export async function submitVote({
  assemblyId,
  questionId,
  propertyOwnerId,
  registrationId,
  selectedOptions,
  votingPower,
  property, // Passed for validation (votingBlocked)
  question, // Passed for validation (minSelections, type)
}) {
  try {
    // 1. Validation: Blocked
    if (property.votingBlocked) {
      throw new Error("Esta propiedad está bloqueada para votar");
    }

    // 2. Validation: Min Selections
    if (question.type === QUESTION_TYPES.MULTIPLE && question.minSelections) {
      if (selectedOptions.length < question.minSelections) {
        throw new Error(
          `Debe seleccionar al menos ${question.minSelections} opciones`,
        );
      }
    }

    // 3. Create Vote Object
    const voteObject = {
      assemblyId,
      questionId,
      propertyOwnerId,
      registrationId,
      selectedOptions,
      votingPower,
      createdAt: new Date().toISOString(), // Use string format for arrayUnion compatibility
    };

    // 4. Update Assembly Votes Document
    const votesRef = doc(db, "assemblyVotes", assemblyId);

    // Check if doc exists (optimization: try update, catch fail -> set)
    // Or just set with merge on a field? arrayUnion works with updateDoc.
    // We need to ensure the doc exists.
    // Simplest: setDoc with merge: true? arrayUnion requires updateDoc usually or setDoc with merge.
    // However, arrayUnion on a non-existent doc with setDoc might work or not.
    // Safest: setDoc with merge: true for creation, then update or just setDoc.

    // To minimize reads, we can try update, if fails, set.
    // But standard pattern: ensure doc exists.
    // Let's assume it might not exist if it's the first vote.

    await setDoc(
      votesRef,
      {
        votes: arrayUnion(voteObject),
      },
      { merge: true },
    );

    return { success: true };
  } catch (error) {
    console.error("Error submitting vote:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Submits votes in batch (Block Voting)
 * votes: Array of validated vote objects prepared by the caller.
 * Uses "assemblyVotes" collection (Single Doc per Assembly).
 */
export async function submitBatchVotes(assemblyId, questionId, votesToSubmit) {
  try {
    const votesWithTimestamp = votesToSubmit.map((v) => ({
      assemblyId,
      questionId,
      propertyOwnerId: v.propertyOwnerId,
      registrationId: v.registrationId,
      selectedOptions: v.selectedOptions,
      votingPower: v.votingPower,
      createdAt: new Date().toISOString(),
    }));

    const votesRef = doc(db, "assemblyVotes", assemblyId);
    // Use arrayUnion with spread... but arrayUnion takes varargs, not array.
    // Does Firestore JS SDK support array? arrayUnion(...votesWithTimestamp)
    // There is a limit on arguments (varargs).
    // If votesWithTimestamp is large (e.g. 50 items), it's fine.

    await setDoc(
      votesRef,
      {
        votes: arrayUnion(...votesWithTimestamp),
      },
      { merge: true },
    );

    return { success: true };
  } catch (error) {
    console.error("Error submitting batch votes:", error);
    return { success: false, error };
  }
}

// Helper to delete (logically or remove from array)
export async function deleteQuestion(assemblyId, questionId) {
  // Use updateQuestion to set isDeleted: true
  return updateQuestion(assemblyId, questionId, { isDeleted: true });
}

/**
 * Finishes all live questions for an assembly
 * (Updated for new schema)
 */
export async function finishAllLiveQuestions(assemblyId) {
  try {
    const assemblyQuestionsRef = doc(db, "assemblyQuestions", assemblyId);
    const docSnap = await getDoc(assemblyQuestionsRef);

    if (!docSnap.exists()) return { success: true };

    const data = docSnap.data();
    const questions = data.questions || [];
    let changed = false;

    const updatedQuestions = questions.map((q) => {
      if (q.status === QUESTION_STATUS.LIVE) {
        changed = true;
        return { ...q, status: QUESTION_STATUS.FINISHED };
      }
      return q;
    });

    if (changed) {
      await updateDoc(assemblyQuestionsRef, { questions: updatedQuestions });
    }

    return { success: true };
  } catch (error) {
    console.error("Error finishing questions:", error);
    return { success: false, error };
  }
}

/**
 * Resets all questions (clears votes) for an assembly.
 * Deletes all vote documents for the given assembly.
 */
/**
 * Resets all questions (clears votes) for an assembly.
 * Deletes the assemblyVotes document for the given assembly.
 */
export async function resetAllQuestionsAnswers(assemblyId) {
  try {
    // 1. Delete the "assemblyVotes" doc
    const votesRef = doc(db, "assemblyVotes", assemblyId);
    await deleteDoc(votesRef);

    // 2. Also reset question status to CREATED
    const assemblyQuestionsRef = doc(db, "assemblyQuestions", assemblyId);
    const docSnap = await getDoc(assemblyQuestionsRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const questions = data.questions || [];
      const updatedQuestions = questions.map((q) => ({
        ...q,
        status: QUESTION_STATUS.CREATED,
      }));
      await updateDoc(assemblyQuestionsRef, { questions: updatedQuestions });
    }

    return { success: true };
  } catch (error) {
    console.error("Error resetting questions:", error);
    return { success: false, error };
  }
}
