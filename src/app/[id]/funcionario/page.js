"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getEntityById } from "@/lib/entities";
import Loader from "@/components/basics/Loader";
import {
  Users,
  UserCheck,
  HelpCircle,
  Search,
  ChevronRight,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldCheck,
  Trophy,
  History,
  X,
  LogOut,
} from "lucide-react";
import { toast } from "react-toastify";

const QuorumGauge = ({ percentage }) => {
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const progress = (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 10}
        viewBox={`0 0 ${size} ${size / 2 + 5}`}
        className="overflow-visible"
      >
        {/* Background Arc */}
        <path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0 1 ${
            size - strokeWidth / 2
          },${size / 2}`}
          fill="none"
          stroke="#F3F4FB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0 1 ${
            size - strokeWidth / 2
          },${size / 2}`}
          fill="none"
          stroke="#8B9DFF"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 1.2s ease-in-out" }}
        />
      </svg>
      <div className="absolute -bottom-1 text-center">
        <span className="text-[34px] font-black text-[#0E3C42] tracking-tighter leading-none block">
          {percentage.toFixed(2)}%
        </span>
        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">
          Asambleístas registrados
        </p>
      </div>
    </div>
  );
};

const FuncionarioPage = () => {
  const { id: assemblyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [assembly, setAssembly] = useState(null);
  const [entity, setEntity] = useState(null);
  const [registries, setRegistries] = useState([]);
  const [activeTab, setActiveTab] = useState("Asambleistas"); // Asambleistas, Info
  const [tableFilter, setTableFilter] = useState("Registrados"); // Registrados, Pendientes
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Stats
  const [quorum, setQuorum] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);

  useEffect(() => {
    const assemblyRef = doc(db, "assembly", assemblyId);
    const unsub = onSnapshot(assemblyRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setAssembly(data);

        if (data.entityId) {
          const resEntity = await getEntityById(data.entityId);
          if (resEntity.success) {
            setEntity(resEntity.data);

            if (resEntity.data.assemblyRegistriesListId) {
              const listRef = doc(
                db,
                "assemblyRegistriesList",
                resEntity.data.assemblyRegistriesListId
              );
              onSnapshot(listRef, (listSnap) => {
                if (listSnap.exists()) {
                  const regsMap = listSnap.data().assemblyRegistries || {};
                  const regs = Object.entries(regsMap).map(
                    ([regId, regData]) => ({
                      id: regId,
                      ...regData,
                    })
                  );
                  setRegistries(regs);

                  const registered = regs.filter(
                    (r) => r.registerInAssembly === true
                  );
                  const totalCoef = regs.reduce(
                    (acc, r) => acc + parseFloat(r.coeficiente || 0),
                    0
                  );
                  const regCoef = registered.reduce(
                    (acc, r) => acc + parseFloat(r.coeficiente || 0),
                    0
                  );

                  setRegisteredCount(registered.length);
                  setBlockedCount(
                    regs.filter((r) => r.voteBlocked === true).length
                  );
                  setQuorum(totalCoef > 0 ? (regCoef / totalCoef) * 100 : 0);
                }
              });
            }
          }
        }
      } else {
        toast.error("Asamblea no encontrada");
      }
      setLoading(false);
    });

    return () => unsub();
  }, [assemblyId]);

  if (loading || !assembly) return <Loader />;

  const filteredRegistries = registries.filter((r) => {
    const isReg =
      tableFilter === "Registrados"
        ? r.registerInAssembly === true
        : r.registerInAssembly !== true;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      String(r.propiedad || "")
        .toLowerCase()
        .includes(search) ||
      String(r.documento || "")
        .toLowerCase()
        .includes(search) ||
      String(r.grupo || "")
        .toLowerCase()
        .includes(search);
    return isReg && matchesSearch;
  });

  const totalPages = Math.ceil(filteredRegistries.length / itemsPerPage);
  const currentItems = filteredRegistries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 py-3 px-10 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="text-[#8B9DFF] font-black text-2xl tracking-tighter flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full border-[5px] border-[#8B9FFD] flex items-center justify-center relative">
              <div className="w-2.5 h-2.5 bg-[#8B9FFD] rounded-full" />
            </div>
            intuapp
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Invitado: <span className="text-[#0E3C42]">Administrador</span>
          </span>
          <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center text-[#8B9DFF] border border-indigo-100 shadow-sm">
            <Users size={18} />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1240px] mx-auto p-12">
        {/* ASSEMBLY INFO */}
        <div className="mb-10">
          <h1 className="text-[34px] font-black text-[#0E3C42] mb-1 leading-tight tracking-tight">
            {assembly.name}
          </h1>
          <div className="flex items-center gap-3 text-gray-400 text-sm font-bold">
            <span className="text-gray-500 font-black">{entity?.name}</span>
            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
            <div className="flex items-center gap-1.5">
              {assembly.date} - {assembly.hour}
            </div>
            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-[#8B9DFF] px-3.5 py-1.5 rounded-full text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#8B9DFF] rounded-full" />{" "}
                {assembly.type}
              </span>
              <span
                className={`px-3.5 py-1.5 rounded-full text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5 ${
                  assembly.status === "finished"
                    ? "bg-gray-100 text-gray-500"
                    : "bg-red-50 text-red-500 animate-pulse"
                }`}
              >
                {assembly.status !== "finished" && (
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                )}
                {assembly.status === "create"
                  ? "Por iniciar"
                  : assembly.status === "started"
                  ? "En vivo"
                  : assembly.status === "registries_finalized"
                  ? "Registros Cerrados"
                  : "Finalizada"}
              </span>
            </div>
          </div>
        </div>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* QUORUM CARD */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100/50 flex flex-col items-center relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="w-full flex justify-between items-center mb-4">
              <h3 className="font-black text-[#0E3C42] uppercase text-[11px] tracking-[0.2em] opacity-80">
                Quórum
              </h3>
              <button className="p-2 text-gray-300 hover:text-[#8B9DFF] transition-colors">
                <Info size={18} />
              </button>
            </div>

            <div className="mt-2">
              <QuorumGauge percentage={quorum} />
            </div>

            <div className="w-full flex justify-between mt-6 px-10">
              <span className="text-[11px] font-black text-gray-300 uppercase italic">
                0%
              </span>
              <span className="text-[11px] font-black text-gray-300 uppercase italic">
                100%
              </span>
            </div>
          </div>

          {/* ASAMBLEISTAS STATS CARDS */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100/50 grid grid-cols-2 gap-10 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <h3 className="font-black text-[#0E3C42] uppercase text-[11px] tracking-[0.2em] mb-12 opacity-80">
                Asambleístas
              </h3>
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-[#F5F7FF] rounded-[22px] flex items-center justify-center text-[#8B9DFF] shadow-inner">
                  <UserCheck size={28} />
                </div>
                <div className="pt-1">
                  <p className="text-[28px] font-black text-[#0E3C42] tracking-tighter leading-none mb-1">
                    {registeredCount} / {registries.length}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    asambleístas registrados
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="font-black text-[#0E3C42] uppercase text-[11px] tracking-[0.2em] mb-12 invisible">
                Space
              </h3>
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-[#F5F7FF] rounded-[22px] flex items-center justify-center text-[#8B9DFF] shadow-inner">
                  <div className="relative">
                    <Users size={28} strokeWidth={2.5} />
                    <div className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 border-4 border-white">
                      <AlertTriangle size={8} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="pt-1">
                  <p className="text-[28px] font-black text-[#0E3C42] tracking-tighter leading-none mb-1">
                    {blockedCount}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-tight">
                    con restricción de voto
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS - MATCHING IMAGE AESTHETICS */}
        <div className="bg-[#E0E7FF]/20 p-2 rounded-full flex gap-1 mb-10 max-w-2xl mx-auto border border-[#E0E7FF]/40">
          <button
            onClick={() => setActiveTab("Asambleistas")}
            className={`flex-1 py-3.5 px-8 rounded-full font-black text-xs uppercase tracking-[0.1em] transition-all duration-300 ${
              activeTab === "Asambleistas"
                ? "bg-[#8B9DFF] text-white shadow-[0_8px_20px_rgba(139,157,255,0.4)]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Asambleístas
          </button>
          <button
            onClick={() => setActiveTab("Sobre IntuApp")}
            className={`flex-1 py-3.5 px-8 rounded-full font-black text-xs uppercase tracking-[0.1em] transition-all duration-300 ${
              activeTab === "Sobre IntuApp"
                ? "bg-[#8B9DFF] text-white shadow-[0_8px_20px_rgba(139,157,255,0.4)]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Sobre IntuApp
          </button>
        </div>

        {/* CONTENT SECTION */}
        {activeTab === "Asambleistas" ? (
          <div className="bg-white rounded-[48px] p-12 shadow-sm border border-gray-50/50 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h2 className="text-[28px] font-black text-[#0E3C42] mb-8 tracking-tight">
              Asistencia
            </h2>

            <div className="flex gap-2.5 mb-10">
              {["Registrados", "Pendientes"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setTableFilter(f);
                    setCurrentPage(1);
                  }}
                  className={`px-7 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm ${
                    tableFilter === f
                      ? "bg-[#0E3C42] text-white"
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <p className="text-gray-400 text-sm mb-8 font-semibold opacity-80">
              Aquí puedes ver a los Asambleístas que ya se registraron.
            </p>

            {/* ORANGE ALERT BOX */}
            <div className="bg-[#FFF4E5] border border-orange-100 rounded-[32px] p-8 mb-10 flex gap-6 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400/30" />
              <button className="absolute top-6 right-6 text-orange-300 hover:text-orange-500 transition-colors">
                <X size={18} />
              </button>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-black text-orange-900 text-xs uppercase tracking-widest mb-2">
                  Importante
                </h4>
                <p className="text-orange-800/80 text-[12px] leading-relaxed font-bold">
                  La responsabilidad de definir a qué asambleístas se les
                  restringe el voto{" "}
                  <span className="text-orange-950 underline decoration-2 underline-offset-4">
                    recae exclusivamente en el Operador Logístico o en la
                    administración o funcionario de la entidad
                  </span>
                  . IntuApp no valida las causales de restricción ni asume
                  responsabilidad legal por el uso de esta función.
                </p>
              </div>
            </div>

            {/* SEARCH AREA */}
            <div className="flex gap-5 mb-10">
              <div className="flex-1 relative group">
                <Search
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#8B9DFF] transition-all"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Busca por torre, # de unidad privada o cédula"
                  className="w-full bg-[#F9FAFB] border-none outline-none rounded-[24px] py-5 px-16 text-[15px] font-bold text-[#0E3C42] placeholder:text-gray-300 focus:bg-white focus:ring-[6px] ring-indigo-50 transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="px-8 rounded-[24px] border border-gray-100 font-black text-gray-400 text-sm flex items-center gap-3 hover:bg-white hover:shadow-md transition-all active:scale-95 group"
              >
                Ver todos{" "}
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* PREMIUM TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-50/50">
                    <th className="py-8 px-6 italic text-left">Tipo</th>
                    <th className="py-8 px-6 italic text-left">Grupo</th>
                    <th className="py-8 px-6 italic text-left"># propiedad</th>
                    <th className="py-8 px-6 italic text-left">
                      Voto bloqueado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/30 uppercase">
                  {currentItems.length > 0 ? (
                    currentItems.map((r, i) => (
                      <tr
                        key={r.id || i}
                        className="text-[#0E3C42] text-[13px] font-bold group hover:bg-indigo-50/20 transition-all"
                      >
                        <td className="py-6 px-6 opacity-70">
                          {r.tipo || "-"}
                        </td>
                        <td className="py-6 px-6 opacity-70">
                          {r.grupo || "-"}
                        </td>
                        <td className="py-6 px-6 text-[#0E3C42] font-black">
                          {r.propiedad || "---"}
                        </td>
                        <td
                          className={`py-6 px-6 font-black ${
                            r.voteBlocked ? "text-red-500" : "text-gray-400"
                          }`}
                        >
                          {r.voteBlocked ? "Si" : "No"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-24 text-center text-gray-300 font-bold italic tracking-wide"
                      >
                        No se encontraron asambleístas con estos criterios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center items-center gap-2 mt-12 pb-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                    currentPage === i + 1
                      ? "bg-[#ABE7E5] text-[#0E3C42] shadow-lg shadow-teal-100"
                      : "hover:bg-gray-100 text-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              {totalPages > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="text-xs font-black text-gray-400 hover:text-[#0E3C42] flex items-center gap-1.5 transition-all ml-2 group disabled:opacity-30"
                  >
                    Siguiente{" "}
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="text-[10px] font-black text-gray-300 ml-6 hover:text-[#0E3C42] tracking-[0.2em] uppercase transition-all flex items-center gap-1.5 group"
                  >
                    Última <LogOut size={12} className="rotate-180" />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: SOBRE INTUAPP */
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
            {/* HERO GRADIENT CARD */}
            <div className="bg-gradient-to-br from-[#80D9D1] via-[#8B9DFF] to-[#6372FF] rounded-[48px] p-16 text-white relative overflow-hidden shadow-[0_20px_50px_rgba(139,157,255,0.3)]">
              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="text-white font-black text-[56px] tracking-tighter flex items-center gap-3 mb-4 drop-shadow-lg">
                  <div className="w-16 h-16 rounded-full border-[8px] border-white flex items-center justify-center shadow-lg">
                    <div className="w-3.5 h-3.5 bg-white rounded-full" />
                  </div>
                  intuapp
                </div>
                <h3 className="text-2xl font-black opacity-95 tracking-tight italic">
                  Lo complejo hecho simple
                </h3>
              </div>

              {/* GRID FEATURES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 mt-16 max-w-5xl mx-auto">
                <div className="bg-white/15 backdrop-blur-xl rounded-[32px] p-10 border border-white/20 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#8B9FFD] shadow-sm">
                      <ShieldCheck size={24} strokeWidth={2.5} />
                    </div>
                    <h4 className="font-black uppercase tracking-[0.2em] text-[13px]">
                      Nuestra Misión
                    </h4>
                  </div>
                  <p className="text-[15px] leading-relaxed opacity-90 font-bold">
                    Creamos herramientas funcionales con un enfoque intuitivo
                    para simplificar lo complejo. Nuestro objetivo es hacer que
                    la gestión de asambleas sea accesible y eficiente para
                    todos.
                  </p>
                </div>
                <div className="bg-white/15 backdrop-blur-xl rounded-[32px] p-10 border border-white/20 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#8B9FFD] shadow-sm">
                      <Trophy size={24} strokeWidth={2.5} />
                    </div>
                    <h4 className="font-black uppercase tracking-[0.2em] text-[13px]">
                      Experiencia
                    </h4>
                  </div>
                  <div className="text-[15px] leading-relaxed opacity-90 font-bold">
                    Más de 10 años de experiencia en la gestión de asambleas.
                    <br />
                    <div className="mt-3 flex flex-col gap-1 text-[13px] opacity-80 uppercase tracking-wide">
                      <span className="flex items-center gap-2">
                        • 500+ asambleas exitosas
                      </span>
                      <span className="flex items-center gap-2">
                        • Miles de Asambleístas satisfechos
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-xl rounded-[32px] p-10 border border-white/20 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#8B9FFD] shadow-sm">
                      <HelpCircle size={24} strokeWidth={2.5} />
                    </div>
                    <h4 className="font-black uppercase tracking-[0.2em] text-[13px]">
                      ¿Qué hacemos?
                    </h4>
                  </div>
                  <p className="text-[15px] leading-relaxed opacity-90 font-bold">
                    Somos una herramienta que facilita y dinamiza el proceso de
                    registros y votaciones en las asambleas.
                  </p>
                </div>
                <div className="bg-white/15 backdrop-blur-xl rounded-[32px] p-10 border border-white/20 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#8B9FFD] shadow-sm">
                      <History size={24} strokeWidth={2.5} />
                    </div>
                    <h4 className="font-black uppercase tracking-[0.2em] text-[13px]">
                      Nuestro Rol
                    </h4>
                  </div>
                  <p className="text-[15px] leading-relaxed opacity-90 font-bold">
                    Somos la herramienta tecnológica que facilita el proceso, no
                    el operador logístico que realiza tu asamblea.
                  </p>
                </div>
              </div>
            </div>

            {/* LEGAL INFO BOXES - MATCHING DESIGN */}
            <div className="bg-[#FFF4E5] border border-orange-100 rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-orange-400/20" />
              <button className="absolute top-8 right-8 text-orange-300 opacity-40 hover:opacity-100 transition">
                <X size={20} />
              </button>
              <div className="flex gap-8">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-md flex-shrink-0 group-hover:rotate-12 transition-transform">
                  <AlertTriangle size={28} strokeWidth={2.5} />
                </div>
                <div className="space-y-6">
                  <h4 className="font-black text-orange-950 text-xs uppercase tracking-[0.2em]">
                    Sobre el resultado de las votaciones
                  </h4>
                  <p className="text-orange-900/80 text-[13px] font-black leading-relaxed">
                    Los resultados emitidos en la plataforma se obtienen con
                    base en los coeficientes, según lo establecido en la Ley 675
                    de 2001:
                  </p>
                  <ul className="space-y-4 text-orange-900/70 text-[12px] font-bold">
                    <li className="flex gap-4">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                      <span>
                        <b className="text-orange-950 px-1 font-black">
                          Artículo 37. Derecho al voto:
                        </b>{" "}
                        &ldquo;El voto de cada propietario equivaldrá al
                        porcentaje del coeficiente de copropiedad del respectivo
                        bien privado.&rdquo;
                      </span>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                      <span>
                        <b className="text-orange-950 px-1 font-black">
                          Artículo 45. Quórum y mayorías:
                        </b>{" "}
                        &ldquo;Con excepción de los casos en que la ley o el
                        reglamento de propiedad horizontal exijan un quórum o
                        mayoría superior, y de las reuniones de segunda
                        convocatoria previstas en el artículo 41, la asamblea
                        general sesionará con un número plural de propietarios
                        de unidades privadas que representen más de la mitad de
                        los coeficientes de copropiedad, y tomará decisiones con
                        el voto favorable de la mitad más uno de dichos
                        coeficientes.&rdquo;
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F7FF] border border-indigo-100 rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#8B9DFF]/20" />
              <button className="absolute top-8 right-8 text-[#8B9DFF] opacity-40 hover:opacity-100 transition">
                <X size={20} />
              </button>
              <div className="flex gap-8">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#8B9DFF] shadow-md flex-shrink-0 group-hover:-rotate-12 transition-transform">
                  <Info size={28} strokeWidth={2.5} />
                </div>
                <div className="space-y-4">
                  <h4 className="font-black text-[#0E3C42] text-xs uppercase tracking-[0.2em]">
                    Importante
                  </h4>
                  <ul className="space-y-3 text-indigo-900/60 text-[12px] font-bold list-disc pl-6 leading-relaxed">
                    <li>
                      <span className="font-black text-[#0E3C42]">Intuapp</span>{" "}
                      es una herramienta tecnológica de apoyo: facilita la
                      realización de las asambleas, pero no ejerce control ni
                      supervisión sobre su desarrollo.
                    </li>
                    <li>
                      Intuapp no determina la aprobación ni la validez de las
                      decisiones.
                    </li>
                    <li>
                      No se aplica regla de tres ni se crea un nuevo 100%,
                      porque la Ley indica que las decisiones deben tomarse con
                      los coeficientes presentes en la asamblea.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t border-gray-100 bg-white/50 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-[#8B9DFF] font-black text-xl tracking-tighter opacity-30 grayscale filter">
            intuapp
          </div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
            IntuApp - Todos los derechos reservados &copy; 2025
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gauge-fill {
          from {
            stroke-dashoffset: 282;
          }
          to {
            stroke-dashoffset: var(--offset);
          }
        }
      `}</style>
    </div>
  );
};

export default FuncionarioPage;
