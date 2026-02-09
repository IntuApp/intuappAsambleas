"use client";

import { useState, useEffect, useRef } from "react";

import { useParams, useRouter } from "next/navigation";
import {
  getEntityById,
  getAssemblyRegistriesList,
  resetAssemblyRegistries,
  toggleVoteBlock,
  toggleRegistryDeletion,
  addRegistryToList,
} from "@/lib/entities";
import * as XLSX from "xlsx";

import {
  getAssemblyById,
  updateAssembly,
  toggleAssemblyVoteBlock,
} from "@/lib/assembly";
import {
  createAssemblyUser,
  getAssemblyUser,
  deleteAssemblyUser,
  deleteAllAssemblyUsers,
} from "@/lib/assemblyUser";
import { db, storage } from "@/lib/firebase";
import { ref, listAll, deleteObject, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Loader from "@/components/basics/Loader";
import TopBar from "@/components/ui/TopBar";
import { usePageTitle } from "@/context/PageTitleContext";
import {
  Calendar,
  MapPin,
  Video,
  Copy,
  QrCode,
  Download,
  Trash2,
  Search,
  User,
  Users,
  BarChart2,
  Edit2,
  AlertTriangle,
  X,
  Plus,
  HelpCircle,
  Play,
  Square,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  Check,
  GripVertical,
  ChevronUp,
  ChevronDown,
  FileText,
  Printer,
} from "lucide-react";
import {
  createQuestion,
  updateQuestion,
  updateQuestionStatus,
  QUESTION_TYPES,
  QUESTION_STATUS,
  resetAllQuestionsAnswers,
  finishAllLiveQuestions,
} from "@/lib/questions";
import QuestionCard from "@/components/question/QuestionCard";
import CustomModal from "@/components/basics/CustomModal";
import Button from "@/components/basics/Button";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";

import Quorum from "@/components/dashboard/Quorum";
import AssemblyStatsBoxes from "@/components/dashboard/AssemblyStatsBoxes";
import AttendanceTable from "@/components/dashboard/AttendanceTable";

import VoteRestrictionSection from "@/components/assemblies/VoteRestrictionSection";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import CustomIcon from "@/components/basics/CustomIcon";
import CustomTypeAssembly from "@/components/basics/CustomTypeAssembly";
import CustomStates from "@/components/basics/CustomStates";
import ExportAssemblyModal from "@/components/modals/ExportAssemblyModal";
import CustomCreateQuestion from "@/components/question/CustomCreateQuestion";
import QuestionsSection from "@/components/sections/QuestionsSection";
import { ICON_PATHS } from "@/constans/iconPaths";

const AssemblyDashboardPage = () => {
  const { entityId, assemblyId } = useParams();
  const { setSegmentTitle } = usePageTitle();
  const [loading, setLoading] = useState(true);
  const [assembly, setAssembly] = useState(null);
  const [entity, setEntity] = useState(null);
  const [registries, setRegistries] = useState([]);

  // Derived state for list ID
  const activeRegistriesListId =
    assembly?.assemblyRegistriesListId || entity?.assemblyRegistriesListId;

  const blockedVoters = new Set(
    registries.filter((r) => r.voteBlocked).map((r) => r.id),
  );

  // Stats
  const [quorum, setQuorum] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);

  // UI State
  const [publicUrl, setPublicUrl] = useState("");
  const [activeTab, setActiveTab] = useState("Registrados"); // Registrados, Pendientes, Eliminados
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [mainTab, setMainTab] = useState("Asambleistas"); // Asambleistas, Votaciones
  const [questions, setQuestions] = useState([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    type: QUESTION_TYPES.UNIQUE,
    minimumVotes: 1,
    options: ["", ""],
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [viewingVotersFor, setViewingVotersFor] = useState(null);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    description: "",
    confirmText: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/${assemblyId}`;
      setTimeout(() => setPublicUrl(url), 0);
    }

    const assemblyRef = doc(db, "assembly", assemblyId);
    const unsub = onSnapshot(assemblyRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setAssembly(data);
        setSegmentTitle(assemblyId, data.name);

        // Auto-update status if time passed
        if (data.status === "create" && data.date && data.hour) {
          const now = new Date();
          const [year, month, day] = data.date.split("-").map(Number);
          const match = data.hour.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
          if (match) {
            let h = parseInt(match[1]);
            const m = parseInt(match[2]);
            const ampm = match[3].toUpperCase();
            if (ampm === "PM" && h < 12) h += 12;
            if (ampm === "AM" && h === 12) h = 0;
            const assemblyDateTime = new Date(year, month - 1, day, h, m);

            if (now >= assemblyDateTime) {
              updateAssembly(assemblyId, { status: "started" });
            }
          }
        }
      } else {
        toast.error("Asamblea no encontrada");
      }
      setLoading(false);
    });

    return () => unsub();
  }, [assemblyId, setSegmentTitle]);

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
            await updateAssembly(assemblyId, { status: "started" });
          }
        }
      };

      const interval = setInterval(checkStatus, 30000); // Check every 30s
      checkStatus(); // Initial check
      return () => clearInterval(interval);
    }
  }, [assembly, assemblyId]);

  useEffect(() => {
    if (!assembly?.entityId) return;

    let unsubRegs = () => {};

    const setupRegistries = async () => {
      const resEntity = await getEntityById(assembly.entityId);
      if (resEntity.success) {
        setEntity(resEntity.data);
        setSegmentTitle(entityId, resEntity.data.name);

        // Determine which list to use (assembly-specific or entity-master)
        const listIdToUse =
          assembly.assemblyRegistriesListId ||
          resEntity.data.assemblyRegistriesListId;

        if (listIdToUse) {
          const listRef = doc(db, "assemblyRegistriesList", listIdToUse);
          unsubRegs = onSnapshot(listRef, (listSnap) => {
            if (listSnap.exists()) {
              const regsMap = listSnap.data().assemblyRegistries || {};
              const regs = Object.entries(regsMap).map(([regId, data]) => ({
                id: regId,
                ...data,
              }));
              setRegistries(regs);

              const registeredRegs = regs.filter(
                (r) => r.registerInAssembly === true,
              );
              const totalC = regs.reduce(
                (acc, item) =>
                  acc +
                  parseFloat(String(item.coeficiente || 0).replace(",", ".")),
                0,
              );
              const regC = registeredRegs.reduce(
                (acc, item) =>
                  acc +
                  parseFloat(String(item.coeficiente || 0).replace(",", ".")),
                0,
              );

              setRegisteredCount(registeredRegs.length);
              setBlockedCount(
                regs.filter((r) => r.voteBlocked === true).length,
              );
              setQuorum(totalC > 0 ? (regC / totalC) * 100 : 0);
            }
          });
        }
      }
    };

    setupRegistries();
    return () => unsubRegs();
  }, [
    assembly?.entityId,
    assembly?.assemblyRegistriesListId,
    entityId,
    setSegmentTitle,
  ]);

  useEffect(() => {
    if (!assembly?.questions || assembly.questions.length === 0) {
      // Use setTimeout to avoid synchronous state update during render/effect cycle
      setTimeout(() => {
        if (questions.length > 0) setQuestions([]);
      }, 0);
      return;
    }

    const qRef = collection(db, "question");
    const unsub = onSnapshot(qRef, (qSnap) => {
      const qList = qSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((q) => assembly.questions.includes(q.id) && !q.isDeleted);
      setQuestions(qList);
    });

    return () => unsub();
  }, [assembly?.questions, questions.length]);

  const handleAddQuestion = async () => {
    if (!newQuestion.title) return toast.error("El título es requerido");

    let questionToSave = { ...newQuestion };
    if (newQuestion.type === QUESTION_TYPES.YES_NO) {
      questionToSave.options = ["Sí", "No"];
    } else if (newQuestion.type === QUESTION_TYPES.OPEN) {
      questionToSave.options = [];
    } else {
      if (newQuestion.options.some((o) => !o.trim()))
        return toast.error("Todas las opciones deben estar llenas");
    }

    if (editingQuestionId) {
      const res = await updateQuestion(editingQuestionId, questionToSave);
      if (res.success) {
        toast.success("Pregunta actualizada");
        setShowAddQuestion(false);
        setEditingQuestionId(null);
        setNewQuestion({
          title: "",
          type: QUESTION_TYPES.UNIQUE,
          minimumVotes: 1,
          options: ["", ""],
        });
      } else {
        toast.error("Error al actualizar la pregunta");
      }
    } else {
      const res = await createQuestion(assemblyId, questionToSave);
      if (res.success) {
        toast.success("Pregunta creada");
        setShowAddQuestion(false);
        setNewQuestion({
          title: "",
          type: QUESTION_TYPES.UNIQUE,
          minimumVotes: 1,
          options: ["", ""],
        });
      } else {
        toast.error("Error al crear la pregunta");
      }
    }
  };

  const handleEditQuestion = (q) => {
    setNewQuestion({
      title: q.title,
      type: q.type,
      minimumVotes: q.minimumVotes || 1,
      options: q.options || ["", ""],
    });
    setEditingQuestionId(q.id);
    setShowAddQuestion(true);
    // Scroll to form after it renders
    setTimeout(() => {
      const formElement = document.getElementById("add-question-form");
      if (formElement)
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const toggleQuestionStatus = async (qId, currentStatus) => {
    let nextStatus = currentStatus;
    if (currentStatus === QUESTION_STATUS.CREATED)
      nextStatus = QUESTION_STATUS.LIVE;
    else if (currentStatus === QUESTION_STATUS.LIVE)
      nextStatus = QUESTION_STATUS.FINISHED;
    else if (currentStatus === QUESTION_STATUS.FINISHED)
      nextStatus = QUESTION_STATUS.LIVE;

    const res = await updateQuestionStatus(qId, nextStatus);
    if (res.success) {
      toast.success(`Pregunta actualizada a ${nextStatus}`);
    }
  };

  const handleRestartAssembly = async () => {
    if (
      confirm(
        "¿Seguro que quieres volver a iniciar la asamblea? Esto reseteará la asistencia de todos.",
      )
    ) {
      if (entity?.assemblyRegistriesListId) {
        // Here we should reset the active list explicitly
        const listToReset = activeRegistriesListId;
        if (listToReset) {
          setLoading(true);
          const res = await resetAssemblyRegistries(listToReset);
          if (!res.success) {
            toast.error("Error al resetear registros");
            setLoading(false);
            return;
          }
        }
      }

      // Reset questions
      if (assembly?.questions && assembly.questions.length > 0) {
        await resetAllQuestionsAnswers(assembly.questions);
      }

      // Delete all active assembly users
      await deleteAllAssemblyUsers(assemblyId);

      // Delete ALL powers files from storage for this assembly
      // Structure: powers/{assemblyId}/{userDocument}/{fileName}
      try {
        const powersRootRef = ref(storage, `powers/${assemblyId}`);
        const powersRootList = await listAll(powersRootRef);

        // 1. Iterate over user folders (prefixes)
        const deletePromises = powersRootList.prefixes.map(
          async (userFolderRef) => {
            // 2. List files in each user folder
            const userFilesList = await listAll(userFolderRef);
            // 3. Delete all files
            return Promise.all(
              userFilesList.items.map((fileRef) => deleteObject(fileRef)),
            );
          },
        );

        await Promise.all(deletePromises);
      } catch (err) {
        // If folder does not exist or other error, just log and continue
        console.warn("Error cleaning up storage (powers):", err);
      }

      await updateStatus("create");
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus, skipSuccessModal = false) => {
    try {
      if (newStatus === "finished") {
        if (assembly?.questions && assembly.questions.length > 0) {
          await finishAllLiveQuestions(assembly.questions);
        }
      }
      const res = await updateAssembly(assemblyId, { status: newStatus });
      if (res.success) {
        if (!skipSuccessModal) {
          if (newStatus === "registries_finalized") {
            setModalConfig({
              isOpen: true,
              type: "success",
              title: "Registros finalizados",
              description:
                "Has finalizado correctamente el registro de los asambleístas. A partir de ahora no se podrá eliminar o agregar nuevos registros.",
              confirmText: "Gestionar asamblea",
              onConfirm: () =>
                setModalConfig({ ...modalConfig, isOpen: false }),
            });
          } else if (newStatus === "started") {
            // Check if it was a re-open or a first start
            const isFirstStart = assembly?.status === "create";
            setModalConfig({
              isOpen: true,
              type: "success",
              title: isFirstStart ? "Asamblea iniciada" : "Registro reabierto",
              description: isFirstStart
                ? "Has iniciado correctamente la asamblea. A partir de ahora, los asambleístas podrán participar y votar."
                : "Has reabierto correctamente el registro de los asambleístas. A partir de ahora podrá eliminar o agregar nuevos registros.",
              confirmText: isFirstStart ? "Gestionar asamblea" : "Ver asamblea",
              onConfirm: () =>
                setModalConfig({ ...modalConfig, isOpen: false }),
            });
          } else if (newStatus === "finished") {
            setModalConfig({
              isOpen: true,
              type: "success",
              title: "Asamblea finalizada",
              description:
                "Has finalizado correctamente la asamblea. A partir de ahora, no se podrán realizar más cambios.",
              confirmText: "Ver asamblea",
              onConfirm: () =>
                setModalConfig({ ...modalConfig, isOpen: false }),
            });
          }
        } else {
          toast.success(`Estado actualizado a: ${newStatus}`);
        }
      }
    } catch (error) {
      toast.error("Error actualizando estado");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const handleToggleVoteBlock = async (registryId, currentBlocked) => {
    const res = await toggleVoteBlock(
      activeRegistriesListId,
      registryId,
      !currentBlocked,
    );
    if (res.success) {
      toast.success(currentBlocked ? "Voto habilitado" : "Voto bloqueado");
    } else {
      toast.error("Error al actualizar estado");
    }
  };

  const handleToggleDelete = async (registryId, currentDeleted) => {
    if (
      !currentDeleted &&
      !confirm(
        "¿Estás seguro de mover este registro a eliminados? No se eliminará permanentemente pero no podrá registrarse.",
      )
    )
      return;

    const registry = registries.find((r) => r.id === registryId);
    if (!currentDeleted && registry) {
      // If deleting, also remove from active users collection
      // Document to match is registry.userDocument or registry.documento (whichever was used for login)
      const docToDelete = registry.userDocument || registry.documento;
      if (docToDelete) {
        await deleteAssemblyUser(docToDelete, assemblyId);
      }
    }

    const res = await toggleRegistryDeletion(
      activeRegistriesListId,
      registryId,
      !currentDeleted,
    );
    if (res.success) {
      toast.success(
        currentDeleted ? "Registro restaurado" : "Registro movido a eliminados",
      );
    } else {
      toast.error("Error al actualizar estado");
    }
  };

  const handleAddRegistry = async (data) => {
    // Check if property name already exists
    const exists = registries.find(
      (r) =>
        r.propiedad?.toLowerCase() === data.propiedad?.toLowerCase() &&
        !r.isDeleted,
    );
    if (exists) {
      return toast.error("Esa propiedad ya existe en la base de datos.");
    }

    // Validate Coeficiente Sum
    const currentTotal = registries.reduce(
      (acc, r) =>
        acc + parseFloat(String(r.coeficiente || 0).replace(",", ".")),
      0,
    );
    const newCoef = parseFloat(String(data.coeficiente || 0).replace(",", "."));
    const finalTotal = currentTotal + newCoef;

    setLoading(true);
    const res = await addRegistryToList(activeRegistriesListId, data);
    if (res.success) {
      toast.success("Asambleísta añadido correctamente");
    } else {
      toast.error("Error al añadir asambleísta");
    }
    setLoading(false);
  };

  const exportToExcel = async () => {
    // 1. Fetch User Timestamps (active users)
    let userTimestamps = {};
    try {
      const qUsers = query(
        collection(db, "usersAssemblyActive"),
        where("assemblyId", "==", assemblyId),
      );
      const querySnapshot = await getDocs(qUsers);
      querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        // Map by document (since registries use document/userDocument)
        // Ideally map by 'document' key in usersAssemblyActive
        if (d.document && d.createdAt) {
          userTimestamps[d.document] = d.createdAt;
        }
      });
    } catch (err) {
      console.error("Error fetching user timestamps", err);
      toast.error("Error obteniendo fechas de registro");
    }

    const parseCoef = (val) =>
      parseFloat(String(val || 0).replace(",", ".")) || 0;

    const workbook = XLSX.utils.book_new();

    // --- SHEET 1: INFORMACION GENERAL ---
    const generalData = [];

    // Header Block
    generalData.push([(assembly?.name || "").toUpperCase()]);
    // Date Formatting
    const dateObj = new Date(assembly?.date || Date.now());
    const dateStr = dateObj.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    generalData.push([`Asamblea ${dateStr}`]);
    generalData.push([]);
    generalData.push([]);
    generalData.push(["Registros"]);

    // Table Headers
    const headers = [
      "Fecha/Hora",
      "Seleccione su apartamento",
      "Coeficiente",
      "Nombre Registrado",
      "Correo/Teléfono",
      "Documento Registrado",
      "Apoderado",
    ];
    generalData.push(headers);

    // Filter AND Sort registries
    // ACTIVE USERS ONLY: filter by registerInAssembly === true
    const activeRegistries = registries.filter((r) => r.registerInAssembly);

    const sortedRegistries = [...activeRegistries].sort((a, b) => {
      const valA = a.propiedad || "";
      const valB = b.propiedad || "";
      return valA.localeCompare(valB, undefined, { numeric: true });
    });

    sortedRegistries.forEach((reg) => {
      let dateVal = "";
      // Use createdAt from usersAssemblyActive map if available, matched by userDocument (the human who registered)
      // If userDocument is empty (older data?), fallback to document property or skip
      const userDoc = reg.userDocument || reg.documento;
      if (userDoc && userTimestamps[userDoc]) {
        const ts = userTimestamps[userDoc];
        try {
          if (ts.seconds) {
            dateVal = new Date(ts.seconds * 1000).toLocaleString("es-CO");
          } else if (typeof ts === "string") {
            // ISO string?
            dateVal = new Date(ts).toLocaleString("es-CO");
          }
        } catch (e) {
          dateVal = "";
        }
      } else {
        // Fallback to internal registry timestamp if map failed
        if (reg.registeredAt) {
          try {
            if (reg.registeredAt.seconds) {
              dateVal = new Date(
                reg.registeredAt.seconds * 1000,
              ).toLocaleString("es-CO");
            } else if (typeof reg.registeredAt === "string") {
              dateVal = reg.registeredAt;
            }
          } catch (e) {
            dateVal = "";
          }
        }
      }

      const unit = reg.propiedad || "";
      const coef = reg.coeficiente || "0";

      const fullName =
        reg.firstName || reg.lastName
          ? `${reg.firstName || ""} ${reg.lastName || ""}`.trim()
          : "";

      const docVal = reg.userDocument || reg.documento || "";
      const contactVal = reg.email || reg.phone || reg.phoneNumber || "";

      let apoderadoVal = "";
      if (reg.registerInAssembly) {
        if (reg.role === "proxy") apoderadoVal = "Poder";
        else apoderadoVal = "Propietario";
      }

      generalData.push([
        dateVal,
        unit,
        coef,
        fullName,
        contactVal,
        docVal,
        apoderadoVal,
      ]);
    });

    const wsGeneral = XLSX.utils.aoa_to_sheet(generalData);
    XLSX.utils.book_append_sheet(workbook, wsGeneral, "Informacion General");

    // --- SHEETS PER QUESTION ---
    if (questions && questions.length > 0) {
      // Sort questions by logic? Or keep index order.
      questions.forEach((q, idx) => {
        const qData = [];
        // Header for Question Sheet
        qData.push([q.title]);
        qData.push([]);

        // Stats
        const answers = q.answers || {};
        const votersIds = Object.keys(answers);
        const totalVotes = votersIds.length;

        const totalCoef = registries.reduce(
          (acc, r) => acc + parseCoef(r.coeficiente),
          0,
        );
        const votedCoef = votersIds.reduce((acc, regId) => {
          const r = registries.find((x) => x.id === regId);
          return acc + parseCoef(r?.coeficiente);
        }, 0);

        // Options Table
        qData.push(["opcion", "votos", "porcentaje"]);

        (q.options || []).forEach((opt) => {
          const votesForOpt = Object.entries(answers).filter(([_, ans]) => {
            if (ans.option === opt) return true;
            if (Array.isArray(ans.options) && ans.options.includes(opt))
              return true;
            return false;
          });

          const count = votesForOpt.length;
          const optCoef = votesForOpt.reduce((acc, [regId]) => {
            const r = registries.find((x) => x.id === regId);
            return acc + parseCoef(r?.coeficiente);
          }, 0);

          const pctTotal = totalCoef > 0 ? (optCoef / totalCoef) * 100 : 0;

          qData.push([opt, count, `${pctTotal.toFixed(2)}%`]);
        });

        // Open Answers
        if (q.type === QUESTION_TYPES.OPEN) {
          qData.push([]);
          qData.push(["Respuestas de texto:"]);
          Object.values(answers).forEach((a) => {
            if (a.answerText) qData.push([a.answerText]);
          });
        }

        qData.push([]); // Spacer

        // Detailed Votes for this Question
        qData.push(["Registros"]);
        qData.push([
          "Fecha/Hora",
          "Seleccione su apartamento",
          "Nombre Registrado",
          "Documento Registrado",
          "Respuesta",
        ]);

        const voterIds = Object.keys(answers);
        const votersData = voterIds
          .map((regId) => {
            const reg = registries.find((r) => r.id === regId);
            return { regId, reg, answer: answers[regId] };
          })
          .sort((a, b) => {
            const pA = a.reg?.propiedad || "";
            const pB = b.reg?.propiedad || "";
            return pA.localeCompare(pB, undefined, { numeric: true });
          });

        votersData.forEach(({ reg, answer }) => {
          if (!reg) return;

          let voteTime = "";
          if (answer.votedAt) {
            // Use Date from votedAt
            voteTime = new Date(answer.votedAt).toLocaleString("es-CO");
          }

          let answerText = "";
          if (answer.option) answerText = answer.option;
          else if (Array.isArray(answer.options))
            answerText = answer.options.join(", ");
          else if (answer.answerText) answerText = answer.answerText;

          const unit = reg.propiedad || "";
          const fullName =
            reg.firstName || reg.lastName
              ? `${reg.firstName || ""} ${reg.lastName || ""}`.trim()
              : "";
          const docVal = reg.userDocument || "";

          qData.push([voteTime, unit, fullName, docVal, answerText]);
        });

        const wsQ = XLSX.utils.aoa_to_sheet(qData);
        XLSX.utils.book_append_sheet(workbook, wsQ, `Pregunta ${idx + 1}`);
      });
    }

    const fileName = `Resultados_Asamblea_${assembly?.name || "Reporte"}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-gen");
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `assembly_qr_${assembly.name}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const downloadAllPowers = async () => {
    const toastId = toast.loading("Buscando poderes en el servidor...");
    try {
      const powersRootRef = ref(storage, `powers/${assemblyId}`);
      const folders = await listAll(powersRootRef);

      if (folders.prefixes.length === 0) {
        toast.update(toastId, {
          render: "No se encontraron carpetas de poderes para esta asamblea.",
          type: "info",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      toast.update(toastId, {
        render: "Iniciando descarga masiva...",
        type: "info",
        isLoading: true,
      });

      let totalDownloaded = 0;

      for (const propertyFolder of folders.prefixes) {
        const propertyName = propertyFolder.name; // Numero de propiedad
        const filesList = await listAll(propertyFolder);

        for (const fileRef of filesList.items) {
          try {
            const url = await getDownloadURL(fileRef);
            let response;
            try {
              response = await fetch(url);
              if (!response.ok) throw new Error("Network response was not ok");
            } catch (fetchErr) {
              console.warn(
                `Fetch failed for ${propertyName}, falling back to direct link:`,
                fetchErr,
              );
              // Fallback: Just open the URL or trigger a cross-origin download (browser might not rename)
              const link = document.createElement("a");
              link.href = url;
              link.target = "_blank";
              link.download = `${propertyName}_${fileRef.name}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              totalDownloaded++;
              await new Promise((r) => setTimeout(r, 800));
              continue;
            }
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;

            // Name file as: Propiedad_OriginalName
            link.download = `${propertyName}_${fileRef.name}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            totalDownloaded++;
            // Small delay to avoid browser congestion
            await new Promise((r) => setTimeout(r, 800));
          } catch (err) {
            console.error(`Error descargando poder de ${propertyName}:`, err);
          }
        }
      }

      toast.update(toastId, {
        render: `Descarga finalizada. Se bajaron ${totalDownloaded} archivos.`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error en downloadAllPowers:", error);
      toast.update(toastId, {
        render: "Error al acceder al almacenamiento de poderes.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const exportGeneralReportToPDF = async () => {
    await exportToExcel();
  };

  const exportAllVotesToPDF = async () => {
    if (!questions || questions.length === 0) {
      return toast.info("No hay preguntas para exportar.");
    }

    const html2pdf = (await import("html2pdf.js")).default;
    const toastId = toast.loading("Generando PDF...");

    const parseCoef = (val) =>
      parseFloat(String(val || 0).replace(",", ".")) || 0;

    const dateObj = new Date(assembly?.date || Date.now());
    const dateStr = dateObj.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const contentHtml = `
      <div style="font-family: 'Manrope', sans-serif; padding: 40px; color: #333; background: #fff; width: 100%;">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap');
          .pdf-container { position: relative; }
          .header-grid { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
          .logo { height: 50px; object-fit: contain; }
          
          .header-info { text-align: right; }
          .header-title { color: #0E3C42; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; margin: 0; }
          .header-date { color: #555; font-size: 14px; margin: 5px 0; font-weight: 500; }
          
          .question-section { margin-top: 40px; page-break-inside: avoid; }
          .question-header { text-align: center; margin-bottom: 20px; }
          .question-title { font-size: 20px; font-weight: 800; color: #0E3C42; margin-bottom: 5px; }
          .question-status { font-size: 14px; font-weight: 800; color: #FF4D4D; text-transform: uppercase; letter-spacing: 1px; }

          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th { background-color: #F8F9FA; color: #5F6D7E; font-weight: 800; text-transform: uppercase; padding: 12px 10px; text-align: left; border-bottom: 2px solid #EAECEF; letter-spacing: 0.5px; }
          td { padding: 12px 10px; border-bottom: 1px solid #EAECEF; color: #2C3E50; font-weight: 500; vertical-align: middle; }
          
          .prop-cell { font-weight: 800; color: #0E3C42; font-size: 12px; }
          .resp-cell { font-weight: 700; color: #4059FF; }
          .badge-si { background: #E6FFF2; color: #00A86B; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 10px; }
          .badge-no { background: #FFF0F0; color: #E02424; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 10px; }
          
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #A0AEC0; padding-top: 20px; border-top: 1px solid #eee; }
        </style>

        <div class="pdf-container">
          <div class="header-grid">
            <img src="/logos/intuapp.png" class="logo" alt="Logo" />
            <div class="header-info">
              <h1 class="header-title">${assembly?.name}</h1>
              <h2 class="header-date">Asamblea ${dateStr}</h2>
            </div>
          </div>

          ${questions
            .map((q) => {
              const answers = q.answers || {};
              const voterIds = Object.keys(answers);

              if (voterIds.length === 0) return "";

              const votesData = voterIds
                .map((regId) => {
                  const reg = registries.find((r) => r.id === regId);
                  const ans = answers[regId];
                  if (!reg) return null;

                  let respuesta = "";
                  if (ans.option) respuesta = ans.option;
                  else if (Array.isArray(ans.options))
                    respuesta = ans.options.join(", ");
                  else if (ans.answerText) respuesta = ans.answerText;

                  return {
                    votedAt: ans.votedAt
                      ? new Date(ans.votedAt).toLocaleString("es-CO", {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })
                      : "-",
                    propiedad: reg.propiedad || "-",
                    coeficiente: parseCoef(reg.coeficiente).toFixed(4),
                    nombre:
                      `${reg.firstName || ""} ${reg.lastName || ""}`.trim() ||
                      "-",
                    apoderado: reg.role === "proxy",
                    respuesta: respuesta,
                  };
                })
                .filter((v) => v !== null)
                .sort((a, b) =>
                  a.propiedad.localeCompare(b.propiedad, undefined, {
                    numeric: true,
                  }),
                );

              return `
                <div class="question-section">
                  <div class="question-header">
                    <div class="question-title">${q.title}</div>
                    <div class="question-status">Asamblea Finalizada</div>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th style="width: 15%">Fecha/Hora</th>
                        <th style="width: 10%">Apto</th>
                        <th style="width: 15%">Coeficiente</th>
                        <th style="width: 25%">Nombre Registrado</th>
                        <th style="width: 10%">Apoderado</th>
                        <th style="width: 25%">Respuesta</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${votesData
                        .map(
                          (v) => `
                        <tr>
                          <td>${v.votedAt}</td>
                          <td class="prop-cell">${v.propiedad}</td>
                          <td>${v.coeficiente}</td>
                          <td>${v.nombre}</td>
                          <td>${v.apoderado ? '<span class="badge-si">Poder</span>' : '<span class="badge-no">N/A</span>'}</td>
                          <td class="resp-cell">${v.respuesta}</td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `;
            })
            .join("")}

          <div class="footer">
            Generado por IntuApp - Plataforma de Gestión de Asambleas
          </div>
        </div>
      </div>
    `;

    const element = document.createElement("div");
    element.innerHTML = contentHtml;
    document.body.appendChild(element);

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Reporte_Votaciones_${assembly?.name || "Asamblea"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        document.body.removeChild(element);
        toast.update(toastId, {
          render: "PDF descargado correctamente",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((err) => {
        console.error("PDF Export Error:", err);
        document.body.removeChild(element);
        toast.update(toastId, {
          render: "Error al generar PDF",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader />
      </div>
    );
  }

  if (!assembly || !entity) return null;

  return (
    <div className="max-w-[1128px] w-full h-full flex flex-col gap-8">
      <ExportAssemblyModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportReport={exportGeneralReportToPDF}
        onExportVotes={exportAllVotesToPDF}
        onExportPowers={downloadAllPowers}
        assemblyType={assembly.type}
      />
      <div className=" flex flex-col items-start gap-2">
        <div className="w-full flex justify-between items-center">
          <CustomText
            variant="TitleL"
            as="h3"
            className="font-bold text-[#0E3C42]"
          >
            {assembly.name}
          </CustomText>
          {assembly.status === "finished" ? (
            <CustomButton
              variant="primary"
              onClick={() => setIsExportModalOpen(true)}
              className="px-5 py-3 flex items-center gap-2"
            >
              <CustomIcon path={ICON_PATHS.fileSave} size={24} />
              <CustomText variant="labelL" className="font-bold text-[#0E3C42]">
                Exportar
              </CustomText>
            </CustomButton>
          ) : (
            <CustomButton
              variant="primary"
              onClick={() =>
                router.push(
                  `/operario/${entityId}/gestionar-asamblea?assemblyId=${assemblyId}`,
                )
              }
              className="px-5 py-3 flex items-center gap-2"
            >
              <CustomIcon path={ICON_PATHS.pencil} size={24} />
              <CustomText variant="labelL" className="font-bold text-[#0E3C42]">
                Editar configuración
              </CustomText>
            </CustomButton>
          )}
        </div>
        <div className="w-full flex items-center gap-4">
          <CustomText
            variant="bodyX"
            as="h5"
            className="font-medium text-[#0E3C42]"
          >
            {entity.name}
          </CustomText>
          <div className="flex flex-row items-center gap-2 bg-[#FFFFFF] px-2 py-1 rounded-lg">
            <CustomIcon path={ICON_PATHS.calendar} size={16} />
            <CustomText variant="labelM" className="font-medium text-[#00093F]">
              {assembly.date} - {assembly.hour}
            </CustomText>
          </div>
          <CustomTypeAssembly type={assembly.type} />
          <CustomStates
            status={assembly.status}
            className="px-3 py-1 rounded-full"
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-row gap-8">
          <div className="max-w-[365px] w-full flex flex-col gap-2 p-4 gap-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <CustomText
              variant="bodyL"
              as="h6"
              className="font-bold text-[#0E3C42]"
            >
              Acceso a Asambleistas
            </CustomText>
            <div className="relative flex items-center justify-between gap-2 border border-[#94A2FF] rounded-lg px-3 py-2 w-full">
              <CustomText
                variant="labelM"
                className="font-medium text-[#3D3D44] truncate max-w-[200px]"
              >
                {publicUrl}
              </CustomText>

              <CustomButton
                onClick={() => copyToClipboard(publicUrl)}
                className="shrink-0 bg-transparent border-none hover:bg-transparent hover:border-none"
              >
                <CustomIcon path={ICON_PATHS.copy} size={14} />
              </CustomButton>
            </div>
            <div className="flex items-center gap-2">
              <CustomButton
                variant="secondary"
                onClick={() => setIsQrModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-2"
              >
                <CustomIcon path={ICON_PATHS.qr} size={16} />
                <CustomText variant="labelM" className="font-bold">
                  Ver QR
                </CustomText>
              </CustomButton>
              <CustomButton
                variant="primary"
                onClick={() => downloadPdf()}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-2"
              >
                <CustomIcon path={ICON_PATHS.download} size={16} />
                <CustomText variant="labelM" className="font-bold">
                  Descargar QR
                </CustomText>
              </CustomButton>
            </div>
          </div>
          <div>
            <div className="max-w-[365px] max-h-[208px] h-full w-full flex flex-col justify-between gap-2 p-4 gap-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <CustomText
                variant="bodyL"
                as="h5"
                className="text-[#0E3C42] max-w-[280px] font-bold"
              >
                Acceso al administrador o funcionario
              </CustomText>

              <CustomText
                variant="labelL"
                className="text-[#0E3C42] font-medium"
              >
                Aquí podrá ver la asistencia en tiempo real.
              </CustomText>
              <div className="relative flex items-center justify-between gap-2 border border-[#94A2FF] rounded-lg px-3 py-2 w-full">
                <CustomText
                  variant="labelM"
                  className="font-medium text-[#3D3D44] truncate max-w-[200px]"
                >
                  {`${publicUrl}/funcionario`}
                </CustomText>

                <CustomButton
                  onClick={() => copyToClipboard(`${publicUrl}/funcionario`)}
                  className="shrink-0 bg-transparent border-none hover:bg-transparent hover:border-none"
                >
                  <CustomIcon path={ICON_PATHS.copy} size={14} />
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
        {assembly.status != "finished" && (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white rounded-2xl">
            <CustomButton
              className="w-full bg-[#DAF0DC] border border-[#DAF0DC]
                        hover:bg-[#BFE6C4] hover:border-[#BFE6C4]
                        transition-colors duration-200
                        py-3 px-5 flex items-center justify-center gap-2
                        disabled:hover:bg-[#DAF0DC]"
              disabled={assembly.status !== "create"}
              onClick={() => {
                setModalConfig({
                  isOpen: true,
                  type: "confirm",
                  title: "¿Iniciar asamblea?",
                  description:
                    "¿Estás seguro de que deseas iniciar la asamblea? Una vez iniciada, los asambleístas podrán ingresar y participar.",
                  confirmText: "Si, iniciar",
                  onConfirm: () => {
                    setModalConfig({ ...modalConfig, isOpen: false });
                    updateStatus("started");
                  },
                });
              }}
            >
              <CustomIcon path={ICON_PATHS.playArrow} size={20} />
              <CustomText variant="labelL" className="font-bold">
                {assembly.status === "create"
                  ? "Iniciar asamblea"
                  : "Asamblea iniciada"}
              </CustomText>
            </CustomButton>
            <CustomButton
              className="w-full bg-[#FFEDDD] border border-[#FFEDDD]
                        hover:bg-[#FFD7BB] hover:border-[#FFD7BB]
                        transition-colors duration-200
                        py-3 px-5 flex items-center justify-center gap-2
                        disabled:hover:bg-[#FFEDDD]"
              disabled={
                assembly.status === "finished" || assembly.status === "create"
              }
              onClick={() => {
                if (assembly.status === "registries_finalized") {
                  setModalConfig({
                    isOpen: true,
                    type: "confirm",
                    title: "¿Reabrir registros?",
                    description:
                      "¿Estás seguro de que deseas reabrir el registro de los asambleístas? Una vez reabierto, se podrá eliminar o agregar nuevos registros.",
                    confirmText: "Si, reabrir",
                    onConfirm: () => {
                      setModalConfig({ ...modalConfig, isOpen: false });
                      updateStatus("started");
                    },
                  });
                } else {
                  setModalConfig({
                    isOpen: true,
                    type: "confirm",
                    title: "¿Finalizar el registro?",
                    description:
                      "¿Estás seguro de que deseas finalizar el registro de los asambleístas? Una vez cerrado, no se podrá eliminar o agregar nuevos registros.",
                    confirmText: "Si, finalizar",
                    onConfirm: () => {
                      setModalConfig({ ...modalConfig, isOpen: false });
                      updateStatus("registries_finalized");
                    },
                  });
                }
              }}
            >
              {assembly.status === "registries_finalized" ? (
                <CustomIcon path={ICON_PATHS.editSquare} size={20} />
              ) : (
                <CustomIcon path={ICON_PATHS.wavingHand} size={20} />
              )}
              <CustomText variant="labelL" className="font-bold">
                {assembly.status === "registries_finalized"
                  ? "Reabrir registros"
                  : "Finalizar registros"}
              </CustomText>
            </CustomButton>
            <CustomButton
              className="w-full bg-[#FACCCD] border border-[#FACCCD]
                        hover:bg-[#F7AEB0] hover:border-[#F7AEB0]
                        transition-colors duration-200
                        py-3 px-5 flex items-center justify-center gap-2
                        disabled:hover:bg-[#FACCCD]"
              disabled={assembly.status === "create"}
              onClick={() => {
                setModalConfig({
                  isOpen: true,
                  type: "confirm",
                  title: "¿Finalizar asamblea?",
                  description:
                    "¿Estás seguro de que deseas finalizar la asamblea? Una vez finalizada, no se podrá editar o iniciar nuevamente la asamblea.",
                  confirmText: "Si, finalizar",
                  onConfirm: () => {
                    setModalConfig({ ...modalConfig, isOpen: false });
                    updateStatus("finished");
                  },
                });
              }}
            >
              <CustomIcon path={ICON_PATHS.stop_circle} size={20} />
              <CustomText variant="labelL" className="font-bold">
                Finalizar asamblea
              </CustomText>
            </CustomButton>
          </div>
        )}

        <div className="w-full flex flex-row gap-6">
          <div className="max-w-[552px] w-full bg-[#FFFFFF] rounded-3xl p-6 gap-6 border border-[#F3F6F9] flex flex-col shadow-soft">
            <div className="flex justify-between items-start mb-4">
              <CustomText
                variant="bodyX"
                as="h5"
                className="font-bold text-[#0E3C42]"
              >
                Quórum
              </CustomText>
              <CustomIcon path={ICON_PATHS.error} size={24} />
            </div>
            <div className="flex flex-col items-center justify-center flex-1 relative py-2">
              <Quorum percentage={quorum} />
            </div>
          </div>

          <div className="max-w-[552px] w-full bg-[#FFFFFF] rounded-3xl p-6 gap-6 border border-[#F3F6F9] flex flex-col shadow-soft">
            <CustomText
              variant="bodyX"
              as="h5"
              className="font-bold text-[#0E3C42]"
            >
              Asambleístas
            </CustomText>
            <AssemblyStatsBoxes
              registeredCount={registeredCount}
              totalCount={registries.length}
              blockedCount={blockedCount}
            />
          </div>
        </div>

        <div className="w-full bg-[#FFFFFF] rounded-full p-2 border border-[#F3F6F9] flex flex-row gap-2">
          <CustomButton
            onClick={() => setMainTab("Asambleistas")}
            className={`flex-1 py-3 ${mainTab === "Asambleistas" ? "bg-[#D5DAFF] border-none " : "bg-white border-none"}`}
          >
            <CustomText variant="labelL" className="text-[#000000] font-bold">
              Gestionar asambleístas
            </CustomText>
          </CustomButton>
          <CustomButton
            onClick={() => setMainTab("Votaciones")}
            className={`flex-1 py-3 ${mainTab === "Votaciones" ? "bg-[#D5DAFF] border-none " : "bg-white border-none"}`}
          >
            <CustomText variant="labelL" className="text-[#000000] font-bold">
              Gestionar votaciones
            </CustomText>
          </CustomButton>
        </div>
        {mainTab === "Asambleistas" ? (
          <>
            <AttendanceTable
              registries={registries}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              assemblyType={assembly.type}
              onAction={(item, type) => {
                if (type === "delete") handleToggleDelete(item.id, false);
                else handleToggleDelete(item.id, true);
              }}
              onAddRegistry={handleAddRegistry}
              assembyStatus={assembly.status}
            />

            <VoteRestrictionSection
              isInAssemblyInfo={true}
              registries={registries}
              blockedVoters={blockedVoters}
              onToggleVote={handleToggleVoteBlock}
              assembyStatus={assembly.status}
            />
          </>
        ) : (
          /* VOTACIONES VIEW */
          <QuestionsSection
            assembyStatus={assembly.status}
            questions={questions}
            registries={registries}
            showAddQuestion={showAddQuestion}
            setShowAddQuestion={setShowAddQuestion}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
            editingQuestionId={editingQuestionId}
            setEditingQuestionId={setEditingQuestionId}
            QUESTION_TYPES={QUESTION_TYPES}
            handleAddQuestion={handleAddQuestion}
            handleEditQuestion={handleEditQuestion}
            toggleQuestionStatus={toggleQuestionStatus}
            updateQuestionStatus={updateQuestionStatus}
            QUESTION_STATUS={QUESTION_STATUS}
            setViewingVotersFor={setViewingVotersFor}
          />
        )}
      </div>

      {/* QR MODAL */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-10 max-w-sm w-full relative animate-in zoom-in duration-300">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-full transition"
            >
              <X size={20} />
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-black text-[#0E3C42] mb-2">
                Código QR
              </h3>
              <p className="text-gray-400 text-sm mb-8">
                Escanea para acceder a la asamblea
              </p>

              <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-gray-100 inline-block mb-8">
                <QRCodeCanvas
                  value={publicUrl}
                  size={200}
                  level={"H"}
                  includeMargin={true}
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={downloadQR}
                  className="bg-[#8B9DFF] text-white font-bold py-4 rounded-2xl hover:bg-[#7a8ce0] transition flex items-center justify-center gap-2"
                >
                  <Download size={20} /> Descargar Imagen
                </button>
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="text-gray-400 font-bold py-2 text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* VOTERS MODAL */}
      {viewingVotersFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-4xl w-full max-h-[90vh] flex flex-col relative animate-in zoom-in duration-300 shadow-2xl">
            <button
              onClick={() => setViewingVotersFor(null)}
              className="absolute top-6 right-6 text-gray-300 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <h3 className="text-[32px] font-bold text-[#0E3C42] mb-4">
                Votantes
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Aquí puedes ver el listado de los asambleístas que votaron en la
                pregunta:{" "}
                <span className="font-bold text-[#0E3C42]">
                  ¿{viewingVotersFor.title}?
                </span>
              </p>

              {/* Modal Search */}
              <div className="relative mb-6">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Busca por grupo, # de unidad privada, documento o nombre"
                  className="w-full border border-gray-100 rounded-[15px] py-3.5 pl-12 pr-4 text-sm text-[#0E3C42] bg-[#F9FAFB] outline-none focus:ring-2 ring-indigo-50 transition-all font-bold"
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1F6B6C] text-white flex items-center justify-center font-bold text-xs shadow-md">
                  C
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-gray-400">
                  Total de asambleístas que votaron:
                </span>
                <span className="bg-[#ABE7E5] text-[#0E3C42] px-3 py-0.5 rounded-full text-xs font-black">
                  {Object.keys(viewingVotersFor.answers || {}).length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-gray-100 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-gray-100 text-sm font-bold text-[#0E3C42]">
                    <th className="py-4 px-6 text-center">Tipo</th>
                    <th className="py-4 px-6 text-center">Grupo</th>
                    <th className="py-4 px-6 text-center"># propiedad</th>
                    <th className="py-4 px-6 text-center">Coeficiente</th>
                    <th className="py-4 px-6 text-center">Documento</th>
                    <th className="py-4 px-6 text-center">Respuesta</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50 text-[13px] font-bold text-[#838383]">
                  {Object.entries(viewingVotersFor.answers || {})
                    .filter(([regId, answer]) => {
                      const reg = registries.find((r) => r.id === regId);
                      const search = modalSearchTerm.toLowerCase();
                      if (!search) return true;
                      return (
                        reg?.propiedad?.toLowerCase().includes(search) ||
                        reg?.documento?.toLowerCase().includes(search) ||
                        reg?.grupo?.toLowerCase().includes(search) ||
                        answer.option?.toLowerCase().includes(search) ||
                        answer.options?.some((o) =>
                          o.toLowerCase().includes(search),
                        )
                      );
                    })
                    .map(([regId, answer]) => {
                      const reg = registries.find((r) => r.id === regId);
                      return (
                        <tr key={regId} className="hover:bg-gray-50 transition">
                          <td className="py-4 px-6 text-center">
                            {reg?.tipo || "—"}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {reg?.grupo || "—"}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {reg?.propiedad || "—"}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {reg?.coeficiente || "0"}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {reg?.documento || "—"}
                          </td>
                          <td className="py-4 px-6 text-center text-[#8B9FFD]">
                            {answer.option ||
                              answer.options?.join(", ") ||
                              (answer.answerText ? "Resp. Abierta" : "—")}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setViewingVotersFor(null)}
                className="w-full py-4 rounded-2xl bg-[#94A2FF] text-black font-bold text-lg hover:bg-[#7a8ce0] transition shadow-md"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ACTION MODALS */}
      <CustomModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        type={modalConfig.type}
      />
    </div>
  );
};

export default AssemblyDashboardPage;
