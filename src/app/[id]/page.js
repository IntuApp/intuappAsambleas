"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { db, storage } from "@/lib/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  collection,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getEntityById } from "@/lib/entities";

import Loader from "@/components/basics/Loader";

import {
  Check,
  Building2,
  Video,
  ArrowLeft,
  Trash2,
  UploadCloud,
  FileText,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  QUESTION_STATUS,
  QUESTION_TYPES,
  submitVote,
  submitBatchVotes,
} from "@/lib/questions";

import Step1Document from "@/components/assemblyMember/step/Step1Document";
import Step2UserInfo from "@/components/assemblyMember/step/Step2UserInfo";
import Step3Properties from "@/components/assemblyMember/step/Step3Properties";
import Step4AddProperties from "@/components/assemblyMember/step/Step4AddProperties";
import Step5Review from "@/components/assemblyMember/step/Step5Review";
import Step6Condition from "@/components/assemblyMember/step/Step6Condition";
import StepDiscovery from "@/components/assemblyMember/step/StepDiscovery";
import QuestionItem from "@/components/dashboard/QuestionItem";
import AsambleistaDashboard from "@/components/assemblies/AsambleistaDashboard";
import { createAssemblyUser, getAssemblyUser } from "@/lib/assemblyUser";
import CustomButton from "@/components/basics/CustomButton";
import CustomText from "@/components/basics/CustomText";
import LoginMember from "@/components/assemblyMember/LoginMember";

const ProgressBar = ({ currentStep, totalSteps = 7 }) => (
  <div className="w-full h-2 bg-[#F3F6F9] rounded-full overflow-hidden">
    <div
      className="h-full bg-[#D5DAFF] transition-all duration-500 ease-out"
      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
    />
  </div>
);

export default function AssemblyAccessPage() {
  const { id } = useParams();
  const router = useRouter();

  // Basic State
  const [loading, setLoading] = useState(true);
  const [assembly, setAssembly] = useState(null);
  const [entity, setEntity] = useState(null);
  const [activeRegistriesListId, setActiveRegistriesListId] = useState(null);
  const [registries, setRegistries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [userVotingPreference, setUserVotingPreference] = useState(null);
  const [addNewProperties, setAddNewProperties] = useState(false);
  const [votes, setVotes] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]);

  const registeredOwnerIds = useMemo(() => {
    const ids = new Set();
    allRegistrations.forEach((reg) => {
      (reg.representedProperties || []).forEach((prop) => {
        if (prop.ownerId) ids.add(prop.ownerId);
      });
    });
    return ids;
  }, [allRegistrations]);

  // New Registration Wizard State Machine
  // 0: Search/Login
  // 1: User Info
  // 2: Discovery (List Found)
  // 3: Verification Loop (By Index)
  // 4: Ask "Add Another?"
  // 5: Manual Add Property Form
  // 6: Summary
  // 7: Terms
  const [prevStep, setPrevStep] = useState(0);
  const [regStep, setRegStep] = useState(0);

  // Data State
  const [regDocument, setRegDocument] = useState("");
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Queue for verifying properties found in step 1
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [currentVerificationIndex, setCurrentVerificationIndex] = useState(0);

  // Final List of verified properties to submit
  // Item: { registry, role, powerFile, powerUrl }
  const [verifiedRegistries, setVerifiedRegistries] = useState([]);

  // Temp State for Verification Loop
  const [currentRole, setCurrentRole] = useState(""); // "" | 'owner' | 'proxy'
  const [currentFile, setCurrentFile] = useState(null);

  // Temp State for "Add Another?" Step
  const [addAnotherDecision, setAddAnotherDecision] = useState(null); // 'yes' | 'no'

  // Temp State for "Add Property Form"
  const [addPropType, setAddPropType] = useState("");
  const [addPropGroup, setAddPropGroup] = useState("");
  const [addPropRegistry, setAddPropRegistry] = useState(null);
  const [addPropRole, setAddPropRole] = useState("");
  const [addPropFile, setAddPropFile] = useState(null);

  // Load User & Data
  // Load User & Data - REMOVED PERSISTENCE
  /* useEffect(() => {
    const savedUser = localStorage.getItem(`assemblyUser_${id}`);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, [id]); */

  // Check if user is blocked/deleted
  useEffect(() => {
    if (currentUser && registries.length > 0) {
      // Find my registries in the live list
      const myLiveRegistries = registries.filter(
        (r) =>
          currentUser.registries?.some((ur) => ur.registryId === r.id) ||
          (currentUser.registryId && r.id === currentUser.registryId),
      );

      // If I have registries but they are ALL deleted, kick me out.
      // Or if I have NO registries found (which shouldn't happen unless deleted entirely from DB)
      if (myLiveRegistries.length > 0) {
        const allDeleted = myLiveRegistries.every((r) => r.isDeleted);
        if (allDeleted) {
          toast.error("Has sido bloqueado de esta asamblea.");
          localStorage.removeItem(`assemblyUser_${id}`);
          setCurrentUser(null);
          setRegStep(0);
        }
      }
    }
  }, [registries, currentUser, id]);

  useEffect(() => {
    let unsubDetails = () => {};
    let unsubQuestions = () => {};
    let unsubRegs = () => {};

    const assemblyRef = doc(db, "assembly", id);
    const unsubAssembly = onSnapshot(assemblyRef, async (docSnap) => {
      if (docSnap.exists()) {
        const assemblyData = { id: docSnap.id, ...docSnap.data() };
        setAssembly(assemblyData);

        // Subscriptions related to assembly data
        if (assemblyData.registrationRecordId) {
          const regRef = doc(
            db,
            "assemblyRegistrations",
            assemblyData.registrationRecordId,
          );
          unsubRegs = onSnapshot(regRef, (regSnap) => {
            if (regSnap.exists()) {
              setAllRegistrations(regSnap.data().registrations || []);
            }
          });
        }

        // If assembly is back to create mode (restarted), kick users out
        if (assemblyData.status === "create" && currentUser) {
          toast.info("La asamblea ha sido reiniciada.");
          localStorage.removeItem(`assemblyUser_${id}`);
          window.location.reload();
        }

        if (assemblyData.entityId) {
          const resEntity = await getEntityById(assemblyData.entityId);
          if (resEntity.success) {
            setEntity(resEntity.data);

            const listId =
              assemblyData.assemblyRegistriesListId ||
              resEntity.data.assemblyRegistriesListId;
            setActiveRegistriesListId(listId);

            if (listId) {
              const listRef = doc(db, "assemblyRegistriesList", listId);
              unsubDetails = onSnapshot(listRef, (listSnap) => {
                if (listSnap.exists()) {
                  const regs = Object.entries(
                    listSnap.data().assemblyRegistries || {},
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

        // Questions
        const qRef = doc(db, "assemblyQuestions", id);
        unsubQuestions = onSnapshot(qRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const qList = (data.questions || []).filter(
              (q) =>
                !q.isDeleted &&
                (q.status === QUESTION_STATUS.LIVE ||
                  q.status === QUESTION_STATUS.FINISHED),
            );
            setQuestions(qList);
          } else {
            setQuestions([]);
          }
        });
      } else {
        toast.error("Asamblea no encontrada");
      }
      setLoading(false);
    });

    // Votes Subscription
    const vRef = doc(db, "assemblyVotes", id);
    const unsubVotes = onSnapshot(vRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setVotes(data.votes || []);
      } else {
        setVotes([]);
      }
    });

    return () => {
      unsubAssembly();
      unsubDetails();
      unsubQuestions();
      unsubVotes();
      unsubRegs();
    };
  }, [id, currentUser]);

  // Load User Voting Preference
  useEffect(() => {
    if (currentUser) {
      if (currentUser.votingPreference) {
        setUserVotingPreference(currentUser.votingPreference);
      } else {
        setUserVotingPreference(null);
      }
    }
  }, [currentUser]);

  /* --- HANDLERS --- */

  const persistVotingPreference = async (pref) => {
    setUserVotingPreference(pref);
    if (currentUser?.id) {
      try {
        const userRef = doc(db, "usersAssemblyActive", currentUser.id);
        await updateDoc(userRef, { votingPreference: pref });

        // Update local state
        setCurrentUser((prev) => ({ ...prev, votingPreference: pref }));
      } catch (error) {
        console.error("Error saving voting preference:", error);
        toast.error("Error guardando preferencia de voto");
      }
    }
  };

  const handleAccess = async (document) => {
    if (assembly.status === "create") {
      return toast.info("Podrá ingresar cuando la reunión esté en curso");
    }

    setLoading(true);

    try {
      // 1. Check if user exists in AssemblyUser (Already Registered)
      const res = await getAssemblyUser(document, id);
      if (res.success) {
        // User exists -> Login
        setCurrentUser(res.data);
        localStorage.setItem(`assemblyUser_${id}`, JSON.stringify(res.data));
        toast.success("Bienvenido");
        setLoading(false);
        return;
      }

      // 2. User does NOT exist.
      // Check if registration is closed (registries_finalized).
      if (assembly.status === "registries_finalized") {
        setLoading(false);
        return toast.error(
          "El registro ha finalizado. Solo pueden ingresar usuarios registrados.",
        );
      }

      // 3. User does NOT exist AND Registration is Open. -> START REGISTRATION FLOW.
      setRegDocument(document);

      // Find all registries matching document in the uploaded Excel list
      const found = registries.filter(
        (r) =>
          String(r.documento).trim().toLowerCase() ===
          document.trim().toLowerCase(),
      );

      // ACCESS METHOD: 'free_document' vs 'database_document'
      const accessMethod = assembly.accessMethod || "database_document";

      // 3a. Validation for 'database_document'
      if (accessMethod === "database_document") {
        if (found.length === 0) {
          setLoading(false);
          return toast.error("Documento no asociado a ninguna propiedad.");
        }
        // Blocked check
        if (found.every((r) => r.isDeleted)) {
          setLoading(false);
          return toast.error("Estas bloqueado de esta asamblea");
        }
      } else {
        // 'free_document' blocked check
        if (found.length > 0 && found.every((r) => r.isDeleted)) {
          setLoading(false);
          return toast.error("Estas bloqueado de esta asamblea");
        }
      }

      // 3b. Check if properties are ALREADY CLAIMED by someone else
      const alreadyRegisteredProps = found.filter((r) =>
        registeredOwnerIds.has(r.id),
      );

      if (alreadyRegisteredProps.length > 0) {
        setLoading(false);
        return toast.error(
          "Una o más propiedades de este documento ya fueron registradas por otro usuario. Comuníquese con soporte.",
        );
      }

      // 3c. Prepare Verification Queue (Unclaimed valid properties)
      // Exclude those already registered
      const availableToRegister = found.filter(
        (r) => !registeredOwnerIds.has(r.id) && !r.isDeleted,
      );

      // Double check for database_document: must have items
      if (
        accessMethod === "database_document" &&
        availableToRegister.length === 0
      ) {
        setLoading(false);
        // This usually falls into "alreadyRegisteredProps" check above, but logically ensures we don't proceed with empty queue
        return toast.error(
          "No hay propiedades disponibles para registrar con este documento.",
        );
      }

      setVerificationQueue(availableToRegister);
      setVerifiedRegistries([]);
      setCurrentVerificationIndex(0);

      // Pre-fill info if available
      if (availableToRegister[0]) {
        setUserInfo((prev) => ({
          ...prev,
          firstName:
            availableToRegister[0].firstName ||
            availableToRegister[0].nombre ||
            "",
          lastName:
            availableToRegister[0].lastName ||
            availableToRegister[0].apellido ||
            "",
          email: availableToRegister[0].email || "",
          phone: availableToRegister[0].celular || "",
        }));
      } else {
        setUserInfo({ firstName: "", lastName: "", email: "", phone: "" });
      }

      // Determine Next Step
      if (
        assembly.requireFullName ||
        assembly.requireEmail ||
        assembly.requirePhone
      ) {
        setRegStep(1); // User Info
      } else {
        if (availableToRegister.length === 0) {
          // Free document with no matching properties -> Manual Add
          setRegStep(5);
        } else {
          setCurrentRole("");
          setRegStep(2); // Discovery
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al verificar acceso");
    } finally {
      setLoading(false);
    }
  };

  // STEP 1 Handler (User Info Submit)
  const handleUserInfoSubmit = () => {
    if (assembly.requireFullName && (!userInfo.firstName || !userInfo.lastName))
      return toast.error("Nombre y apellido son requeridos");
    if (assembly.requireEmail && !userInfo.email)
      return toast.error("Email es requerido");
    if (assembly.requirePhone && !userInfo.phone)
      return toast.error("Teléfono es requerido");

    // If we have properties to verify, go to Discovery(2)
    // If not, it means we are in free_document mode and need to add manually(5)
    if (verificationQueue.length > 0) {
      setRegStep(2); // Go to Discovery
    } else {
      setAddNewProperties(true);
      setRegStep(5); // Go to Manual Add
    }
  };

  // STEP 2 -> 3 (Was 1 -> 2)
  const startVerificationLoop = () => {
    if (verificationQueue.length >= 2) {
      // Auto-verify all as owner
      const items = verificationQueue.map((reg) => ({
        registry: reg,
        role: "owner",
        powerFile: null,
        isManual: false,
      }));
      setVerifiedRegistries(items);
      checkAddAnotherConditions();
    } else {
      setCurrentVerificationIndex(0);
      setCurrentRole("");
      setCurrentFile(null);
      setRegStep(3);
    }
  };

  // STEP 3 Handler (Next Property) logic...

  // STEP 2 Handler (Next Property)
  const confirmCurrentVerification = () => {
    const currentReg = verificationQueue[currentVerificationIndex];
    if (currentRole === "proxy" && !currentFile) {
      // Optional file? Description says "no es obligatorio".
      // OK to proceed.
    }

    const newItem = {
      registry: currentReg,
      role: currentRole,
      powerFile: currentFile,
      isManual: false,
    };

    setVerifiedRegistries((prev) => [...prev, newItem]);

    // Check if more
    if (currentVerificationIndex < verificationQueue.length - 1) {
      // Next
      setCurrentVerificationIndex((prev) => prev + 1);
      setCurrentRole("owner");
      setCurrentFile(null);
    } else {
      // Done with queue
      checkAddAnotherConditions();
    }
  };

  const checkAddAnotherConditions = () => {
    // Check Config Limts
    // If canAddOtherRepresentatives is false -> Skip to Summary
    if (assembly.canAddOtherRepresentatives === false) {
      return setRegStep(6); // Summary (shifted)
    }

    // If powerLimit is set and reached -> Skip to Summary
    if (
      assembly.powerLimit &&
      verifiedRegistries.length >= parseInt(assembly.powerLimit)
    ) {
      return setRegStep(6);
    }

    setRegStep(4); // Ask Add Another
  };

  // STEP 4 Handler (Answer Yes/No) (Was 3)
  const handleAddAnotherDecision = () => {
    if (addAnotherDecision === "yes") {
      setAddNewProperties(true);
      // Reset add form and go to 5 (Was 4)
      setAddPropType("");
      setAddPropRegistry(null);
      setAddPropRole("owner");
      setAddPropFile(null);
    } else if (addAnotherDecision === "no") {
      setRegStep(6); // Summary (Was 5)
    } else {
      toast.error("Selecciona una opción");
    }
  };

  // STEP 5 Handler (Confirm Manual Add) (Was 4)
  const confirmManualAdd = () => {
    if (!addPropRegistry) return toast.error("Selecciona una propiedad");
    // Check duplicate
    if (verifiedRegistries.some((r) => r.registry.id === addPropRegistry.id)) {
      return toast.error("Esta propiedad ya está en tu lista");
    }

    const newItem = {
      registry: addPropRegistry,
      role: addPropRole,
      powerFile: addPropFile,
      isManual: true,
    };

    setVerifiedRegistries((prev) => [...prev, newItem]);
    if (regStep === 4) {
      setAddNewProperties(false);
      setRegStep(5); // Summary (Was 5)
    } else if (regStep === 5) {
      setRegStep(6); // Summary (Was 5)
    }
  };

  const removeVerifiedItem = (index) => {
    const item = verifiedRegistries[index];
    if (item && !item.isManual) {
      return toast.error(
        "No puedes eliminar una propiedad identificada por tu documento.",
      );
    }
    const updated = verifiedRegistries.filter((_, i) => i !== index);
    setVerifiedRegistries(updated);
  };

  // --- HELPERS ---
  const alphanumericSort = (a, b) => {
    return a.toString().localeCompare(b.toString(), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  // derived for manual add
  const availableTypes = useMemo(() => {
    // Should filter out those already in assembly.assemblyRegistrations?
    // User requested to remove Modification of List.
    // READ logic for "available" currently uses "registerInAssembly" from list.
    // If we stop writing that, we must check assemblyRegistrations
    const availableRegs = registries.filter(
      (r) => !registeredOwnerIds.has(r.id),
    );
    const types = new Set(availableRegs.map((r) => r.tipo || "Otro"));
    return Array.from(types).sort(alphanumericSort);
  }, [registries, registeredOwnerIds]);

  const hasMultipleTypes = useMemo(
    () => availableTypes.length > 1,
    [availableTypes],
  );
  const currentSingleType = useMemo(
    () => (!hasMultipleTypes ? availableTypes[0] : null),
    [hasMultipleTypes, availableTypes],
  );

  useEffect(() => {
    if (!hasMultipleTypes && currentSingleType) {
      setAddPropType(currentSingleType);
    }
  }, [hasMultipleTypes, currentSingleType]);

  const availableGroups = useMemo(() => {
    const typeToUse = addPropType || currentSingleType;
    if (!typeToUse) return [];

    const availableRegs = registries.filter(
      (r) => !registeredOwnerIds.has(r.id) && (r.tipo || "Otro") === typeToUse,
    );

    const groupsSet = new Set(
      availableRegs.map((r) => r.grupo).filter((g) => g && g !== "-"),
    );

    // Check if there are properties without group
    const hasEmptyGroup = availableRegs.some(
      (r) => !r.grupo || r.grupo === "-",
    );

    const sortedGroups = Array.from(groupsSet).sort(alphanumericSort);
    if (hasEmptyGroup) {
      sortedGroups.push("Sin grupo");
    }

    return sortedGroups;
  }, [addPropType, currentSingleType, registries, registeredOwnerIds]);

  const filteredProperties = useMemo(() => {
    const typeToUse = addPropType || currentSingleType;
    if (!typeToUse) return [];

    return registries
      .filter((r) => {
        if (registeredOwnerIds.has(r.id)) return false;
        const rType = r.tipo || "Otro";
        if (rType !== typeToUse) return false;

        if (addPropGroup) {
          if (addPropGroup === "Sin grupo") {
            return !r.grupo || r.grupo === "-";
          }
          return r.grupo === addPropGroup;
        }

        return true;
      })
      .sort((a, b) => alphanumericSort(a.propiedad, b.propiedad));
  }, [
    addPropType,
    addPropGroup,
    currentSingleType,
    registries,
    registeredOwnerIds,
  ]);

  // FINAL SUBMIT (Step 6)
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // 1. Upload files
      const finalRegistries = await Promise.all(
        verifiedRegistries.map(async (item) => {
          let url = null;
          if (item.powerFile) {
            const fileRef = ref(
              storage,
              `powers/${id}/${regDocument}/${item.registry.id}_${Date.now()}`,
            );
            await uploadBytes(fileRef, item.powerFile);
            url = await getDownloadURL(fileRef);
          }
          return {
            documentRepresentative: regDocument,
            registryId: item.registry.id,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            email: userInfo.email,
            phone: userInfo.phone,
            role: item.role,
            powerUrl: url,
            propiedad: item.registry.propiedad,
            coeficiente: item.registry.coeficiente,
            regDocument: item.registry.documento, // original doc in registry
          };
        }),
      );

      const mainRegistry = verifiedRegistries[0]?.registry;

      const userData = {
        assemblyId: id,
        registries: finalRegistries,
        registryId: mainRegistry?.id,
        userDocument: regDocument,
        document: regDocument, // Added for consistency with lib/assemblyUser
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phone: userInfo.phone,
      };

      const res = await createAssemblyUser(userData);

      if (res.success) {
        // --- LOGICA DE REGISTRO PARA ASSEMBLYREGISTRATIONS ---
        const representedProperties = finalRegistries.map((r, index) => {
          const originalItem = verifiedRegistries[index];
          const regInfo = originalItem.registry;
          return {
            ownerId: r.registryId,
            documento: r.regDocument,
            propiedad: r.propiedad,
            coeficiente: r.coeficiente,
            numeroVotos: regInfo.numeroVotos || "1",
            votingBlocked: regInfo.voteBlocked || false,
            addedByUser: !!originalItem.isManual,
            role: originalItem.role, // Propietario o Apoderado
            power: r.powerUrl || null, // Atributo solicitado para el documento
            tipo: regInfo.tipo || "",
            grupo: regInfo.grupo || "",
          };
        });

        const newRegistration = {
          assemblyId: id,
          mainDocument: regDocument,
          ownerId: mainRegistry?.id || "",
          firstName: userInfo.firstName || "",
          lastName: userInfo.lastName || "",
          email: userInfo.email || "",
          phone: userInfo.phone || "",
          createdAt: new Date(),
          representedProperties: representedProperties,
        };

        const assemblyRef = doc(db, "assembly", id);
        await updateDoc(assemblyRef, {
          assemblyRegistrations: arrayUnion(newRegistration),
        });

        if (assembly.registrationRecordId) {
          const regRecordRef = doc(
            db,
            "assemblyRegistrations",
            assembly.registrationRecordId,
          );
          await updateDoc(regRecordRef, {
            registrations: arrayUnion(newRegistration),
          });
        }
        // --- FIN LOGICA DE REGISTRO ---

        const fullUser = { ...userData, id: res.id };
        setCurrentUser(fullUser);
        // localStorage.setItem(`assemblyUser_${id}`, JSON.stringify(fullUser));
        toast.success("Registro completado");
        setRegStep(0);
      } else {
        toast.error("Error al crear usuario");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error en el proceso");
    }
    setLoading(false);
  };

  /* --- RENDER --- */

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  if (!assembly)
    return <div className="p-10 text-center">Asamblea no encontrada</div>;

  // DASHBOARD
  if (currentUser) {
    const userRegistryIds = (currentUser.registries || []).map(
      (r) => r.registryId,
    );

    userRegistryIds.push(currentUser.registryId);
    if (
      currentUser.registryId &&
      !userRegistryIds.includes(currentUser.registryId)
    ) {
      userRegistryIds.push(currentUser.registryId);
    }
    const myRegistries = registries.filter(
      (r) => userRegistryIds.includes(r.id) && !r.isDeleted,
    );
    const dashboardUser = { ...currentUser, myRegistries };

    return (
      <AsambleistaDashboard
        user={dashboardUser}
        assembly={assembly}
        entity={entity}
        registries={registries}
        questions={questions}
        votes={votes}
        userVotingPreference={userVotingPreference}
        onSetVotingPreference={persistVotingPreference}
        onLogout={() => {
          localStorage.removeItem(`assemblyUser_${id}`);
          setCurrentUser(null);
          setRegStep(0);
        }}
        onJoinMeeting={() => setIsInMeeting(true)}
        allRegistrations={allRegistrations}
        renderQuestion={(q, extraProps = {}) => (
          <QuestionItem
            key={q.id}
            q={q}
            userRegistries={myRegistries}
            assembly={assembly}
            userVotes={votes}
            userVotingPreference={userVotingPreference}
            onSetVotingPreference={persistVotingPreference}
            currentUser={currentUser}
            {...extraProps}
          />
        )}
      />
    );
  }

  // WIZARD FRAME
  return (
    <div className="h-full h-screen flex items-center justify-center">
      {prevStep === 0 && (
        <LoginMember
          assembly={assembly}
          entity={entity}
          onLogin={() => setPrevStep(1)}
        />
      )}
      {prevStep === 1 && (
        <div className="w-full max-w-3xl rounded-[40px] shadow-sm  flex flex-col bg-white p-6 gap-[40px] max-w-[1080px] w-full">
          <div className="flex items-center justify-between w-full gap-4">
            {regStep !== 4 && (
              <CustomButton
                onClick={
                  regStep === 0
                    ? () => setPrevStep(0)
                    : regStep === 5
                      ? () => setRegStep(6)
                      : () => setRegStep(regStep - 1)
                }
                className="p-0 bg-transparent border-none hover:bg-transparent "
              >
                <ArrowLeft size={24} className="text-gray-400" />
              </CustomButton>
            )}
            <div className="flex-1 flex items-center justify-center text-center w-full">
              <ProgressBar currentStep={regStep} />
            </div>
            <div className="bg-[#D5DAFF] px-3 py-2 rounded-full">
              <CustomText
                variant="labelS"
                className="text-[#00093F] font-medium"
              >
                Paso {regStep} de 7
              </CustomText>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-full h-full">
            {regStep === 0 && (
              <Step1Document
                document={regDocument}
                setDocument={setRegDocument}
                onNext={() => handleAccess(regDocument)}
                loading={loading}
              />
            )}

            {regStep === 1 && (
              <Step2UserInfo
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                onNext={handleUserInfoSubmit}
                assembly={assembly}
                loading={loading}
              />
            )}

            {regStep === 2 && (
              <StepDiscovery
                verificationQueue={verificationQueue}
                onContinue={startVerificationLoop}
              />
            )}

            {regStep === 3 && verificationQueue[currentVerificationIndex] && (
              <Step3Properties
                verificationQueue={verificationQueue}
                currentVerificationIndex={currentVerificationIndex}
                currentRole={currentRole}
                setCurrentRole={setCurrentRole}
                currentFile={currentFile}
                setCurrentFile={setCurrentFile}
                onContinue={confirmCurrentVerification}
                assembly={assembly}
              />
            )}

            {/* STEP 4: ASK ADD ANOTHER */}
            {regStep === 4 && (
              <Step4AddProperties
                hasStepDecision={addNewProperties}
                availableTypes={availableTypes}
                availableGroups={availableGroups}
                filteredProperties={filteredProperties}
                addAnotherDecision={addAnotherDecision}
                setAddAnotherDecision={setAddAnotherDecision}
                onDecisionContinue={handleAddAnotherDecision}
                addPropType={addPropType}
                setAddPropType={setAddPropType}
                addPropGroup={addPropGroup}
                setAddPropGroup={setAddPropGroup}
                addPropRegistry={addPropRegistry}
                setAddPropRegistry={setAddPropRegistry}
                addPropRole={addPropRole}
                setAddPropRole={setAddPropRole}
                addPropFile={addPropFile}
                setAddPropFile={setAddPropFile}
                onConfirmManualAdd={confirmManualAdd}
                entity={entity}
                assembly={assembly}
              />
            )}

            {/* STEP 5: MANUAL ADD FORM / LOOP */}
            {regStep === 5 && (
              <Step4AddProperties
                hasStepDecision={addNewProperties}
                addPropType={addPropType}
                addAnotherDecision={addAnotherDecision}
                setAddAnotherDecision={setAddAnotherDecision}
                onDecisionContinue={handleAddAnotherDecision}
                setAddPropType={setAddPropType}
                addPropGroup={addPropGroup}
                setAddPropGroup={setAddPropGroup}
                addPropRegistry={addPropRegistry}
                setAddPropRegistry={setAddPropRegistry}
                addPropRole={addPropRole}
                setAddPropRole={setAddPropRole}
                addPropFile={addPropFile}
                setAddPropFile={setAddPropFile}
                onConfirmManualAdd={confirmManualAdd}
                availableTypes={availableTypes}
                availableGroups={availableGroups}
                filteredProperties={filteredProperties}
                entity={entity}
                assembly={assembly}
              />
            )}

            {/* STEP 6: SUMMARY */}
            {regStep === 6 && (
              <Step5Review
                userInfo={userInfo}
                regDocument={regDocument}
                verifiedRegistries={verifiedRegistries}
                onRemoveItem={removeVerifiedItem}
                onAddAnother={() => {
                  setAddPropType("");
                  setAddPropRegistry(null);
                  setAddPropRole("owner");
                  setAddPropFile(null);
                  setRegStep(5);
                }}
                onContinue={() => setRegStep(7)}
              />
            )}

            {/* STEP 7: TERMS */}
            {regStep === 7 && (
              <Step6Condition onAccept={handleFinalSubmit} loading={loading} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
