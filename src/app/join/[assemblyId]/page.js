"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Lógica de Firebase y Utilidades
import { db } from "@/lib/firebase"; // Asegúrate de importar la db
import { collection, query, where, onSnapshot } from "firebase/firestore"; // Importamos los listeners
import { listenToAssemblyLive, getEntityMasterList } from "@/lib/assembly";
import { listenToEntityById } from "@/lib/entity";
import {
  addMemberToAssemblyRegistration,
  checkExistingRegistration,
  uploadPowerFile
} from "@/lib/assemblyRegistration";

// Componentes Base
import Loader from "@/components/basics/Loader";
import JoinLayout from "@/components/join/JoinLayout";

// Componentes de Pasos
import LoginMember from "@/components/join/LoginMember";
import Step1Document from "@/components/join/Step1Document";
import Step2UserInfo from "@/components/join/Step2UserInfo";
import StepDiscovery from "@/components/join/StepDiscovery";
import Step3Properties from "@/components/join/Step3Properties";
import Step4AddProperties from "@/components/join/Step4AddProperties";
import Step5ManualAdd from "@/components/join/Step5ManualAdd";
import Step6Review from "@/components/join/Step6Review";
import Step7Terms from "@/components/join/Step7Term";
import { updateUserSessionToken } from "@/lib/assemblyActions";

// Definición de los pasos del flujo
const STEPS = {
  WELCOME: "WELCOME",
  DOCUMENT: "DOCUMENT",
  USER_INFO: "USER_INFO",
  DISCOVERY: "DISCOVERY",
  ROLES: "ROLES",
  ADD_MANUAL: "ADD_MANUAL",
  REVIEW: "REVIEW",
  TERMS: "TERMS",
};

export default function JoinAssemblyPage() {
  const { assemblyId } = useParams();
  const router = useRouter();

  // --- ESTADOS DE DATOS MAESTROS ---
  const [loading, setLoading] = useState(true);
  const [assembly, setAssembly] = useState(null);
  const [entity, setEntity] = useState(null);
  const [masterList, setMasterList] = useState({});

  // --- ESTADOS DEL FLUJO ---
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);

  // --- ESTADOS DE REGISTRO Y VALIDACIÓN ---
  const [regDocument, setRegDocument] = useState("");
  const [docError, setDocError] = useState(false);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [verifiedRegistries, setVerifiedRegistries] = useState([]);
  const [addAnotherDecision, setAddAnotherDecision] = useState("");
  const [alreadyRegisteredInDB, setAlreadyRegisteredInDB] = useState([]);

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  const [manualData, setManualData] = useState({
    type: "",
    group: "",
    registry: null,
    role: "owner",
    file: null
  });

  // --- LÓGICA DE VALIDACIÓN CRUZADA ---
  const registeredOwnerIds = useMemo(() => {
    const ids = new Set();
    if (alreadyRegisteredInDB) {
      alreadyRegisteredInDB.forEach(id => ids.add(id));
    }
    return ids;
  }, [alreadyRegisteredInDB]);

  // 1. Listeners de Asamblea y Registros
  useEffect(() => {
    if (!assemblyId) return;

    // A. Listener para la info de la asamblea y lista maestra
    const unsubAssembly = listenToAssemblyLive(assemblyId, (data) => {
      if (!data) {
        toast.error("La asamblea solicitada no existe.");
        return router.push("/");
      }
      setAssembly(data.assembly);

      if (data.assembly.entityId && !entity) {
        const unsubEntity = listenToEntityById(data.assembly.entityId, async (entData) => {
          setEntity(entData);
          if (entData.assemblyRegistriesListId) {
            const master = await getEntityMasterList(entData.assemblyRegistriesListId);
            setMasterList(master);
          }
          setLoading(false);
        });
        return () => unsubEntity();
      }
    });

    // B. Listener directo y en tiempo real para assemblyRegistrations (AQUÍ ESTABA EL ERROR)
    const q = query(collection(db, "assemblyRegistrations"), where("assemblyId", "==", assemblyId));
    const unsubRegistrations = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const masterData = snap.docs[0].data();
        const occupied = [];

        // Iteramos sobre todos los registros y sus propiedades representadas
        (masterData.registrations || []).forEach(reg => {
          (reg.representedProperties || []).forEach(rp => {
            if (rp.ownerId) occupied.push(rp.ownerId);
          });
        });

        // Actualizamos el estado con los IDs reales extraídos de Firebase
        setAlreadyRegisteredInDB(occupied);
      }
    });

    // Limpieza de listeners al desmontar
    return () => {
      unsubAssembly();
      unsubRegistrations();
    };
  }, [assemblyId, entity, router]);

  // --- LÓGICA DE DATOS DINÁMICA ---

  const availableTypes = useMemo(() => {
    if (!masterList) return [];
    return [...new Set(Object.values(masterList).map(item => item.Tipo || item.tipo).filter(Boolean))];
  }, [masterList]);

  const availableGroups = useMemo(() => {
    const filteredByType = Object.values(masterList).filter(item =>
      availableTypes.length <= 1 || (item.Tipo || item.tipo) === manualData.type
    );
    return [...new Set(filteredByType.map(item => item.Grupo || item.grupo).filter(Boolean))];
  }, [masterList, manualData.type, availableTypes]);

  // Filtro inteligente: Oculta propiedades ya registradas
  const availableProperties = useMemo(() => {
    if (!masterList) return [];

    const forbiddenIds = new Set([
      ...Array.from(registeredOwnerIds),
      ...verifiedRegistries.map(v => v.registry.id)
    ]);

    return Object.entries(masterList)
      .map(([id, data]) => ({ ...data, id }))
      .filter(item => {
        const matchType = availableTypes.length <= 1 || (item.Tipo || item.tipo) === manualData.type;
        const matchGroup = availableGroups.length === 0 || (item.Grupo || item.grupo) === manualData.group;

        // Si el ID ya está en el Set de prohibidos, desaparece del selector
        const isAvailable = !forbiddenIds.has(item.id);

        return matchType && matchGroup && isAvailable;
      });
  }, [masterList, manualData.type, manualData.group, verifiedRegistries, registeredOwnerIds, availableTypes, availableGroups]);

  // --- FUNCIONES DE NAVEGACIÓN Y VALIDACIÓN ---

  const getFieldLabel = (key) => entity?.columnAliases?.[key] || key;

  const handleDocumentChange = (val) => {
    setRegDocument(val);
    if (docError) setDocError(false);
  };

  const handleBackNavigation = () => {
    if (currentStep === STEPS.ADD_MANUAL && addAnotherDecision === "yes") {
      setAddAnotherDecision("");
      return;
    }
    const stepValues = Object.values(STEPS);
    const currentIndex = stepValues.indexOf(currentStep);
    if (currentIndex > 0) setCurrentStep(stepValues[currentIndex - 1]);
  };

  // Validación de Acceso Inicial
  const handleAccessValidation = async () => {
    if (!regDocument.trim()) return toast.warning("Por favor ingresa tu documento");
    setLoading(true);

    try {
      const { exists, userData } = await checkExistingRegistration(assemblyId, regDocument);
      if (exists) {
        // 🔥 Generamos el token incluyendo el Timestamp actual
        const newToken = `${Date.now()}_${crypto.randomUUID()}`;

        sessionStorage.setItem(`assembly_session_${assemblyId}`, regDocument);
        sessionStorage.setItem(`assembly_token_${assemblyId}`, newToken);

        // Actualizamos Firebase con el nuevo token (que tiene la hora nueva)
        await updateUserSessionToken(assemblyId, regDocument, newToken);

        toast.success(`Bienvenido de nuevo, ${userData.firstName}`);
        return router.push(`/join/${assemblyId}/lobby`);
      }

      // 2. Validar si el registro está abierto
      if (!assembly.registerIsOpen) {
        return toast.error("Los registros están cerrados para esta asamblea.");
      }

      // 3. Buscar propiedades en Excel por documento
      const docField = "Documento";
      const matches = Object.entries(masterList)
        .filter(([id, data]) => String(data[docField] || data.documento || "").trim() === regDocument.trim())
        .map(([id, data]) => ({ id, ...data }));

      if (matches.length === 0) {
        setDocError(true);
        return;
      }

      // 4. Validar si sus propiedades asociadas ya fueron registradas por alguien más
      const matchIds = matches.map(m => m.id);
      const propertiesAlreadyTaken = matchIds.filter(id => registeredOwnerIds.has(id));

      if (propertiesAlreadyTaken.length === matches.length) {
        return toast.error("Las propiedades asociadas a este documento ya han sido registradas. Comunícate con soporte.");
      }

      // Filtramos las propiedades libres
      const freeProperties = matches.filter(m => !propertiesAlreadyTaken.includes(m.id));

      setVerificationQueue(freeProperties);
      setCurrentStep(STEPS.USER_INFO);

    } catch (error) {
      console.error("Error en validación:", error);
      toast.error("Error al validar acceso.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoveryContinue = () => {
    if (!assembly) return;
    if (verificationQueue.length >= 2) {
      setVerifiedRegistries(verificationQueue.map(reg => ({
        registry: reg, role: "owner", powerFile: null, isManual: false
      })));
      return assembly.canAddOtherRepresentatives ? setCurrentStep(STEPS.ADD_MANUAL) : setCurrentStep(STEPS.REVIEW);
    }
    setCurrentStep(STEPS.ROLES);
  };

  const handleRoleConfirmation = (role, file) => {
    setVerifiedRegistries([{ registry: verificationQueue[0], role, powerFile: file, isManual: false }]);
    assembly.canAddOtherRepresentatives ? setCurrentStep(STEPS.ADD_MANUAL) : setCurrentStep(STEPS.REVIEW);
  };

  const handleAddAnotherDecision = () => {
    if (addAnotherDecision === "yes") return;
    setCurrentStep(STEPS.REVIEW);
  };

  const confirmManualAdd = () => {
    const newEntry = { registry: manualData.registry, role: manualData.role, powerFile: manualData.file, isManual: true };
    setVerifiedRegistries(prev => [...prev, newEntry]);
    setManualData({ type: "", group: "", registry: null, role: "owner", file: null });
    setCurrentStep(STEPS.REVIEW);
  };

  const removeVerifiedItem = (index) => {
    setVerifiedRegistries(prev => prev.filter((_, i) => i !== index));
  };

  // Guardado Final Estructurado
  const handleFinalSubmit = async () => {
    try {
      const initialProps = verificationQueue.map(p => ({
        ownerId: p.id,
        power: null,
        role: "owner",
        addedByUser: false,
        coefi: p.coeficiente || p.Coeficiente || "0",
        votos: p.votos || p.Votos || "0"
      }));

      const manualProps = await Promise.all(
        verifiedRegistries
          .filter(v => v.isManual)
          .map(async (v) => {
            let powerUrl = null;
            if (v.powerFile) {
              powerUrl = await uploadPowerFile(assemblyId, regDocument, v.powerFile);
            }
            return {
              ownerId: v.registry.id,
              power: powerUrl,
              role: v.role,
              addedByUser: true,
              coefi: v.registry.coeficiente || v.registry.Coeficiente || "0",
              votos: v.registry.votos || v.registry.Votos || "0"
            };
          })
      );

      const allRepresented = [...initialProps, ...manualProps];

      // 🔥 Generamos el token de sesión única AQUÍ
      const newToken = `${Date.now()}_${crypto.randomUUID()}`;
      const memberObject = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        mainDocument: regDocument,
        ownerId: verificationQueue.map(p => p.id),
        representedProperties: allRepresented,
        votingPreference: "",
        sessionToken: newToken // 🔥 Lo agregamos al objeto de Firebase
      };

      await addMemberToAssemblyRegistration(assemblyId, memberObject);

      // 1. Guardar primero
      sessionStorage.setItem(`assembly_session_${assemblyId}`, regDocument);
      sessionStorage.setItem(`assembly_token_${assemblyId}`, newToken);

      router.push(`/join/${assemblyId}/lobby`);
    } catch (error) {
      toast.error("Error al guardar el registro.");
    } finally {
    }
  };

  const validateNoOverlap = () => {
    // 1. Obtener IDs de lo que el usuario tiene en su lista actual (automáticas + manuales)
    const currentInitialIds = verificationQueue.map(p => p.id);
    const currentManualIds = verifiedRegistries.filter(v => v.isManual).map(v => v.registry.id);
    const allAttemptedIds = [...currentInitialIds, ...currentManualIds];

    // 2. Verificar si alguno de esos IDs ya existe en la DB (vía el listener en tiempo real)
    const takenIds = allAttemptedIds.filter(id => registeredOwnerIds.has(id));

    if (takenIds.length > 0) {
      const conflictNames = [
        ...verificationQueue,
        ...verifiedRegistries.map(v => v.registry)
      ]
        .filter(item => takenIds.includes(item.id))
        .map(item => item.Propiedad || item.propiedad)
        .join(", ");

      // 3. Notificar el error fatal
      toast.error(
        `Conflicto detectado: Las propiedades [${conflictNames}] ya han sido registradas por otro usuario. Por seguridad, el proceso se reiniciará.`
      );

      // 4. LIMPIEZA TOTAL: Sacamos al usuario del flujo
      setVerifiedRegistries([]);
      setVerificationQueue([]);
      setRegDocument(""); // Opcional: borrar el documento para forzar re-ingreso
      setCurrentStep(STEPS.DOCUMENT);

      return false; // Bloquea el avance a TERMS
    }

    return true; // Todo limpio, puede continuar
  };

  if (loading || !assembly || !entity) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FB]"><Loader /></div>;
  }

  return (
    <main className="md:min-h-screen flex items-center justify-center font-sans bg-gray-50">

      {currentStep === STEPS.WELCOME && (
        <LoginMember assembly={assembly} entity={entity} onLogin={() => setCurrentStep(STEPS.DOCUMENT)} />
      )}

      {currentStep !== STEPS.WELCOME && (
        <JoinLayout
          currentStep={Object.values(STEPS).indexOf(currentStep) - 1}
          totalSteps={7}
          onBack={handleBackNavigation}
        >
          {currentStep === STEPS.DOCUMENT && (
            <Step1Document
              document={regDocument}
              setDocument={handleDocumentChange}
              onNext={handleAccessValidation}
              label={getFieldLabel("Documento")}
              error={docError}
            />
          )}

          {currentStep === STEPS.USER_INFO && (
            <Step2UserInfo
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              assembly={assembly}
              onNext={() => setCurrentStep(STEPS.DISCOVERY)}
            />
          )}

          {currentStep === STEPS.DISCOVERY && (
            <StepDiscovery verificationQueue={verificationQueue} onContinue={handleDiscoveryContinue} />
          )}

          {currentStep === STEPS.ROLES && (
            <Step3Properties verificationQueue={verificationQueue} assembly={assembly} onContinue={handleRoleConfirmation} />
          )}

          {currentStep === STEPS.ADD_MANUAL && (
            <>
              {addAnotherDecision !== "yes" ? (
                <Step4AddProperties
                  addAnotherDecision={addAnotherDecision}
                  setAddAnotherDecision={setAddAnotherDecision}
                  onContinue={handleAddAnotherDecision}
                />
              ) : (
                <Step5ManualAdd
                  manualData={manualData}
                  setManualData={setManualData}
                  availableTypes={availableTypes}
                  availableGroups={availableGroups}
                  availableProperties={availableProperties}
                  getFieldLabel={getFieldLabel}
                  verifiedRegistries={verifiedRegistries}
                  assembly={assembly}
                  onConfirm={confirmManualAdd}
                />
              )}
            </>
          )}

          {currentStep === STEPS.REVIEW && (
            <Step6Review
              userInfo={userInfo}
              regDocument={regDocument}
              verifiedRegistries={verifiedRegistries}
              assembly={assembly}
              onRemoveItem={removeVerifiedItem}
              onAddAnother={() => {
                setManualData({ type: "", group: "", registry: null, role: "owner", file: null });
                setAddAnotherDecision("yes");
                setCurrentStep(STEPS.ADD_MANUAL);
              }}
              onContinue={() => {
                const isClean = validateNoOverlap();
                if (isClean) {
                  setCurrentStep(STEPS.TERMS);
                }
              }}
            />
          )}

          {currentStep === STEPS.TERMS && (
            <Step7Terms onAccept={handleFinalSubmit} />
          )}

        </JoinLayout>
      )}
    </main>
  );
}