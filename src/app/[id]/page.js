"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  getEntityById,
  getAssemblyRegistriesList,
  updateRegistryStatus,
} from "@/lib/entities";
import { updateAssembly } from "@/lib/assembly";
import { collection, query, where } from "firebase/firestore";
import Loader from "@/components/basics/Loader";
import {
  User,
  Check,
  MapPin,
  Video,
  Copy,
  ArrowRight,
  ArrowLeft,
  Search,
  Building2,
  HelpCircle,
  AlertTriangle,
  X,
  LogOut,
} from "lucide-react";
import { toast } from "react-toastify";
import { QUESTION_STATUS, QUESTION_TYPES, submitVote } from "@/lib/questions";

const PropertyCard = ({ registry, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`p-5 rounded-[20px] cursor-pointer transition-all border-2 flex items-center gap-4 ${
      isSelected
        ? "border-[#8B9DFF] bg-blue-50/50"
        : "border-gray-100 bg-white hover:border-blue-200"
    }`}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
        isSelected ? "bg-indigo-100 text-[#8B9DFF]" : "bg-gray-50 text-gray-400"
      }`}
    >
      <Building2 size={24} />
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-[#0E3C42] text-md">
        {registry.tipo ? `${registry.tipo} - ` : ""}
        {registry.grupo ? `${registry.grupo} - ` : ""}
        {registry.propiedad || "---"}
      </h4>
      <div className="flex items-center gap-2 mt-1">
        <span className="bg-[#E0F7FA] text-[#0E3C42] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
          Propietario
        </span>
        <span className="text-xs text-gray-500">
          Coeficiente:{" "}
          <span className="font-bold">{registry.coeficiente || "0"}%</span>
        </span>
      </div>
    </div>
    {isSelected && (
      <div className="w-6 h-6 bg-[#8B9DFF] rounded-full flex items-center justify-center">
        <Check size={14} className="text-white" />
      </div>
    )}
  </div>
);

const QuestionItem = ({ q, selectedRegistry, assembly }) => {
  const effectiveVoteBlocked =
    selectedRegistry?.voteBlocked ||
    (assembly?.blockedVoters || []).includes(selectedRegistry?.id);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [openAnswer, setOpenAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasVoted = q.answers && q.answers[selectedRegistry?.id];
  const userVote = hasVoted ? q.answers[selectedRegistry.id] : null;

  const handleVote = async (answer) => {
    setIsSubmitting(true);
    const res = await submitVote(q.id, selectedRegistry.id, answer);
    if (res.success) toast.success("Voto registrado");
    else toast.error("Error al votar");
    setIsSubmitting(false);
  };

  const toggleOption = (opt) => {
    if (selectedOptions.includes(opt)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== opt));
    } else {
      setSelectedOptions([...selectedOptions, opt]);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-bold text-[#0E3C42] pr-4">{q.title}</h3>
        {effectiveVoteBlocked ? (
          <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle size={12} /> Voto bloqueado
          </span>
        ) : hasVoted ? (
          <span className="bg-green-100 text-green-600 text-[10px] font-black uppercase px-3 py-1 rounded-full">
            Ya votaste
          </span>
        ) : null}
      </div>

      {effectiveVoteBlocked ? (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <p className="text-sm text-red-600 font-medium">
            Lo sentimos, tu derecho al voto ha sido bloqueado por el
            administrador. Comunícate con soporte si crees que esto es un error.
          </p>
        </div>
      ) : !hasVoted ? (
        <div className="flex flex-col gap-4">
          {/* UNIQUE & YES_NO */}
          {(q.type === QUESTION_TYPES.UNIQUE ||
            q.type === QUESTION_TYPES.YES_NO) && (
            <div className="grid grid-cols-1 gap-3">
              {(q.type === QUESTION_TYPES.YES_NO
                ? ["Sí", "No"]
                : q.options
              ).map((opt, i) => (
                <button
                  key={i}
                  disabled={isSubmitting}
                  onClick={() => handleVote({ option: opt })}
                  className="w-full p-4 rounded-2xl border-2 border-gray-50 hover:border-[#8B9DFF] hover:bg-indigo-50/50 text-left transition-all font-bold text-[#0E3C42] text-sm group flex items-center justify-between"
                >
                  {opt}
                  <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-[#8B9DFF] transition-all"></div>
                </button>
              ))}
            </div>
          )}

          {/* MULTIPLE */}
          {q.type === QUESTION_TYPES.MULTIPLE && (
            <>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedOptions.includes(opt)
                        ? "border-[#8B9DFF] bg-indigo-50/50"
                        : "border-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedOptions.includes(opt)}
                      onChange={() => toggleOption(opt)}
                    />
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedOptions.includes(opt)
                          ? "bg-[#8B9DFF] border-[#8B9DFF]"
                          : "border-gray-200"
                      }`}
                    >
                      {selectedOptions.includes(opt) && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                    <span className="font-bold text-[#0E3C42] text-sm">
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
              <button
                disabled={selectedOptions.length === 0 || isSubmitting}
                onClick={() => handleVote({ options: selectedOptions })}
                className="w-full bg-[#8B9DFF] text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-[#7a8ce0] transition-all disabled:opacity-50 mt-2"
              >
                Registrar Voto
              </button>
            </>
          )}

          {/* OPEN */}
          {q.type === QUESTION_TYPES.OPEN && (
            <>
              <textarea
                placeholder="Escribe aquí tu respuesta..."
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 outline-none focus:border-[#8B9DFF] transition-all text-[#0E3C42] font-medium resize-none min-h-[120px]"
                value={openAnswer}
                onChange={(e) => setOpenAnswer(e.target.value)}
              />
              <button
                disabled={!openAnswer.trim() || isSubmitting}
                onClick={() => handleVote({ answerText: openAnswer })}
                className="w-full bg-[#8B9DFF] text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-[#7a8ce0] transition-all disabled:opacity-50"
              >
                Enviar Respuesta
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">
            Tu respuesta:
          </p>
          <div className="flex items-center gap-3 text-[#0E3C42] font-bold">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
            {userVote.option ||
              userVote.options?.join(", ") ||
              userVote.answerText}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AssemblyAccessPage() {
  const { id } = useParams(); // assemblyId
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assembly, setAssembly] = useState(null);
  const [entity, setEntity] = useState(null);
  const [registries, setRegistries] = useState([]);

  // Wizard State
  const [step, setStep] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`step_${id}`);
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  // User Info (Step 1)
  const [userInfo, setUserInfo] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`userInfo_${id}`);
      return saved
        ? JSON.parse(saved)
        : { firstName: "", lastName: "", email: "", phone: "" };
    }
    return { firstName: "", lastName: "", email: "", phone: "" };
  });

  // Selected Registry (Step 2)
  const [searchTerm, setSearchTerm] = useState("");
  const [inputDocument, setInputDocument] = useState("");
  const [selectedRegistry, setSelectedRegistry] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`selectedRegistry_${id}`);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Terms (Step 3)
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Meeting / Voting State
  const [isInMeeting, setIsInMeeting] = useState(step === 4);
  const [questions, setQuestions] = useState([]);
  const [votedQuestions, setVotedQuestions] = useState({}); // track locally too for UX
  const [showFinishedModal, setShowFinishedModal] = useState(false);

  useEffect(() => {
    if (userInfo.firstName || userInfo.lastName || userInfo.email) {
      localStorage.setItem(`userInfo_${id}`, JSON.stringify(userInfo));
    }
    localStorage.setItem(`step_${id}`, step.toString());
    if (selectedRegistry) {
      localStorage.setItem(
        `selectedRegistry_${id}`,
        JSON.stringify(selectedRegistry)
      );
    }
  }, [userInfo, step, selectedRegistry, id]);

  // Sync selectedRegistry with real-time registries list
  useEffect(() => {
    if (selectedRegistry && registries.length > 0) {
      const updated = registries.find((r) => r.id === selectedRegistry.id);
      // Only update if something relevant actually changed (like voteBlocked status)
      // to avoid infinite loops or unnecessary renders.
      if (updated && updated.voteBlocked !== selectedRegistry.voteBlocked) {
        setTimeout(() => setSelectedRegistry(updated), 0);
      }
    }
  }, [registries, selectedRegistry]);

  useEffect(() => {
    let unsubDetails = () => {};
    let unsubQuestions = () => {};

    const assemblyRef = doc(db, "assembly", id);
    const unsubAssembly = onSnapshot(assemblyRef, async (docSnap) => {
      if (docSnap.exists()) {
        const assemblyData = { id: docSnap.id, ...docSnap.data() };
        setAssembly(assemblyData);

        // Auto-update status if time passed
        if (
          assemblyData.status === "create" &&
          assemblyData.date &&
          assemblyData.hour
        ) {
          const now = new Date();
          const [year, month, day] = assemblyData.date.split("-").map(Number);
          const match = assemblyData.hour.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
          if (match) {
            let h = parseInt(match[1]);
            const m = parseInt(match[2]);
            const ampm = match[3].toUpperCase();
            if (ampm === "PM" && h < 12) h += 12;
            if (ampm === "AM" && h === 12) h = 0;
            const assemblyDateTime = new Date(year, month - 1, day, h, m);

            if (now >= assemblyDateTime) {
              await updateAssembly(id, { status: "started" });
            }
          }
        }

        if (assemblyData.status === "finished" && isInMeeting) {
          setShowFinishedModal(true);
        }

        if (assemblyData.entityId) {
          const resEntity = await getEntityById(assemblyData.entityId);
          if (resEntity.success) {
            setEntity(resEntity.data);

            // Listen to registries if needed for real-time (to check if user is already registered in case registries are finalized)
            if (resEntity.data.assemblyRegistriesListId) {
              const listRef = doc(
                db,
                "assemblyRegistriesList",
                resEntity.data.assemblyRegistriesListId
              );
              unsubDetails = onSnapshot(listRef, (listSnap) => {
                if (listSnap.exists()) {
                  // Changed to Object.values as per instruction, assuming IDs are not needed as keys here
                  const regs = Object.entries(
                    listSnap.data().assemblyRegistries || {}
                  ).map(([key, val]) => ({
                    id: key,
                    ...val,
                  }));
                  setRegistries(regs);
                }
              });
            }
          }
        }

        // Listen to questions
        if (assemblyData.questions && assemblyData.questions.length > 0) {
          const qRef = collection(db, "question");
          unsubQuestions = onSnapshot(qRef, (qSnap) => {
            const qList = qSnap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter(
                (qItem) =>
                  assemblyData.questions.includes(qItem.id) && !qItem.isDeleted
              );
            setQuestions(qList);
          });
        }
      } else {
        toast.error("Asamblea no encontrada");
      }
      setLoading(false);
    });

    return () => {
      unsubAssembly();
      unsubDetails();
      unsubQuestions(); // Cleanup questions listener
    };
  }, [id, isInMeeting]);

  useEffect(() => {
    if (
      assembly &&
      assembly.status === "create" &&
      assembly.date &&
      assembly.hour
    ) {
      const checkStatus = async () => {
        const now = new Date();
        const [year, month, day] = assembly.date.split("-").map(Number);
        const match = assembly.hour.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
        if (match) {
          let h = parseInt(match[1]);
          const m = parseInt(match[2]);
          const ampm = match[3].toUpperCase();
          if (ampm === "PM" && h < 12) h += 12;
          if (ampm === "AM" && h === 12) h = 0;
          const assemblyDateTime = new Date(year, month - 1, day, h, m);

          if (now >= assemblyDateTime) {
            await updateAssembly(id, { status: "started" });
          }
        }
      };

      const interval = setInterval(checkStatus, 30000);
      checkStatus();
      return () => clearInterval(interval);
    }
  }, [assembly, id]);

  /* --- Navigation Handlers --- */

  const goToNext = () => {
    if (step === 0) {
      // If any data is required, go to Step 1. Else go to Identification (Step 2)
      if (
        assembly.requireFullName ||
        assembly.requireEmail ||
        assembly.requirePhone
      ) {
        setStep(1);
      } else {
        setStep(2);
      }
      return;
    }
    if (step === 1) {
      // Validate Step 1
      if (
        assembly.requireFullName &&
        (!userInfo.firstName || !userInfo.lastName)
      ) {
        return toast.error("Nombre y Apellido son requeridos");
      }
      if (assembly.requireEmail && !userInfo.email) {
        return toast.error("Correo electrónico es requerido");
      }
      if (assembly.requirePhone && !userInfo.phone) {
        return toast.error("Teléfono es requerido");
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!selectedRegistry)
        return toast.error("Debes seleccionar una propiedad");

      // Check if registries are finalized
      if (
        assembly.status === "registries_finalized" &&
        !selectedRegistry.registerInAssembly
      ) {
        return toast.error(
          "Los registros para esta asamblea han finalizado. No puedes ingresar si no estás registrado."
        );
      }

      setStep(3);
      return;
    }
    if (step === 3) {
      if (!termsAccepted) return toast.error("Debes aceptar los términos");

      // Record attendance
      if (entity?.assemblyRegistriesListId && selectedRegistry?.id) {
        updateRegistryStatus(
          entity.assemblyRegistriesListId,
          selectedRegistry.id,
          true,
          userInfo
        );
      }

      setStep(4);
      return;
    }
  };

  const goToPrev = () => {
    if (step === 1) return setStep(0);
    if (step === 2) {
      if (
        assembly.requireFullName ||
        assembly.requireEmail ||
        assembly.requirePhone
      ) {
        setStep(1);
      } else {
        setStep(0);
      }
      return;
    }
    setStep((prev) => Math.max(0, prev - 1));
  };

  /* --- Step 2 Logic --- */

  const handleDocumentSearch = () => {
    if (!inputDocument) return toast.error("Ingresa tu documento");
    const found = registries.find(
      (reg) => String(reg.documento).trim() === inputDocument.trim()
    );
    if (found) {
      setSelectedRegistry(found);
      setSearchTriggered(true);

      // If already registered, jump to step 4 and meeting
      if (found.registerInAssembly) {
        setStep(4);
        setIsInMeeting(true);
        toast.success("Ya estás registrado, ingresando...");
      }
    } else {
      toast.error("Documento no encontrado en la base de datos");
      setSelectedRegistry(null);
      setSearchTriggered(false);
    }
  };

  const filteredRegistries = registries.filter((item) => {
    const search = searchTerm.toLowerCase();
    const prop = item.propiedad || "";
    const docStr = item.documento || "";
    const text = `${prop} ${docStr}`.toLowerCase();
    return text.includes(search);
  });

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );

  /* --- Step Rendering --- */

  if (step === 0) {
    return (
      <div className="flex min-h-screen w-full bg-[#F8F9FB] items-center justify-center p-4">
        <div className="w-full max-w-6xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center text-center md:text-left">
            <div className="mb-8">
              <h1 className="text-5xl font-extrabold text-[#0E3C42] mb-3 leading-tight tracking-tight">
                Hola,
                <br />
                asambleísta!
              </h1>
              <p className="text-gray-500 text-lg">
                Accede a tu reunión y participa activamente.
              </p>
            </div>

            <div className="bg-[#F8F9FB] rounded-2xl p-8 mb-10 border border-gray-100">
              <h2 className="text-xl font-bold text-[#0E3C42] mb-2">
                {assembly.name}
              </h2>
              <p className="text-[#8B9DFF] font-medium mb-1">
                {entity?.name || "..."}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                {assembly.date} - {assembly.hour}
              </p>
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-[#8B9DFF] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {assembly.type}
                {assembly.status === "create" && (
                  <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md lowercase normal-case">
                    no ha iniciado
                  </span>
                )}
              </span>
            </div>

            <button
              onClick={goToNext}
              disabled={
                assembly.status === "create" || assembly.status === "finished"
              }
              className={`w-full md:w-max px-12 font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-xl ${
                assembly.status === "create" || assembly.status === "finished"
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#8B9DFF] hover:bg-[#7a8ce0] text-white hover:scale-105 shadow-indigo-100"
              }`}
            >
              <User size={24} />
              Ingresar
            </button>

            {assembly.status === "create" && (
              <p className="mt-4 text-orange-500 font-bold text-sm animate-pulse">
                La asamblea aún no ha iniciado por el administrador.
              </p>
            )}
            {assembly.status === "registries_finalized" && (
              <p className="mt-4 text-blue-500 font-bold text-sm">
                Los registros han finalizado. Solo pueden ingresar asambleístas
                ya registrados.
              </p>
            )}
            {assembly.status === "finished" && (
              <p className="mt-4 text-red-500 font-bold text-sm">
                La reunión ha finalizado.
              </p>
            )}
          </div>
          <div className="w-full md:w-1/2 bg-gradient-to-br from-[#E0F7FA] to-[#8B9DFF] relative flex flex-col items-center justify-center p-12 text-center overflow-hidden">
            <div className="z-10 animate-in fade-in zoom-in duration-700">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 skew-x-[-12deg] bg-[#0E3C42] rounded-2xl flex items-center justify-center">
                  <Building2 size={32} className="text-white" />
                </div>
                <h1 className="text-6xl font-black text-[#0E3C42] tracking-tighter">
                  intuapp
                </h1>
              </div>
              <p className="text-[#0E3C42] text-2xl font-semibold opacity-80 italic">
                Lo complejo hecho simple
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#f4f7f9] items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-sm p-10 min-h-[600px] flex flex-col relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>

        {/* Header / Progress */}
        <div className="flex items-center mb-12 z-10">
          <button
            onClick={goToPrev}
            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl transition mr-6"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8B9DFF] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(139,157,255,0.5)]"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
          <span className="ml-6 text-xs font-black text-[#8B9DFF] bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-tighter">
            Paso {step} de 4
          </span>
        </div>

        {/* Step 1: User Info */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full z-10">
            <h2 className="text-3xl font-black text-[#0E3C42] mb-3 text-center">
              Tus datos
            </h2>
            <p className="text-gray-400 mb-10 text-center">
              Completa la siguiente información para continuar.
            </p>

            <div className="w-full flex flex-col gap-6">
              {assembly.requireFullName && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-[#8B9DFF] uppercase mb-2 tracking-widest pl-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Juan"
                      className="bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-[#8B9DFF] transition-all"
                      value={userInfo.firstName}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-[#8B9DFF] uppercase mb-2 tracking-widest pl-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Pérez"
                      className="bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-[#8B9DFF] transition-all"
                      value={userInfo.lastName}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {assembly.requireEmail && (
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-[#8B9DFF] uppercase mb-2 tracking-widest pl-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    className="bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-[#8B9DFF] transition-all"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, email: e.target.value })
                    }
                  />
                </div>
              )}

              {assembly.requirePhone && (
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-[#8B9DFF] uppercase mb-2 tracking-widest pl-1">
                    Número de teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="300 000 0000"
                    className="bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-[#8B9DFF] transition-all"
                    value={userInfo.phone}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, phone: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            <button
              onClick={goToNext}
              className="w-full bg-[#0E3C42] hover:bg-[#08282d] text-white font-bold py-5 rounded-2xl mt-12 transition-all shadow-lg shadow-gray-200"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Identification/Selection */}
        {step === 2 && (
          <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full z-10">
            <h2 className="text-3xl font-black text-[#0E3C42] mb-3 text-center">
              {assembly.accessMethod === "database_document"
                ? "Identificación"
                : "Selecciona tu propiedad"}
            </h2>
            <p className="text-center text-gray-400 mb-10 text-sm">
              {assembly.accessMethod === "database_document"
                ? "Ingresa tu documento para encontrar tu registro."
                : "Busca y selecciona la propiedad que representas."}
            </p>

            {assembly.accessMethod === "database_document" ? (
              <div className="flex flex-col items-center">
                <div className="w-full relative mb-8">
                  <label className="text-[10px] font-black text-[#8B9DFF] uppercase mb-2 tracking-widest pl-1 block">
                    Número de Documento
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Ej: 12345678"
                      className="flex-1 bg-gray-50 border-none rounded-2xl p-5 outline-none focus:ring-2 ring-[#8B9DFF] transition-all text-lg font-bold"
                      value={inputDocument}
                      onChange={(e) => {
                        setInputDocument(e.target.value);
                        setSelectedRegistry(null);
                        setSearchTriggered(false);
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleDocumentSearch()
                      }
                    />
                    <button
                      onClick={handleDocumentSearch}
                      className="bg-[#8B9DFF] text-white p-5 rounded-2xl hover:bg-[#7a8ce0] transition shadow-lg shadow-indigo-100"
                    >
                      <Search size={24} />
                    </button>
                  </div>
                </div>

                {selectedRegistry && (
                  <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
                    <p className="text-xs font-black text-gray-400 uppercase mb-3 ml-1 tracking-widest">
                      Información Encontrada
                    </p>
                    <PropertyCard
                      registry={selectedRegistry}
                      isSelected={true}
                      onClick={() => {}}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="relative mb-8">
                  <Search
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Torre, apartamento, propiedad..."
                    className="w-full bg-gray-50 border-none rounded-2xl p-5 pl-14 outline-none focus:ring-2 ring-[#8B9DFF] transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 space-y-4 custom-scrollbar">
                  {filteredRegistries.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-100">
                      <p className="text-gray-400 font-medium">
                        No se encontraron resultados
                      </p>
                    </div>
                  )}
                  {filteredRegistries.map((reg) => (
                    <PropertyCard
                      key={reg.id}
                      registry={reg}
                      isSelected={selectedRegistry?.id === reg.id}
                      onClick={() => setSelectedRegistry(reg)}
                    />
                  ))}
                </div>
              </>
            )}

            <button
              onClick={goToNext}
              disabled={!selectedRegistry}
              className={`w-full bg-[#0E3C42] hover:bg-[#08282d] text-white font-bold py-5 rounded-2xl mt-12 transition-all shadow-xl shadow-gray-100 ${
                !selectedRegistry
                  ? "opacity-30 cursor-not-allowed grayscale"
                  : ""
              }`}
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 3: Terms */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center max-w-lg mx-auto w-full text-center z-10">
            <div className="w-20 h-20 bg-indigo-50 text-[#8B9DFF] rounded-[24px] flex items-center justify-center mb-6">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-black text-[#0E3C42] mb-3">
              Términos y condiciones
            </h2>
            <p className="text-gray-400 mb-10">
              Tu participación es importante. Por favor lee y acepta.
            </p>

            <div className="bg-gray-50 p-8 rounded-[30px] border border-gray-100 text-left mb-8 max-h-[250px] overflow-y-auto leading-relaxed">
              <h3 className="font-black text-[#0E3C42] mb-3 uppercase tracking-tighter">
                Tratamiento de datos personales
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Con el envío de sus datos está declarando que toda la
                información suministrada es veraz y no está suplantando a nadie
                para la participación en la asamblea.
              </p>
              <p className="text-sm text-gray-500">
                Diligenciando este registro, está aceptando que IntuApp realice
                tratamiento de sus datos personales conforme a la Política de
                Uso de Datos, exclusivamente para lo relacionado con la presente
                asamblea.
              </p>
            </div>

            <label className="group flex items-center gap-4 cursor-pointer mb-10 select-none p-2 rounded-2xl hover:bg-gray-50 transition">
              <div
                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                  termsAccepted
                    ? "bg-[#8B9DFF] border-[#8B9DFF] scale-110 shadow-lg shadow-indigo-100"
                    : "border-gray-200 bg-white"
                }`}
              >
                {termsAccepted && (
                  <Check size={18} className="text-white" strokeWidth={4} />
                )}
              </div>
              <span
                className={`text-sm font-bold transition-colors ${
                  termsAccepted ? "text-[#0E3C42]" : "text-gray-400"
                }`}
              >
                He leído y acepto los términos y condiciones
              </span>
              <input
                type="checkbox"
                className="hidden"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
              />
            </label>

            <button
              onClick={goToNext}
              disabled={!termsAccepted}
              className={`w-full bg-[#0E3C42] hover:bg-[#08282d] text-white font-bold py-5 rounded-2xl transition-all shadow-xl ${
                !termsAccepted ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 4: FinalAccess or Meeting */}
        {step === 4 && (
          <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full z-10">
            {!isInMeeting ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
                  <Check size={40} />
                </div>
                <h2 className="text-3xl font-black text-[#0E3C42] mb-3">
                  ¡Todo listo!
                </h2>
                <p className="text-gray-400 mb-10">
                  Has completado tu registro exitosamente. Ya puedes acceder a
                  la reunión.
                </p>

                <button
                  onClick={() => setIsInMeeting(true)}
                  className="w-full bg-[#0E3C42] text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 text-xl mb-4"
                >
                  Acceder a la reunión
                </button>

                {assembly.meetLink && (
                  <a
                    href={
                      assembly.meetLink.startsWith("http")
                        ? assembly.meetLink
                        : `https://${assembly.meetLink}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#8B9DFF] text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-[#7a8ce0] transition-all flex items-center justify-center gap-2"
                  >
                    <Video size={20} /> Ir a la videollamada (Zoom/Meet)
                  </a>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col mb-4">
                  <h2 className="text-2xl font-black text-[#0E3C42]">
                    Votaciones en vivo
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Participa en las votaciones activas en tiempo real.
                  </p>
                </div>

                {assembly.meetLink && (
                  <a
                    href={
                      assembly.meetLink.startsWith("http")
                        ? assembly.meetLink
                        : `https://${assembly.meetLink}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-50 text-[#8B9DFF] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all text-sm"
                  >
                    <Video size={18} /> Videollamada
                  </a>
                )}

                {questions.filter((q) => q.status === QUESTION_STATUS.LIVE)
                  .length === 0 && (
                  <div className="bg-indigo-50/50 p-10 rounded-[32px] border border-dashed border-indigo-100 text-center">
                    <HelpCircle
                      size={48}
                      className="text-[#8B9DFF] mx-auto mb-4 opacity-30"
                    />
                    <p className="text-[#0E3C42] font-bold">
                      No hay votaciones activas en este momento.
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Espera a que el administrador inicie una pregunta.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {questions
                    .filter((q) => q.status === QUESTION_STATUS.LIVE)
                    .map((q) => (
                      <QuestionItem
                        key={q.id}
                        q={q}
                        selectedRegistry={selectedRegistry}
                        assembly={assembly}
                      />
                    ))}
                </div>

                {/* Show Finished Results */}
                {questions.filter((q) => q.status === QUESTION_STATUS.FINISHED)
                  .length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest pl-1">
                      Votaciones concluidas
                    </h4>
                    <div className="flex flex-col gap-4">
                      {questions
                        .filter((q) => q.status === QUESTION_STATUS.FINISHED)
                        .map((q) => {
                          const userVote =
                            q.answers && q.answers[selectedRegistry?.id];
                          return (
                            <div
                              key={q.id}
                              className="bg-gray-50 p-6 rounded-2xl border border-gray-100 opacity-80"
                            >
                              <h5 className="font-bold text-[#0E3C42] mb-3 text-sm">
                                {q.title}
                              </h5>
                              {userVote ? (
                                <p className="text-xs text-green-600 font-bold">
                                  Votaste:{" "}
                                  {userVote.option ||
                                    userVote.options?.join(", ") ||
                                    userVote.answerText}
                                </p>
                              ) : (
                                <p className="text-xs text-red-500 font-bold">
                                  Votación finalizada (No participaste)
                                </p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ASSEMBLY FINISHED MODAL */}
      {showFinishedModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] p-12 max-w-md w-full text-center relative animate-in zoom-in duration-300 shadow-2xl">
            <div className="w-20 h-20 bg-indigo-50 text-[#8B9DFF] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <LogOut size={40} />
            </div>
            <h3 className="text-3xl font-black text-[#0E3C42] mb-4">
              ¡Asamblea Finalizada!
            </h3>
            <p className="text-gray-400 mb-10 leading-relaxed font-semibold">
              La reunión ha concluido exitosamente. Muchas gracias por su
              participación activa y compromiso.
            </p>
            <button
              onClick={() => {
                setShowFinishedModal(false);
                setIsInMeeting(false);
                setStep(0);
              }}
              className="w-full bg-[#0E3C42] text-white font-black py-5 rounded-2xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3"
            >
              Cerrar y salir
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
