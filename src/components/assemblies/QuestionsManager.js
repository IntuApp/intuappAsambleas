"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, arrayUnion } from "firebase/firestore";
import { cancelAssemblyQuestion, updateQuestionStatus } from "@/lib/assemblyActions";

// Componentes Base (Asegúrate de que las rutas sean correctas)
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";
import CustomInput from "../basics/CustomInput"; // Corregida la ruta
import CustomSelect from "../basics/CustomSelect"; // Corregida la ruta
import CustomIcon from "../basics/CustomIcon";
import { ICON_PATHS } from "@/constans/iconPaths";
import QuestionCard from "./QuestionCard";
import VotersModal from "./VotersModal"; // 🔥 NUEVO IMPORT

const QUESTION_TYPES = { UNIQUE: "1", MULTIPLE: "2", YES_NO: "3", OPEN: "4" };
const QUESTION_STATUSES = { CREATED: "1", LIVE: "2", FINISHED: "3", CANCELED: "4" };

export default function QuestionsManager({ assemblyId, assemblyData }) {
    const [questionsList, setQuestionsList] = useState([]);
    const [votes, setVotes] = useState([]); // 🔥 NUEVO: Estado de Votos
    const [registries, setRegistries] = useState([]); // 🔥 NUEVO: Estado de Registros (Aplanados)
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [viewingVotersForQuestion, setViewingVotersForQuestion] = useState(null);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    // Form State
    const [newQuestion, setNewQuestion] = useState({
        title: "",
        type: QUESTION_TYPES.UNIQUE,
        minSelections: 1,
        options: [
            { id: `opt-${Date.now()}-1`, text: "" },
            { id: `opt-${Date.now()}-2`, text: "" }
        ]
    });

    // 1. Escuchar preguntas, votos y registros de Firebase en tiempo real
    useEffect(() => {
        if (!assemblyId) return;

        // Escuchar Preguntas
        const qRef = doc(db, "assemblyQuestions", assemblyId);
        const unsubQ = onSnapshot(qRef, (docSnap) => {
            if (docSnap.exists()) setQuestionsList(docSnap.data().questions || []);
            else setQuestionsList([]);
        });

        // Escuchar Votos (Asegúrate de que esta colección exista así en tu BD)
        const vRef = doc(db, "assemblyVotes", assemblyId);
        const unsubV = onSnapshot(vRef, (docSnap) => {
            if (docSnap.exists()) setVotes(docSnap.data().votes || []);
            else setVotes([]);
        });

        // Escuchar Registros (Asegúrate de que el ID del doc sea el registrationRecordId)
        const recordId = assemblyData?.registrationRecordId || assemblyId;
        const rRef = doc(db, "assemblyRegistrations", recordId);
        const unsubR = onSnapshot(rRef, (docSnap) => {
            if (docSnap.exists()) {
                const allProps = [];
                (docSnap.data().registrations || []).forEach(reg => {
                    if (!reg.isDeleted) {
                        (reg.representedProperties || []).forEach(prop => allProps.push(prop));
                    }
                });
                setRegistries(allProps);
            } else setRegistries([]);
        });

        return () => { unsubQ(); unsubV(); unsubR(); };
    }, [assemblyId, assemblyData]);

    // 2. Ajustar opciones si cambia el tipo de pregunta
    useEffect(() => {
        if (newQuestion.type === QUESTION_TYPES.YES_NO) {
            setNewQuestion(prev => ({
                ...prev,
                options: [{ id: "opt-yes", text: "Sí" }, { id: "opt-no", text: "No" }]
            }));
        } else if (newQuestion.type === QUESTION_TYPES.OPEN) {
            setNewQuestion(prev => ({ ...prev, options: [] }));
        } else if (newQuestion.options.length === 0 || newQuestion.options[0].id === "opt-yes") {
            setNewQuestion(prev => ({
                ...prev,
                options: [{ id: `opt-${Date.now()}-1`, text: "" }, { id: `opt-${Date.now()}-2`, text: "" }]
            }));
        }
    }, [newQuestion.type]);

    // Handlers del Formulario
    const handleOptionChange = (idx, newText) => {
        const opts = [...newQuestion.options];
        opts[idx].text = newText;
        setNewQuestion({ ...newQuestion, options: opts });
    };

    const handleAddOption = () => {
        setNewQuestion({
            ...newQuestion,
            options: [...newQuestion.options, { id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, text: "" }]
        });
    };
    const handleEditRequest = (question) => {
        setNewQuestion({
            title: question.title,
            type: question.typeId,
            minSelections: question.minSelections || 1,
            options: question.options || []
        });
        setEditingQuestionId(question.id);
        setIsCreating(true); // Abrimos el formulario
        // Scroll opcional al formulario
        document.getElementById("add-question-form")?.scrollIntoView({ behavior: 'smooth' });
    };

    // Modificamos handleSaveQuestion para que soporte UPDATE
    const handleSaveQuestion = async () => {
        if (!newQuestion.title.trim()) return toast.error("El título es obligatorio.");

        setIsSaving(true);
        try {
            const qRef = doc(db, "assemblyQuestions", assemblyId);

            if (editingQuestionId) {
                // LÓGICA DE EDICIÓN
                const updatedQuestions = questionsList.map(q => {
                    if (q.id === editingQuestionId) {
                        return {
                            ...q,
                            title: newQuestion.title.trim(),
                            typeId: newQuestion.type,
                            minSelections: newQuestion.minSelections,
                            options: newQuestion.type === QUESTION_TYPES.OPEN ? [] : newQuestion.options,
                            updatedAt: new Date().toISOString(),
                        };
                    }
                    return q;
                });
                await setDoc(qRef, { questions: updatedQuestions }, { merge: true });
                toast.success("Pregunta actualizada");
            } else {
                // LÓGICA DE CREACIÓN (Tu código original)
                const questionDataToSave = {
                    id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title: newQuestion.title.trim(),
                    typeId: newQuestion.type,
                    statusId: QUESTION_STATUSES.CREATED,
                    createdAt: new Date().toISOString(),
                    options: newQuestion.type === QUESTION_TYPES.OPEN ? [] : newQuestion.options,
                    minSelections: newQuestion.minSelections,
                    startedAt: null,
                    durationSeconds: 0
                };
                await setDoc(qRef, { questions: arrayUnion(questionDataToSave) }, { merge: true });
                toast.success("Pregunta creada");
            }

            resetForm();
            setEditingQuestionId(null);
        } catch (error) {
            toast.error("Error al guardar");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };
    const handleRemoveOption = (idxToRemove) => {
        const opts = newQuestion.options.filter((_, i) => i !== idxToRemove);
        setNewQuestion({
            ...newQuestion,
            options: opts,
            minSelections: Math.min(newQuestion.minSelections, opts.length || 1)
        });
    };

    const resetForm = () => {
        setNewQuestion({
            title: "",
            type: QUESTION_TYPES.UNIQUE,
            minSelections: 1,
            options: [
                { id: `opt-${Date.now()}-1`, text: "" },
                { id: `opt-${Date.now()}-2`, text: "" }
            ]
        });
        setIsCreating(false);
    };

    // 4. Acciones de las tarjetas
    const handleCancelQuestion = async (questionId) => {
        try {
            await cancelAssemblyQuestion(assemblyId, questionId);
            toast.success("Votación cancelada");
        } catch (error) {
            toast.error("Hubo un error al intentar cancelar la votación");
            console.error(error);
        }
    };
    const handleToggleStatus = async (questionId, currentStatus) => {
        let newStatus = "";
        let confirmMessage = "";
        let meta = {};
        const question = questionsList.find(q => q.id === questionId);

        // Determinamos el nuevo estado y el mensaje de confirmación
        if (currentStatus === QUESTION_STATUSES.CREATED) {
            newStatus = QUESTION_STATUSES.LIVE;
            meta.startedAt = new Date().toISOString();
            meta.durationSeconds = 0;
        } else if (currentStatus === QUESTION_STATUSES.LIVE) {
            newStatus = QUESTION_STATUSES.FINISHED;
            if (question?.startedAt) {
                const now = new Date();
                const start = new Date(question.startedAt);
                meta.durationSeconds = Math.floor((now - start) / 1000);
            }
        } else if (currentStatus === QUESTION_STATUSES.FINISHED) {
            newStatus = QUESTION_STATUSES.LIVE;
            const previousDuration = question?.durationSeconds || 0;
            const fakeStartTime = new Date(Date.now() - (previousDuration * 1000));

            meta.startedAt = fakeStartTime.toISOString();
        }

        // Si el usuario cancela la alerta del navegador, no hacemos nada

        try {
            // Llamamos a nuestra nueva acción de servidor
            await updateQuestionStatus(assemblyId, questionId, newStatus, meta);

            // Notificamos al usuario según el cambio
            if (newStatus === QUESTION_STATUSES.LIVE) {
                toast.success("¡Votación iniciada con éxito!");
            } else if (newStatus === QUESTION_STATUSES.FINISHED) {
                toast.success("Votación finalizada. Resultados guardados.");
            }
        } catch (error) {
            toast.error("Hubo un error al cambiar el estado de la votación");
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            {/* HEADER */}
            <div className="flex justify-between items-center w-full">
                <CustomText variant="TitleL" className="font-bold text-[#0E3C42]">Preguntas</CustomText>
                {!isCreating && (
                    <CustomButton
                        variant="primary"
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 py-3 px-6 rounded-full font-bold shadow-sm hover:opacity-90"
                    >
                        <CustomIcon path={ICON_PATHS.add} size={18} />
                        Añadir pregunta
                    </CustomButton>
                )}
            </div>

            {/* FORMULARIO DE CREACIÓN */}
            {isCreating && (
                <div id="add-question-form" className="bg-[#FFFFFF] p-8 flex flex-col gap-5 rounded-3xl border border-[#E5E7EB] shadow-sm">
                    <CustomText variant="TitleS" className="font-bold text-[#0E3C42] mb-2">
                        Crear pregunta
                    </CustomText>

                    <div className="grid grid-cols-2 gap-4">
                        <CustomInput
                            label="Título de la pregunta"
                            variant="labelM"
                            placeholder="Escribe aquí el nombre de la unidad"
                            className="w-[500px] max-h-[80px]"
                            classLabel="text-[#333333] font-bold text-[14px]"
                            classInput="max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border focus:border-[#8B9DFF]"
                            value={newQuestion.title}
                            onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                        />

                        <div className="grid grid-cols-2 gap-10">
                            <CustomSelect
                                className=""
                                label="Tipo de encuesta"
                                variant="labelM"
                                classLabel="text-[#333333] font-bold"
                                value={newQuestion.type}
                                onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                            >
                                <option value={QUESTION_TYPES.UNIQUE}>Selección única</option>
                                <option value={QUESTION_TYPES.MULTIPLE}>Selección múltiple</option>
                                <option value={QUESTION_TYPES.YES_NO}>Sí / No</option>
                                <option value={QUESTION_TYPES.OPEN}>Abierta</option>
                            </CustomSelect>

                            {/* Mínimo de votos */}
                            {newQuestion.type === QUESTION_TYPES.MULTIPLE && (
                                <CustomSelect
                                    className=""
                                    label="Mínimo de votos"
                                    variant="labelM"
                                    classLabel="text-[#333333] font-bold"
                                    value={newQuestion.minSelections}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, minSelections: parseInt(e.target.value) })}
                                >
                                    {Array.from({ length: newQuestion.options.length }, (_, i) => i + 1).map((v) => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </CustomSelect>
                            )}
                        </div>
                    </div>

                    {/* OPCIONES DINÁMICAS */}
                    {(newQuestion.type === QUESTION_TYPES.UNIQUE || newQuestion.type === QUESTION_TYPES.MULTIPLE) && (
                        <div className="flex flex-col gap-4 mt-2">
                            <div className="flex flex-col gap-4">
                                {newQuestion.options.map((opt, idx) => (
                                    <div key={opt.id} className="flex items-center gap-3">
                                        <div className="flex flex-col items-center cursor-grab text-gray-400">
                                            <CustomIcon path={ICON_PATHS.dragIndicator} size={24} />
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Escriba aquí la opción"
                                            className="flex-1 border border-gray-200 rounded-xl w-full h-[56px] pl-4 pr-4 py-3 outline-none focus:border-[#8B9DFF] text-[14px]"
                                            value={opt.text}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        />

                                        {newQuestion.options.length > 2 && (
                                            <button
                                                onClick={() => handleRemoveOption(idx)}
                                                className="bg-[#94A2FF] text-black p-2 rounded-full hover:bg-[#8B9FFD] transition-colors"
                                            >
                                                <CustomIcon path={ICON_PATHS.delete} size={24} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleAddOption}
                                className="w-[158px] p-2 bg-transparent border-none font-bold flex items-center gap-2 hover:opacity-80 transition ml-8 mt-2"
                            >
                                <CustomIcon path={ICON_PATHS.add} size={18} className="text-[#4059FF]" />
                                <CustomText variant="bodyM" className="text-[#4059FF] font-bold">
                                    Añadir opción
                                </CustomText>
                            </button>
                        </div>
                    )}

                    <hr className="border-gray-100 my-4" />

                    {/* ACCIONES DEL FORMULARIO */}
                    <div className="flex justify-end gap-4">
                        <CustomButton
                            variant="secondary"
                            onClick={resetForm}
                            className="flex items-center gap-2 py-3 px-6 rounded-full border border-[#0E3C42] text-[#0E3C42] font-bold hover:bg-gray-50 transition-all"
                        >
                            <CustomIcon path={ICON_PATHS.delete} size={20} />
                            <span>{editingQuestionId ? "Cancelar edición" : "Cancelar"}</span>
                        </CustomButton>
                        <CustomButton
                            variant="primary"
                            className="flex items-center gap-2 py-3 px-8 rounded-full font-bold shadow-sm"
                            onClick={handleSaveQuestion}
                            disabled={isSaving}
                        >
                            <CustomIcon path={ICON_PATHS.check} size={20} />
                            <span>{isSaving ? "Guardando..." : "Guardar"}</span>
                        </CustomButton>
                    </div>
                </div>
            )}

            {/* LISTA DE PREGUNTAS: AHORA SÍ CONECTADA CON QUESTION CARD */}
            <div className="flex flex-col gap-10">
                {/* 🔥 ORDENAMIENTO: De más reciente a más antigua usando createdAt */}
                {[...questionsList]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((q) => (
                        <QuestionCard
                            key={q.id}
                            q={q}
                            registries={registries}
                            votes={votes}
                            isAdmin={true}
                            assembyStatus={assemblyData?.statusID}
                            onToggleStatus={handleToggleStatus}
                            onCancel={handleCancelQuestion}
                            // 🔥 CONECTAMOS LA FUNCIÓN
                            onViewVoters={(questionData) => setViewingVotersForQuestion(questionData)}
                            onEdit={handleEditRequest}

                        />
                    ))}

                {questionsList.length === 0 && !isCreating && (
                    <div className="text-center py-12 text-gray-400 font-medium">
                        Aún no hay preguntas creadas para esta asamblea.
                    </div>
                )}
            </div>
            <VotersModal
                isOpen={!!viewingVotersForQuestion}
                onClose={() => setViewingVotersForQuestion(null)}
                question={viewingVotersForQuestion}
                votes={votes}
                registries={registries}
            />
        </div>
    );
}